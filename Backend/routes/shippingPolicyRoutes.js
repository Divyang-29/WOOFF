const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getShippingPolicyHandler,
  upsertShippingPolicyHandler,
} = require("../controllers/shippingPolicyController");

const router = express.Router();

// Public routes to view Shipping & Delivery Policy
router.get("/", getShippingPolicyHandler);

// Protected Admin routes to create or update Shipping Policy
router.post("/", authMiddleware, adminMiddleware, upsertShippingPolicyHandler);
router.put("/", authMiddleware, adminMiddleware, upsertShippingPolicyHandler);

module.exports = router;
