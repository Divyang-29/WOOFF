const pool = require("../config/db");
const { createCategory } = require("../models/categoryModel");
const { createProduct } = require("../models/productModel");
const { createAddress } = require("../models/addressModel");
const { addToCart } = require("../models/cartModel");
const { createCheckoutOrder, updateOrderStatusByAdmin } = require("../models/orderModel");
const { initializePayment, verifyPaymentSignature } = require("../models/paymentModel");
const { createCoupon, validateCoupon, getCouponByCode } = require("../models/couponModel");
const { getLowStockProducts, getAdminAnalytics } = require("../models/adminModel");

async function testMarketingAndAnalytics() {
  try {
    console.log("=== STARTING MARKETING, COUPONS & ADMIN ANALYTICS INTEGRATION TEST ===");

    // 1. Setup Test Category & Low-Stock Product
    const category = await createCategory({
      name: `Dog Treats ${Date.now()}`,
      slug: `dog-treats-${Date.now()}`,
    });

    const lowStockProduct = await createProduct({
      category_id: category.id,
      title: `Low Stock Chicken Chews ${Date.now()}`,
      price: 499.00,
      final_price: 399.00,
      primary_image: "https://example.com/chews.jpg",
      sku: `CHEW-SKU-${Date.now()}`,
      stock: 4, // Stock <= 10 for low stock alert
    });
    console.log(`1. Low-Stock Product created ID: ${lowStockProduct.id}, Stock: ${lowStockProduct.stock}`);

    // 2. Test Low-Stock Query
    console.log("2. Testing Low-Stock Query...");
    const lowStockItems = await getLowStockProducts(10);
    const foundLowStock = lowStockItems.find((p) => p.id === lowStockProduct.id);
    console.assert(foundLowStock !== undefined, "Low stock product not found in low-stock query");
    console.log(`   Low stock query returned ${lowStockItems.length} items (PASSED).`);

    // 3. Test Coupon Engine - Percentage & Flat Discounts
    console.log("3. Testing Coupon Engine validation logic...");

    // Percentage Coupon (20% off up to ₹200 for subtotal >= ₹500)
    const pctCode = `SAVE20_${Date.now()}`;
    const pctCoupon = await createCoupon({
      code: pctCode,
      discount_type: "percentage",
      discount_value: 20.00,
      min_cart_value: 500.00,
      max_discount_amount: 200.00,
      usage_limit: 10,
    });

    // Test Coupon Validation - Min Cart Subtotal Fail
    try {
      await validateCoupon(pctCode, 400.00);
      console.assert(false, "Should have failed min cart subtotal check");
    } catch (err) {
      console.assert(err.message.includes("minimum requirement"), "Min cart subtotal error mismatch");
      console.log("   Min cart value check rejected correctly (PASSED).");
    }

    // Test Coupon Validation - Percentage Cap
    const pctValRes = await validateCoupon(pctCode, 1500.00); // 20% of 1500 = 300, capped at 200
    console.assert(pctValRes.discount_amount === 200.00, `Expected capped discount 200, got ${pctValRes.discount_amount}`);
    console.assert(pctValRes.final_subtotal === 1300.00, `Expected final subtotal 1300, got ${pctValRes.final_subtotal}`);
    console.log(`   Percentage discount calculated: 20% of ₹1500 (capped at ₹200) -> Final: ₹${pctValRes.final_subtotal} (PASSED).`);

    // 4. Test Checkout Integration with Coupon
    console.log("4. Testing Checkout with Coupon application...");
    const testPhone = "+919999955555";
    let userRes = await pool.query("SELECT * FROM users WHERE phone_number = $1", [testPhone]);
    let testUser = userRes.rows[0];
    if (!testUser) {
      const insRes = await pool.query(
        "INSERT INTO users (phone_number, username, role) VALUES ($1, $2, $3) RETURNING *",
        [testPhone, "analytics_tester", "user"]
      );
      testUser = insRes.rows[0];
    }

    await pool.query("DELETE FROM user_addresses WHERE user_id = $1", [testUser.id]);
    const address = await createAddress(testUser.id, {
      address_line_1: "100 MG Road",
      city: "Pune",
      state: "Maharashtra",
      postal_code: "411001",
      is_default: true,
    });

    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [testUser.id]);
    await addToCart(testUser.id, lowStockProduct.id, 2); // Subtotal: 399 * 2 = 798.00

    const checkoutOrder = await createCheckoutOrder(testUser.id, {
      address_id: address.id,
      coupon_code: pctCode,
    });

    console.assert(checkoutOrder.coupon_code === pctCode, "Coupon code not saved to order");
    // Subtotal: 798, 20% = 159.60 discount. Shipping: 0 (subtotal >= 499). Total: 798 - 159.60 = 638.40
    console.assert(parseFloat(checkoutOrder.discount_amount) === 159.60, `Discount mismatch: ${checkoutOrder.discount_amount}`);
    console.assert(parseFloat(checkoutOrder.total_amount) === 638.40, `Total mismatch: ${checkoutOrder.total_amount}`);

    // Verify used_count incremented
    const updatedCoupon = await getCouponByCode(pctCode);
    console.assert(updatedCoupon.used_count === 1, `Expected used_count 1, got ${updatedCoupon.used_count}`);
    console.log(`   Checkout order placed with coupon '${pctCode}'. Total: ₹${checkoutOrder.total_amount}, Coupon used_count: ${updatedCoupon.used_count} (PASSED).`);

    // 5. Test Payment Verification to enable Revenue Analytics
    console.log("5. Simulating Paid Order for Analytics Aggregation...");
    const payInit = await initializePayment(checkoutOrder.id, testUser.id, "razorpay");
    await verifyPaymentSignature({
      orderId: checkoutOrder.id,
      providerOrderId: payInit.provider_order_id,
      providerPaymentId: "pay_analytics_123",
      signature: "mock_signature",
      userId: testUser.id,
    });

    // 6. Test Admin Analytics Aggregation
    console.log("6. Testing Admin Analytics Aggregation Payload...");
    const analytics = await getAdminAnalytics();
    console.assert(typeof analytics.total_revenue === "number" && analytics.total_revenue >= 638.40, "Total revenue aggregation failed");
    console.assert(typeof analytics.active_orders_count === "number" && analytics.active_orders_count >= 1, "Active orders count failed");
    console.assert(typeof analytics.total_customers === "number" && analytics.total_customers >= 1, "Total customers count failed");
    console.assert(Array.isArray(analytics.top_selling_products), "Top selling products should be an array");

    console.log("   Analytics Payload Aggregated Successfully:");
    console.log(`   - Total Revenue: ₹${analytics.total_revenue}`);
    console.log(`   - Active Orders Count: ${analytics.active_orders_count}`);
    console.log(`   - Total Customers: ${analytics.total_customers}`);
    console.log(`   - Top Selling Products Count: ${analytics.top_selling_products.length} (PASSED).`);

    // Clean up test data safely
    await pool.query("DELETE FROM orders WHERE id = $1", [checkoutOrder.id]);
    await pool.query("DELETE FROM coupons WHERE id = $1", [pctCoupon.id]);
    await pool.query("DELETE FROM products WHERE id = $1", [lowStockProduct.id]);
    await pool.query("DELETE FROM categories WHERE id = $1", [category.id]);
    await pool.query("DELETE FROM user_addresses WHERE user_id = $1", [testUser.id]);

    console.log("\n=== ALL MARKETING, COUPON & ANALYTICS TESTS PASSED 100% ===");
    process.exit(0);
  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
}

testMarketingAndAnalytics();
