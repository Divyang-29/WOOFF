const {
  initializePayment,
  verifyPaymentSignature,
} = require("../models/paymentModel");

// Initialize Payment (POST /api/payments/init)
const initPaymentHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id, orderId, provider = "razorpay" } = req.body;
    const targetOrderId = order_id || orderId;

    if (!targetOrderId) {
      return res.status(400).json({
        success: false,
        message: "order_id is required.",
      });
    }

    const payload = await initializePayment(parseInt(targetOrderId), userId, provider);

    return res.status(200).json({
      success: true,
      message: "Payment transaction initialized.",
      payment: payload,
    });
  } catch (error) {
    console.error("Init Payment Error:", error.message);
    const isUserError =
      error.message.includes("Order not found") ||
      error.message.includes("already been paid");

    return res.status(isUserError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to initialize payment.",
    });
  }
};

// Verify Payment Signature (POST /api/payments/verify)
const verifyPaymentHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      order_id,
      orderId,
      provider_order_id,
      razorpay_order_id,
      provider_payment_id,
      razorpay_payment_id,
      signature,
      razorpay_signature,
    } = req.body;

    const targetOrderId = order_id || orderId;
    const targetProviderOrderId = provider_order_id || razorpay_order_id;
    const targetProviderPaymentId = provider_payment_id || razorpay_payment_id;
    const targetSignature = signature || razorpay_signature;

    if (!targetOrderId || !targetProviderPaymentId || !targetSignature) {
      return res.status(400).json({
        success: false,
        message: "order_id, provider_payment_id, and signature are required for payment verification.",
      });
    }

    const result = await verifyPaymentSignature({
      orderId: parseInt(targetOrderId),
      providerOrderId: targetProviderOrderId,
      providerPaymentId: targetProviderPaymentId,
      signature: targetSignature,
      userId,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Payment verification failed.",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Verify Payment Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error during payment verification.",
    });
  }
};

module.exports = {
  initPaymentHandler,
  verifyPaymentHandler,
};
