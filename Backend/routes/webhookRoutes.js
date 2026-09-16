const express = require("express");
const { handlePaymentWebhook } = require("../controllers/webhookController");

const router = express.Router();

// Unprotected Webhook Endpoint (Secured by Gateway Header Signature verification)
router.post("/payment", handlePaymentWebhook);
router.post("/", handlePaymentWebhook);

module.exports = router;
