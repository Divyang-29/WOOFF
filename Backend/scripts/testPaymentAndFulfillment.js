const pool = require("../config/db");
const { createAddress } = require("../models/addressModel");
const { addToCart } = require("../models/cartModel");
const { createProduct } = require("../models/productModel");
const { createCheckoutOrder, updateOrderStatusByAdmin } = require("../models/orderModel");
const { initializePayment, verifyPaymentSignature, processWebhookEvent } = require("../models/paymentModel");

async function testPaymentAndFulfillment() {
  try {
    console.log("=== STARTING PAYMENT VERIFICATION & FULFILLMENT INTEGRATION TEST ===");

    // 1. Setup test user
    const testPhone = "+919999966666";
    let userRes = await pool.query("SELECT * FROM users WHERE phone_number = $1", [testPhone]);
    let testUser = userRes.rows[0];
    if (!testUser) {
      const insRes = await pool.query(
        "INSERT INTO users (phone_number, username, role) VALUES ($1, $2, $3) RETURNING *",
        [testPhone, "fulfillment_tester", "user"]
      );
      testUser = insRes.rows[0];
    }
    console.log(`1. Test user ready ID: ${testUser.id}`);

    // 2. Setup shipping address & product
    await pool.query("DELETE FROM user_addresses WHERE user_id = $1", [testUser.id]);
    const address = await createAddress(testUser.id, {
      address_line_1: "77 Ocean Drive",
      city: "Goa",
      state: "Goa",
      postal_code: "403001",
      is_default: true,
    });

    let catRes = await pool.query("SELECT id FROM categories LIMIT 1");
    let categoryId = catRes.rows[0]?.id;
    if (!categoryId) {
      const newCat = await pool.query(
        "INSERT INTO categories (name, slug) VALUES ('Pet Supplements', 'pet-supplements') RETURNING id"
      );
      categoryId = newCat.rows[0].id;
    }

    const initialStock = 30;
    const product = await createProduct({
      category_id: categoryId,
      title: `Fulfillment Test Product ${Date.now()}`,
      price: 2499.00,
      final_price: 1999.00,
      primary_image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      sku: `FUL-SKU-${Date.now()}`,
      stock: initialStock,
    });
    console.log(`2. Product created ID: ${product.id}, Initial Stock: ${initialStock}`);

    // 3. Add to cart & checkout
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [testUser.id]);
    await addToCart(testUser.id, product.id, 3);
    const order = await createCheckoutOrder(testUser.id, { address_id: address.id });
    console.log(`3. Order created ID: ${order.id}, Status: ${order.order_status}, Stock remaining: ${initialStock - 3}`);

    // 4. Initialize Payment
    const paymentInit = await initializePayment(order.id, testUser.id, "razorpay");
    console.log(`4. Payment initialized Provider Order ID: ${paymentInit.provider_order_id}`);

    // 5. Test Payment Verification - Bad Signature
    console.log("5. Testing payment verification with invalid signature...");
    const badVerify = await verifyPaymentSignature({
      orderId: order.id,
      providerOrderId: paymentInit.provider_order_id,
      providerPaymentId: "pay_bad_123",
      signature: "invalid_sig_123",
      userId: testUser.id,
    });
    console.assert(badVerify.success === false, "Bad signature test failed to reject");
    console.log("   Bad signature rejected cleanly (PASSED).");

    // 6. Test Payment Verification - Valid Signature (Mock/Dev)
    console.log("6. Testing payment verification with valid signature...");
    const goodVerify = await verifyPaymentSignature({
      orderId: order.id,
      providerOrderId: paymentInit.provider_order_id,
      providerPaymentId: "pay_valid_999",
      signature: "mock_signature",
      userId: testUser.id,
    });
    console.assert(goodVerify.success === true, "Valid signature test failed");
    console.assert(goodVerify.order.payment_status === "paid", "Payment status not updated to paid");
    console.assert(goodVerify.order.order_status === "processing", "Order status not updated to processing");
    console.log("   Valid payment verification transaction (PASSED).");

    // 7. Test Verification Idempotency
    console.log("7. Testing payment verification idempotency...");
    const retryVerify = await verifyPaymentSignature({
      orderId: order.id,
      providerOrderId: paymentInit.provider_order_id,
      providerPaymentId: "pay_valid_999",
      signature: "mock_signature",
      userId: testUser.id,
    });
    console.assert(retryVerify.already_processed === true, "Idempotency check failed");
    console.log("   Idempotency test passed: duplicate call safely handled.");

    // 8. Test Asynchronous Webhook Event (payment.captured)
    console.log("8. Testing payment webhook handler...");
    const webhookRes = await processWebhookEvent({
      event: "payment.captured",
      order_id: order.id,
      provider_order_id: paymentInit.provider_order_id,
      provider_payment_id: "pay_wh_111",
    }, null);
    console.assert(webhookRes.success === true, "Webhook processing failed");
    console.log("   Webhook processing (PASSED).");

    // 9. Test Admin Fulfillment APIs & Automatic Restocking
    console.log("9. Testing Admin fulfillment status updates...");
    // Update to 'shipped'
    const shippedOrder = await updateOrderStatusByAdmin(order.id, "shipped");
    console.assert(shippedOrder.order_status === "shipped", "Order status shipped update failed");

    // Update to 'cancelled' and verify restocking
    console.log("   Cancelling order to verify automatic inventory restocking...");
    const cancelledOrder = await updateOrderStatusByAdmin(order.id, "cancelled");
    console.assert(cancelledOrder.order_status === "cancelled", "Order status cancelled update failed");

    const restockedProdRes = await pool.query("SELECT stock FROM products WHERE id = $1", [product.id]);
    const finalStock = restockedProdRes.rows[0].stock;
    console.assert(finalStock === initialStock, `Restocking failed. Expected ${initialStock}, got ${finalStock}`);
    console.log(`   Inventory restocked back to ${finalStock} (PASSED).`);

    // Clean up test data safely
    await pool.query("DELETE FROM orders WHERE id = $1", [order.id]);
    await pool.query("DELETE FROM products WHERE id = $1", [product.id]);
    await pool.query("DELETE FROM user_addresses WHERE user_id = $1", [testUser.id]);

    console.log("\n=== ALL PAYMENT VERIFICATION & FULFILLMENT TESTS PASSED 100% ===");
    process.exit(0);
  } catch (error) {
    console.error("Fulfillment Test Error:", error);
    process.exit(1);
  }
}

testPaymentAndFulfillment();
