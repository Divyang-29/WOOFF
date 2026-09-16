const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getRefundPolicyHandler,
  upsertRefundPolicyHandler,
} = require("../controllers/refundPolicyController");

const router = express.Router();

// Public routes to view Refund & Return Policy
router.get("/", getRefundPolicyHandler);

// Protected Admin routes to create or update Refund Policy
router.post("/", authMiddleware, adminMiddleware, upsertRefundPolicyHandler);
router.put("/", authMiddleware, adminMiddleware, upsertRefundPolicyHandler);

module.exports = router;
