const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  getCartHandler,
  addToCartHandler,
  updateCartQuantityHandler,
  removeCartItemHandler,
} = require("../controllers/cartController");

const router = express.Router();

// Protected user cart routes
router.get("/", authMiddleware, getCartHandler);
router.post("/", authMiddleware, addToCartHandler);
router.put("/:id", authMiddleware, updateCartQuantityHandler);
router.delete("/:id", authMiddleware, removeCartItemHandler);

module.exports = router;
