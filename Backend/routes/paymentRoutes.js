const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  initPaymentHandler,
  verifyPaymentHandler,
} = require("../controllers/paymentController");

const router = express.Router();

// Protected payment routes
router.post("/init", authMiddleware, initPaymentHandler);
router.post("/verify", authMiddleware, verifyPaymentHandler);

module.exports = router;
