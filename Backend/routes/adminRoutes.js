const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getLowStockHandler,
  getAnalyticsHandler,
} = require("../controllers/adminController");

const router = express.Router();

// Protected Admin Analytics & Low-Stock Inventory Routes
router.get("/inventory/low-stock", authMiddleware, adminMiddleware, getLowStockHandler);
router.get("/analytics", authMiddleware, adminMiddleware, getAnalyticsHandler);

module.exports = router;
