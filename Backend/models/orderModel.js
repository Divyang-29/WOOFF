const pool = require("../config/db");
const { getUserCart } = require("./cartModel");
const { getAddressById, getUserAddresses } = require("./addressModel");
const { validateCoupon } = require("./couponModel");

// Auto migration to ensure all required columns and tables exist in PostgreSQL
const ensureOrderColumns = async () => {
  try {
    await pool.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'prepaid';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_awb_code VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_courier_name VARCHAR(150);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_status VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_response JSONB;
    `);
    console.log("[Database] Orders schema columns verified & synchronized.");
  } catch (err) {
    console.warn("[Database] ensureOrderColumns notice:", err.message);
  }
};
ensureOrderColumns();

// Generate Unique Order Number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `WOOFF-ORD-${timestamp}-${random}`;
};

// Checkout & Create Order (Database Transaction with Coupon Integration)
const createCheckoutOrder = async (
  userId,
  { address_id, notes, coupon_code, email, customer_email, address, cart_items, items, payment_method = "prepaid" }
) => {
  const client = await pool.connect();
  try {
    // 1. Fetch or resolve delivery address
    let shippingAddress = null;
    let customerName = null;
    let customerPhone = null;
    let resolvedEmail = null;

    if (address && (address.address_line_1 || address.addressLine1)) {
      shippingAddress = {
        address_line_1: address.address_line_1 || address.addressLine1,
        address_line_2: address.address_line_2 || address.addressLine2 || null,
        city: address.city,
        state: address.state,
        postal_code: address.pincode || address.postal_code || address.postalCode,
        landmark: address.landmark || null,
        address_type: address.address_type || "Home",
      };
      customerName = address.full_name || address.fullName || address.name || null;
      customerPhone = address.phone || address.customer_phone || null;
      resolvedEmail = address.email || address.customer_email || email || customer_email || null;
    } else if (address_id && userId) {
      shippingAddress = await getAddressById(address_id, userId);
    } else if (userId) {
      const addresses = await getUserAddresses(userId);
      shippingAddress = addresses.find((a) => a.is_default) || addresses[0];
    }

    if (!shippingAddress) {
      throw new Error("No delivery address selected or provided. Please enter a shipping address.");
    }

    // 2. Fetch or resolve cart items
    let checkoutItems = [];
    const passedItems = cart_items || items;
    if (Array.isArray(passedItems) && passedItems.length > 0) {
      checkoutItems = passedItems.map((it) => ({
        product_id: it.product_id || it.id || null,
        product_name: it.product_name || it.title || it.name || "Wooff Natural Pet Toothpaste",
        sku: it.sku || it.product_sku || "WOOFF-TOOTHPASTE-50G",
        unit_price: parseFloat(it.final_price || it.unit_price || it.price || 0),
        quantity: Math.max(1, parseInt(it.quantity) || 1),
        stock: it.stock !== undefined ? it.stock : 9999,
      }));
    } else if (userId) {
      const cart = await getUserCart(userId);
      checkoutItems = (cart.items || []).map((it) => ({
        product_id: it.product_id || it.id,
        product_name: it.product_name || it.title,
        sku: it.sku || "WOOFF-TOOTHPASTE-50G",
        unit_price: parseFloat(it.unit_price || it.final_price || it.price || 0),
        quantity: parseInt(it.quantity) || 1,
        stock: it.stock !== undefined ? it.stock : 9999,
      }));
    }

    if (!checkoutItems || checkoutItems.length === 0) {
      throw new Error("Cart is empty. Add products to cart before checkout.");
    }

    // 3. Verify stock availability where product_id exists
    for (const item of checkoutItems) {
      if (item.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${item.product_name}". Requested: ${item.quantity}, Available: ${item.stock}`
        );
      }
    }

    // 4. Fetch user details if userId is present
    let user = null;
    if (userId) {
      const userRes = await client.query("SELECT * FROM users WHERE id = $1", [userId]);
      user = userRes.rows[0];
    }

    customerName = customerName || user?.username || "Customer";
    customerPhone = customerPhone || user?.phone_number || "N/A";
    resolvedEmail =
      resolvedEmail ||
      email?.trim() ||
      customer_email?.trim() ||
      user?.email ||
      (user?.phone_number ? `${user.phone_number}@wooff.care` : "customer@wooff.care");

    // 5. Calculate financial totals
    const subtotal = parseFloat(
      checkoutItems
        .reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
        .toFixed(2)
    );
    const shipping_amount = subtotal >= 400 ? 0.0 : 49.0; // Free shipping over ₹400
    let discount_amount = 0.0;
    let appliedCouponCode = null;

    if (coupon_code) {
      const couponValidation = await validateCoupon(coupon_code, subtotal);
      discount_amount = couponValidation.discount_amount;
      appliedCouponCode = couponValidation.code;
    }

    const tax_amount = 0.0; // Prices are inclusive of tax
    const total_amount = parseFloat(
      Math.max(0, subtotal + shipping_amount - discount_amount + tax_amount).toFixed(2)
    );
    const order_number = generateOrderNumber();

    // 5. Ensure column exists before transaction
    try {
      await client.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'prepaid'");
    } catch (migErr) {
      // Non-fatal if DB user has DDL restriction
    }

    // 6. Begin Database Transaction
    await client.query("BEGIN");

    // Insert Order Record
    const orderQuery = `
      INSERT INTO orders (
        order_number, user_id, subtotal, shipping_amount, discount_amount, tax_amount, total_amount,
        currency, payment_status, order_status,
        shipping_address_line_1, shipping_address_line_2, shipping_city, shipping_state,
        shipping_postal_code, shipping_landmark, shipping_address_type,
        customer_phone, customer_name, customer_email, notes, coupon_code, payment_method
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    const normalizedPaymentMethod = String(payment_method || "prepaid").toLowerCase();
    const isCod = normalizedPaymentMethod === "cod";

    const orderValues = [
      order_number,
      userId || null,
      subtotal,
      shipping_amount,
      discount_amount,
      tax_amount,
      total_amount,
      "INR",
      "pending",
      isCod ? "confirmed" : "pending",
      shippingAddress.address_line_1,
      shippingAddress.address_line_2 || null,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.postal_code,
      shippingAddress.landmark || null,
      shippingAddress.address_type || "Home",
      customerPhone,
      customerName,
      resolvedEmail,
      notes ? notes.trim() : null,
      appliedCouponCode,
      normalizedPaymentMethod,
    ];

    await client.query("SAVEPOINT order_insert_savepoint");
    let newOrder;
    try {
      const orderRes = await client.query(orderQuery, orderValues);
      newOrder = orderRes.rows[0];
      await client.query("RELEASE SAVEPOINT order_insert_savepoint");
    } catch (insertErr) {
      if (insertErr.code === "42703" && String(insertErr.message).includes("payment_method")) {
        await client.query("ROLLBACK TO SAVEPOINT order_insert_savepoint");
        console.warn("[createCheckoutOrder] 'payment_method' column missing in orders table, executing fallback insert without it");
        const fallbackOrderQuery = `
          INSERT INTO orders (
            order_number, user_id, subtotal, shipping_amount, discount_amount, tax_amount, total_amount,
            currency, payment_status, order_status,
            shipping_address_line_1, shipping_address_line_2, shipping_city, shipping_state,
            shipping_postal_code, shipping_landmark, shipping_address_type,
            customer_phone, customer_name, customer_email, notes, coupon_code
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          RETURNING *
        `;
        const fallbackValues = orderValues.slice(0, 22);
        const fbRes = await client.query(fallbackOrderQuery, fallbackValues);
        newOrder = fbRes.rows[0];
        newOrder.payment_method = normalizedPaymentMethod;
      } else {
        throw insertErr;
      }
    }

    // Increment coupon used_count if applied
    if (appliedCouponCode) {
      await client.query(
        "UPDATE coupons SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP WHERE code = $1",
        [appliedCouponCode]
      );
    }

    // Insert Order Items and Update Product Stock
    const createdItems = [];
    for (const item of checkoutItems) {
      const line_total = parseFloat((item.unit_price * item.quantity).toFixed(2));

      // Validate product_id against products table to protect foreign key constraint
      let validProductId = null;
      if (item.product_id) {
        const prodCheck = await client.query("SELECT id FROM products WHERE id = $1", [item.product_id]);
        if (prodCheck.rows.length > 0) {
          validProductId = prodCheck.rows[0].id;
        }
      }

      const itemRes = await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, unit_price, quantity, line_total
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          newOrder.id,
          validProductId,
          item.product_name,
          item.sku || "WOOFF-SKU",
          item.unit_price,
          item.quantity,
          line_total,
        ]
      );
      createdItems.push(itemRes.rows[0]);

      // Decrement Product Stock if product exists
      if (validProductId) {
        await client.query(
          "UPDATE products SET stock = GREATEST(0, stock - $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [item.quantity, validProductId]
        );
      }
    }

    // Clear User Cart if logged in
    if (userId) {
      await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    }

    await client.query("COMMIT");

    try {
      const { clearProductCache } = require("../controllers/productController");
      if (typeof clearProductCache === "function") {
        clearProductCache();
      }
    } catch (e) {}

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

    try {
      const { clearProductCache } = require("../controllers/productController");
      if (typeof clearProductCache === "function") {
        clearProductCache();
      }
    } catch (e) {}

    return updateRes.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Update Order Tracking Status by Shiprocket AWB Code
const updateOrderByShiprocketAwb = async ({
  awbCode,
  orderId,
  orderStatus,
  shiprocketStatus,
  courierName,
  rawPayload,
}) => {
  const cleanAwb = awbCode ? String(awbCode).trim() : null;
  const cleanOrderId = orderId ? String(orderId).trim() : null;

  if (!cleanAwb && !cleanOrderId) {
    throw new Error("Either awbCode or orderId is required to update tracking status.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Find order primarily by AWB code
    let orderRes = cleanAwb
      ? await client.query("SELECT * FROM orders WHERE shiprocket_awb_code = $1 FOR UPDATE", [cleanAwb])
      : { rows: [] };

    // Fallback: Find by order_number or shiprocket_order_id
    if (orderRes.rows.length === 0 && cleanOrderId) {
      orderRes = await client.query(
        "SELECT * FROM orders WHERE order_number = $1 OR shiprocket_order_id = $1 FOR UPDATE",
        [cleanOrderId]
      );
    }

    const order = orderRes.rows[0];
    if (!order) {
      console.warn(
        `[Shiprocket Webhook] No matching order found for AWB: "${cleanAwb}" / OrderID: "${cleanOrderId}".`
      );
      await client.query("ROLLBACK");
      return null;
    }

    // 2. Prepare dynamic update fields
    const updates = [];
    const values = [];

    // Set AWB code if not yet saved on order
    if (cleanAwb && !order.shiprocket_awb_code) {
      values.push(cleanAwb);
      updates.push(`shiprocket_awb_code = $${values.length}`);
    }

    if (orderStatus) {
      values.push(orderStatus);
      updates.push(`order_status = $${values.length}`);
    }

    if (shiprocketStatus) {
      values.push(shiprocketStatus);
      updates.push(`shiprocket_status = $${values.length}`);
    }

    if (courierName) {
      values.push(courierName);
      updates.push(`shiprocket_courier_name = $${values.length}`);
    }

    if (rawPayload) {
      values.push(JSON.stringify(rawPayload));
      updates.push(`shiprocket_response = $${values.length}`);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    values.push(order.id);
    const updateQuery = `
      UPDATE orders
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const updatedRes = await client.query(updateQuery, values);
    await client.query("COMMIT");

    console.log(
      `[Shiprocket Webhook Success] Updated Order #${order.id} (${order.order_number}) -> order_status: "${orderStatus || order.order_status}", shiprocket_status: "${shiprocketStatus}"`
    );

    return updatedRes.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Get Order Tracking Information by Order Number (Public Customer Tracking)
const getOrderByOrderNumber = async (orderNumber) => {
  if (!orderNumber || typeof orderNumber !== "string") {
    return null;
  }

  const cleanOrderNumber = orderNumber.trim();
  const orderRes = await pool.query(
    `SELECT 
      id, order_number, order_status, payment_status, currency,
      subtotal, shipping_amount, discount_amount, tax_amount, total_amount,
      shipping_address_line_1, shipping_address_line_2, shipping_city, shipping_state, shipping_postal_code,
      customer_name, customer_phone, customer_email,
      shiprocket_order_id, shiprocket_shipment_id, shiprocket_awb_code, shiprocket_courier_name, shiprocket_status,
      created_at, updated_at
     FROM orders 
     WHERE UPPER(order_number) = UPPER($1) 
     LIMIT 1`,
    [cleanOrderNumber]
  );

  const order = orderRes.rows[0];
  if (!order) return null;

  // Fetch Line Items for tracking display
  const itemsRes = await pool.query(
    `SELECT id, product_id, product_name, product_sku, unit_price, quantity, line_total 
     FROM order_items 
     WHERE order_id = $1 
     ORDER BY id ASC`,
    [order.id]
  );

  return {
    ...order,
    items: itemsRes.rows,
  };
};

module.exports = {
  ensureOrderColumns,
  generateOrderNumber,
  createCheckoutOrder,
  getUserOrders,
  getOrderDetailsById,
  updateOrderStatusByAdmin,
  updateOrderByShiprocketAwb,
  getOrderByOrderNumber,
};

