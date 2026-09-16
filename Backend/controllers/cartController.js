const { getProductBySlugOrId } = require("../models/productModel");
const {
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearUserCart,
} = require("../models/cartModel");

// Get Cart Items
const getCartHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await getUserCart(userId);
    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart items.",
    });
  }
};

// Add Item to Cart
const addToCartHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, productId, quantity = 1 } = req.body;
    const targetProductId = product_id || productId;

    if (!targetProductId) {
      return res.status(400).json({
        success: false,
        message: "product_id is required.",
      });
    }

    const parsedQty = parseInt(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0.",
      });
    }

    // Verify product exists
    const product = await getProductBySlugOrId(targetProductId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const item = await addToCart(userId, parseInt(targetProductId), parsedQty);

    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully.",
      item,
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add item to cart.",
    });
  }
};

// Update Cart Item Quantity
const updateCartQuantityHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    const parsedQty = parseInt(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0.",
      });
    }

    const updated = await updateCartItemQuantity(parseInt(id), userId, parsedQty);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item quantity updated successfully.",
      item: updated,
    });
  } catch (error) {
    console.error("Update Cart Quantity Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart item quantity.",
    });
  }
};

// Remove Cart Item
const removeCartItemHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (id === "clear") {
      await clearUserCart(userId);
      return res.status(200).json({
        success: true,
        message: "Cart cleared successfully.",
      });
    }

    const removed = await removeCartItem(parseInt(id), userId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully.",
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove cart item.",
    });
  }
};

module.exports = {
  getCartHandler,
  addToCartHandler,
  updateCartQuantityHandler,
  removeCartItemHandler,
};
