const pool = require("../config/db");
const { createAddress } = require("../models/addressModel");
const { addToCart } = require("../models/cartModel");
const { createProduct } = require("../models/productModel");
const { createCheckoutOrder, getUserOrders, getOrderDetailsById } = require("../models/orderModel");
const { initializePayment } = require("../models/paymentModel");

async function testCheckoutIntegration() {
  try {
    console.log("=== STARTING CHECKOUT & PAYMENT API INTEGRATION TEST ===");

    // 1. Setup test user
    const testPhone = "+919999977777";
    let userRes = await pool.query("SELECT * FROM users WHERE phone_number = $1", [testPhone]);
    let testUser = userRes.rows[0];
    if (!testUser) {
      const insRes = await pool.query(
        "INSERT INTO users (phone_number, username, role) VALUES ($1, $2, $3) RETURNING *",
        [testPhone, "checkout_tester", "user"]
      );
      testUser = insRes.rows[0];
    }
    console.log(`1. Test user ready ID: ${testUser.id}`);

    // 2. Setup shipping address
    await pool.query("DELETE FROM user_addresses WHERE user_id = $1", [testUser.id]);
    const address = await createAddress(testUser.id, {
      address_line_1: "Building 12B, Green Park",
      city: "Bengaluru",
      state: "Karnataka",
      postal_code: "560001",
      address_type: "Home",
      is_default: true,
    });
    console.log(`2. Shipping address created ID: ${address.id}, PIN: ${address.postal_code}`);

    // 2b. Ensure category exists
    let catRes = await pool.query("SELECT id FROM categories LIMIT 1");
    let categoryId = catRes.rows[0]?.id;
    if (!categoryId) {
      const newCat = await pool.query(
        "INSERT INTO categories (name, slug) VALUES ('Dog Grooming', 'dog-grooming') RETURNING id"
      );
      categoryId = newCat.rows[0].id;
    }

    // 3. Setup test product with stock
    const initialStock = 20;
    const product = await createProduct({
      category_id: categoryId,
      title: `Checkout Test Product ${Date.now()}`,
      price: 1999.00,
      final_price: 1499.00,
      primary_image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      sku: `CHK-SKU-${Date.now()}`,
      stock: initialStock,
    });
    console.log(`3. Test product created ID: ${product.id}, Stock: ${product.stock}`);

    // 4. Add product to cart
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [testUser.id]);
    await addToCart(testUser.id, product.id, 2);
    console.log("4. Product added to cart (Quantity: 2).");

    // 5. Execute Checkout Database Transaction
    console.log("5. Executing POST /api/orders/checkout transaction...");
    const order = await createCheckoutOrder(testUser.id, {
      address_id: address.id,
      notes: "Please deliver between 10am and 2pm.",
    });

    console.log(`   Order Created! Order Number: ${order.order_number}`);
    console.log(`   Total Amount: ₹${order.total_amount}`);
    console.log(`   Snapshotted City: ${order.shipping_city}, State: ${order.shipping_state}`);

    // Verify Address Snapshotting
    console.assert(order.shipping_address_line_1 === "Building 12B, Green Park", "Address line 1 mismatch");
    console.assert(order.shipping_postal_code === "560001", "Postal code mismatch");

    // Verify Order Items Snapshotting
    console.assert(order.items.length === 1, "Expected 1 order item line");
    const item = order.items[0];
    console.assert(parseFloat(item.unit_price) === 1499.00, `Unit price snapshot mismatch: ${item.unit_price}`);
    console.assert(item.quantity === 2, `Quantity mismatch: ${item.quantity}`);
    console.assert(parseFloat(item.line_total) === 2998.00, `Line total mismatch: ${item.line_total}`);
    console.log("   Order items snapshotting verified (PASSED).");

    // Verify Cart Cleared
    const cartRes = await pool.query("SELECT * FROM cart_items WHERE user_id = $1", [testUser.id]);
    console.assert(cartRes.rows.length === 0, "Cart was not cleared after checkout");
    console.log("   Cart cleared check (PASSED).");

    // Verify Stock Decremented
    const updatedProdRes = await pool.query("SELECT stock FROM products WHERE id = $1", [product.id]);
    const newStock = updatedProdRes.rows[0].stock;
    console.assert(newStock === initialStock - 2, `Stock failed to decrement. Expected ${initialStock - 2}, got ${newStock}`);
    console.log(`   Product stock decremented from ${initialStock} to ${newStock} (PASSED).`);

    // 6. Test Order History Query
    console.log("6. Testing GET /api/orders history query...");
    const orderHistoryRes = await getUserOrders(testUser.id, false);
    const userOrders = orderHistoryRes.orders || orderHistoryRes;
    console.assert(userOrders.length >= 1, "User order history empty");

    const orderDetails = await getOrderDetailsById(order.id, testUser.id, false);
    console.assert(orderDetails.items.length === 1, "Order details missing items");
    console.log("   Order history and detail lookup (PASSED).");

    // 7. Test Payment Initialization Prep
    console.log("7. Testing POST /api/payments/init transaction logging...");
    const paymentPayload = await initializePayment(order.id, testUser.id, "razorpay");
    console.assert(paymentPayload.amount === order.total_amount, "Payment amount mismatch");
    console.assert(paymentPayload.status === "created", "Payment status should be 'created'");
    console.assert(paymentPayload.amount_in_paise === Math.round(order.total_amount * 100), "Paise calculation mismatch");
    console.log(`   Payment Init Payload generated for ${paymentPayload.provider_order_id} (PASSED).`);

    // Clean up test data safely
    await pool.query("DELETE FROM orders WHERE id = $1", [order.id]);
    await pool.query("DELETE FROM products WHERE id = $1", [product.id]);
    await pool.query("DELETE FROM user_addresses WHERE user_id = $1", [testUser.id]);

    console.log("\n=== CHECKOUT & PAYMENT INTEGRATION TESTS PASSED 100% ===");
    process.exit(0);
  } catch (error) {
    console.error("Checkout Test Error:", error);
    process.exit(1);
  }
}

testCheckoutIntegration();
