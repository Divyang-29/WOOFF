const { processWebhookEvent } = require("../models/paymentModel");

// Payment Webhook Handler (POST /api/webhooks/payment)
const handlePaymentWebhook = async (req, res) => {
  try {
    const signatureHeader = req.headers["x-razorpay-signature"] || req.headers["x-signature"];
    const rawBody = req.rawBody || req.body;
    const result = await processWebhookEvent(req.body, signatureHeader, rawBody);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Webhook Processing Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Webhook processing failed.",
    });
  }
};

module.exports = {
  handlePaymentWebhook,
};
