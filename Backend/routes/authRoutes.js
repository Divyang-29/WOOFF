const express = require("express");
const { authLimiter } = require("../middleware/rateLimiter");

const {
  sendWhatsAppOTP,
  verifyWhatsAppOTP,
  resendWhatsAppOTP,
  register,
  login,
} = require("../controllers/authController");

const router = express.Router();

// Core WhatsApp 6-digit OTP routes (Strict Rate Limited)
router.post("/send-otp", authLimiter, sendWhatsAppOTP);
router.post("/verify-otp", authLimiter, verifyWhatsAppOTP);
router.post("/resend-otp", authLimiter, resendWhatsAppOTP);

// Conveniences / Aliases
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

module.exports = router;
