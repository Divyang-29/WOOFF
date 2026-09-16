const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  checkoutHandler,
  getUserOrdersHandler,
  getOrderDetailsHandler,
  updateOrderStatusHandler,
} = require("../controllers/orderController");

const router = express.Router();

// Protected user order routes
router.post("/checkout", authMiddleware, checkoutHandler);
router.get("/", authMiddleware, getUserOrdersHandler);
router.get("/:id", authMiddleware, getOrderDetailsHandler);

// Protected Admin order fulfillment route
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatusHandler);

module.exports = router;
