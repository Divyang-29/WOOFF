const express = require("express");
const {
  handlePaymentWebhook,
  handleShiprocketWebhook,
} = require("../controllers/webhookController");

const router = express.Router();

// Gateway Payment Webhooks
router.post("/payment", handlePaymentWebhook);
router.post("/", handlePaymentWebhook);

// Shiprocket Tracking Updates Webhook
router.post("/shiprocket", handleShiprocketWebhook);

module.exports = router;

