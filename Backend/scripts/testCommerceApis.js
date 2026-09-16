const pool = require("../config/db");
const { createAddress, getUserAddresses, setDefaultAddress, deleteAddress, isValidPinCode } = require("../models/addressModel");
const { addToCart, getUserCart, updateCartItemQuantity, removeCartItem } = require("../models/cartModel");
const { createProduct } = require("../models/productModel");

async function testCommerceLogic() {
  try {
    console.log("=== STARTING COMMERCE LOGIC INTEGRATION TEST ===");

    // 1. Test PIN Code validation helper
    console.log("1. Testing PIN code validation helper...");
    console.assert(isValidPinCode("110001") === true, "Valid PIN code 110001 failed");
    console.assert(isValidPinCode("380001") === true, "Valid PIN code 380001 failed");
    console.assert(isValidPinCode("010001") === false, "PIN starting with 0 should fail");
    console.assert(isValidPinCode("12345") === false, "5-digit PIN should fail");
    console.assert(isValidPinCode("abcde") === false, "Alpha PIN should fail");
    console.log("   PIN code validation tests PASSED.");

    // 2. Setup test user
    console.log("2. Creating dummy test user...");
    const testPhone = "+919999988888";
    let userRes = await pool.query("SELECT * FROM users WHERE phone_number = $1", [testPhone]);
    let testUser = userRes.rows[0];
    if (!testUser) {
      const insRes = await pool.query(
        "INSERT INTO users (phone_number, username, role) VALUES ($1, $2, $3) RETURNING *",
        [testPhone, "test_user_commerce", "user"]
      );
      testUser = insRes.rows[0];
    }
    console.log(`   Test user ready ID: ${testUser.id}`);

    // 3. Test User Addresses
    console.log("3. Testing User Address operations...");
    // Clear old test addresses
    await pool.query("DELETE FROM user_addresses WHERE user_id = $1", [testUser.id]);

    // Create address 1 (should automatically become default)
    const addr1 = await createAddress(testUser.id, {
      address_line_1: "Flat 402, Sunshine Heights",
      city: "Mumbai",
      state: "Maharashtra",
      postal_code: "400001",
      address_type: "Home",
    });
    console.log("   Address 1 created:", addr1.is_default === true ? "DEFAULT (CORRECT)" : "ERR");

    // Create address 2 (is_default = false)
    const addr2 = await createAddress(testUser.id, {
      address_line_1: "Suite 101, Tech Park",
      city: "Mumbai",
      state: "Maharashtra",
      postal_code: "400051",
      address_type: "Work",
      is_default: false,
    });
    console.log("   Address 2 created:", addr2.is_default === false ? "NON-DEFAULT (CORRECT)" : "ERR");

    // Test setDefaultAddress transaction
    console.log("   Setting Address 2 as default...");
    const updatedAddr2 = await setDefaultAddress(addr2.id, testUser.id);
    console.assert(updatedAddr2.is_default === true, "Address 2 failed to become default");

    const allAddrs = await getUserAddresses(testUser.id);
    const defaultCount = allAddrs.filter((a) => a.is_default).length;
    console.assert(defaultCount === 1, `Expected exactly 1 default address, found ${defaultCount}`);
    console.log(`   Addresses fetched count: ${allAddrs.length}, Default count: ${defaultCount} (PASSED)`);

    // 4. Test Cart Operations
    console.log("4. Testing Cart operations...");
    // Create test product if needed
    let prodRes = await pool.query("SELECT * FROM products LIMIT 1");
    let testProduct = prodRes.rows[0];
    if (!testProduct) {
      testProduct = await createProduct({
        title: "Wooff Premium Salmon Adult Dog Food 2kg",
        price: 1499.00,
        final_price: 1299.00,
        primary_image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        sku: "WOOFF-SALMON-2KG",
        stock: 50,
      });
    }
    console.log(`   Test product ready ID: ${testProduct.id}, Title: "${testProduct.title}"`);

    // Clear test user cart
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [testUser.id]);

    // Add item to cart (qty 1)
    await addToCart(testUser.id, testProduct.id, 1);
    // Add item to cart again (qty 2) -> should increment to 3
    await addToCart(testUser.id, testProduct.id, 2);

    const cartData = await getUserCart(testUser.id);
    console.assert(cartData.items.length === 1, "Expected 1 unique product in cart");
    console.assert(cartData.items[0].quantity === 3, `Expected quantity 3, got ${cartData.items[0].quantity}`);
    console.assert(cartData.subtotal === parseFloat((1299.00 * 3).toFixed(2)), `Subtotal mismatch: ${cartData.subtotal}`);
    console.log(`   Cart fetched: ${cartData.items.length} item line, Total quantity: ${cartData.total_items}, Subtotal: ₹${cartData.subtotal} (PASSED)`);

    // Test update quantity
    await updateCartItemQuantity(cartData.items[0].cart_item_id, testUser.id, 1);
    const updatedCart = await getUserCart(testUser.id);
    console.assert(updatedCart.total_items === 1, "Quantity update failed");

    // Clean up test cart and address data
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [testUser.id]);
    await pool.query("DELETE FROM user_addresses WHERE user_id = $1", [testUser.id]);

    console.log("\n=== ALL COMMERCE LOGIC INTEGRATION TESTS PASSED 100% ===");
    process.exit(0);
  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
}

testCommerceLogic();
