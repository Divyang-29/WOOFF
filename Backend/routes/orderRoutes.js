const express = require("express");
const { optionalAuthMiddleware } = require("../middleware/authMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  checkoutHandler,
  getUserOrdersHandler,
  getOrderDetailsHandler,
  updateOrderStatusHandler,
  trackOrderByNumberHandler,
} = require("../controllers/orderController");

const router = express.Router();

// Public Customer Order Tracking Route (No auth required)
router.get("/track/:order_number", trackOrderByNumberHandler);

// User order routes (/checkout supports both authenticated and guest users)
router.post("/checkout", optionalAuthMiddleware, checkoutHandler);
router.get("/", authMiddleware, getUserOrdersHandler);
router.get("/:id", authMiddleware, getOrderDetailsHandler);

// Protected Admin order fulfillment route
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatusHandler);

module.exports = router;
