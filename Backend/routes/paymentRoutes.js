const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  initPaymentHandler,
  verifyPaymentHandler,
} = require("../controllers/paymentController");
const {
  createOrderHandler: standardCreateOrderHandler,
  verifyPaymentHandler: standardVerifyPaymentHandler,
} = require("../controllers/razorpayController");

const router = express.Router();

// Standard Razorpay Checkout Routes
router.post("/create-order", standardCreateOrderHandler);
router.post("/verify-payment", standardVerifyPaymentHandler);

// Protected payment routes (Wooff Multi-item order flow)
router.post("/init", authMiddleware, initPaymentHandler);
router.post("/verify", authMiddleware, verifyPaymentHandler);

module.exports = router;
