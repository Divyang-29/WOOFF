const pool = require("../config/db");
const { getUserCart } = require("./cartModel");
const { getAddressById, getUserAddresses } = require("./addressModel");
const { validateCoupon } = require("./couponModel");

// Generate Unique Order Number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `WOOFF-ORD-${timestamp}-${random}`;
};

// Checkout & Create Order (Database Transaction with Coupon Integration)
const createCheckoutOrder = async (userId, { address_id, notes, coupon_code }) => {
  const client = await pool.connect();
  try {
    // 1. Fetch delivery address
    let shippingAddress = null;
    if (address_id) {
      shippingAddress = await getAddressById(address_id, userId);
    } else {
      const addresses = await getUserAddresses(userId);
      shippingAddress = addresses.find((a) => a.is_default) || addresses[0];
    }

    if (!shippingAddress) {
      throw new Error("No delivery address selected or found. Please add a shipping address.");
    }

    // 2. Fetch cart items
    const cart = await getUserCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new Error("Cart is empty. Add products to cart before checkout.");
    }

    // 3. Verify stock availability
    for (const item of cart.items) {
      if (item.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${item.product_name}". Requested: ${item.quantity}, Available: ${item.stock}`);
      }
    }

    // 4. Fetch user details for phone and name snapshot
    const userRes = await client.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = userRes.rows[0];

    // 5. Calculate financial totals and validate coupon if provided
    const subtotal = cart.subtotal;
    const shipping_amount = subtotal >= 499 ? 0.00 : 49.00; // Free shipping over ₹499
    let discount_amount = 0.00;
    let appliedCouponCode = null;

    if (coupon_code) {
      const couponValidation = await validateCoupon(coupon_code, subtotal);
      discount_amount = couponValidation.discount_amount;
      appliedCouponCode = couponValidation.code;
    }

    const tax_amount = 0.00; // Prices are inclusive of tax
    const total_amount = parseFloat((Math.max(0, subtotal + shipping_amount - discount_amount + tax_amount)).toFixed(2));
    const order_number = generateOrderNumber();

    // 6. Begin Database Transaction
    await client.query("BEGIN");

    // Insert Order Record with Snapshotted Shipping Address & Coupon
    const orderQuery = `
      INSERT INTO orders (
        order_number, user_id, subtotal, shipping_amount, discount_amount, tax_amount, total_amount,
        currency, payment_status, order_status,
        shipping_address_line_1, shipping_address_line_2, shipping_city, shipping_state,
        shipping_postal_code, shipping_landmark, shipping_address_type,
        customer_phone, customer_name, notes, coupon_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const orderValues = [
      order_number,
      userId,
      subtotal,
      shipping_amount,
      discount_amount,
      tax_amount,
      total_amount,
      "INR",
      "pending",
      "pending",
      shippingAddress.address_line_1,
      shippingAddress.address_line_2 || null,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.postal_code,
      shippingAddress.landmark || null,
      shippingAddress.address_type || "Home",
      user ? user.phone_number : "N/A",
      user ? user.username : "Customer",
      notes ? notes.trim() : null,
      appliedCouponCode,
    ];

    const orderRes = await client.query(orderQuery, orderValues);
    const newOrder = orderRes.rows[0];

    // Increment coupon used_count if applied
    if (appliedCouponCode) {
      await client.query(
        "UPDATE coupons SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP WHERE code = $1",
        [appliedCouponCode]
      );
    }

    // Insert Order Items and Update Product Stock
    const createdItems = [];
    for (const item of cart.items) {
      const line_total = parseFloat((item.unit_price * item.quantity).toFixed(2));

      const itemRes = await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, unit_price, quantity, line_total
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          newOrder.id,
          item.product_id,
          item.product_name,
          item.sku || "WOOFF-SKU",
          item.unit_price,
          item.quantity,
          line_total,
        ]
      );
      createdItems.push(itemRes.rows[0]);

      // Decrement Product Stock
      await client.query(
        "UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    // Clear User Cart
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    await client.query("COMMIT");

    return {
      ...newOrder,
      items: createdItems,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Get User Orders List with Pagination & Filtering
const getUserOrders = async (userId, options = {}) => {
  const isAdmin = typeof options === "boolean" ? options : Boolean(options.isAdmin);
  const page = typeof options === "object" ? options.page : 1;
  const limit = typeof options === "object" ? options.limit : 20;
  const status = typeof options === "object" ? options.status : null;
  const paymentStatus = typeof options === "object" ? options.payment_status : null;

  const conditions = [];
  const values = [];

  if (!isAdmin) {
    values.push(userId);
    conditions.push(`o.user_id = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`o.order_status = $${values.length}`);
  }

  if (paymentStatus) {
    values.push(paymentStatus);
    conditions.push(`o.payment_status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // 1. Get Total Count
  const countQuery = `
    SELECT COUNT(*)::int as total
    FROM orders o
    ${whereClause}
  `;
  const countRes = await pool.query(countQuery, values);
  const totalCount = countRes.rows[0]?.total || 0;

  // 2. Pagination Calculations
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const offset = (parsedPage - 1) * parsedLimit;

  values.push(parsedLimit);
  const limitIdx = values.length;
  values.push(offset);
  const offsetIdx = values.length;

  const dataQuery = `
    SELECT 
      o.*,
      COUNT(oi.id)::int as total_items_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${whereClause}
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const result = await pool.query(dataQuery, values);

  return {
    orders: result.rows,
    pagination: {
      total_count: totalCount,
      page: parsedPage,
      limit: parsedLimit,
      total_pages: Math.ceil(totalCount / parsedLimit),
    },
  };
};

// Get Full Order Details
const getOrderDetailsById = async (orderId, userId, isAdmin = false) => {
  let orderQuery = `SELECT * FROM orders WHERE id = $1`;
  const values = [orderId];

  if (!isAdmin) {
    orderQuery += ` AND user_id = $2`;
    values.push(userId);
  }

  const orderRes = await pool.query(orderQuery, values);
  const order = orderRes.rows[0];

  if (!order) return null;

  // Fetch Snapshotted Line Items
  const itemsRes = await pool.query(
    "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC",
    [orderId]
  );

  // Fetch Payment Transactions
  const paymentsRes = await pool.query(
    "SELECT * FROM payment_transactions WHERE order_id = $1 ORDER BY created_at DESC",
    [orderId]
  );

  return {
    ...order,
    items: itemsRes.rows,
    transactions: paymentsRes.rows,
  };
};

// Admin Order Status Fulfillment & Automatic Restocking on Cancellation
const updateOrderStatusByAdmin = async (orderId, newStatus) => {
  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`Invalid order status. Must be one of: ${allowedStatuses.join(", ")}`);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch existing order details
    const orderRes = await client.query("SELECT * FROM orders WHERE id = $1 FOR UPDATE", [orderId]);
    const existingOrder = orderRes.rows[0];

    if (!existingOrder) {
      await client.query("ROLLBACK");
      return null;
    }

    // Automatic Inventory Restocking if cancelling an order that wasn't already cancelled
    if (newStatus === "cancelled" && existingOrder.order_status !== "cancelled") {
      const itemsRes = await client.query("SELECT product_id, quantity FROM order_items WHERE order_id = $1", [orderId]);
      for (const item of itemsRes.rows) {
        if (item.product_id) {
          await client.query(
            "UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [item.quantity, item.product_id]
          );
        }
      }
    }

    // Update Order Status
    const updateRes = await client.query(
      "UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [newStatus, orderId]
    );

    await client.query("COMMIT");
    return updateRes.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  generateOrderNumber,
  createCheckoutOrder,
  getUserOrders,
  getOrderDetailsById,
  updateOrderStatusByAdmin,
};
