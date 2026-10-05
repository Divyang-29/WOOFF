const crypto = require("crypto");
const Razorpay = require("razorpay");

/**
 * Get configured Razorpay SDK instance
 */
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    const error = new Error("Razorpay credentials are not configured on the server.");
    error.statusCode = 401;
    throw error;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 * Request: { amount (paise), currency, receipt, notes }
 * Return: { order_id, amount, currency, key_id }
 * Minimum amount: 100 paise
 */
const createOrderHandler = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount)) {
      return res.status(400).json({
        success: false,
        message: "A valid amount is required.",
      });
    }

    // Minimum amount: 100 paise (₹1)
    const amountInPaise = Math.round(parsedAmount);
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least 100 paise (₹1.00).",
      });
    }

    const razorpay = getRazorpayInstance();

    const options = {
      amount: amountInPaise,
      currency: (currency || "INR").toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[Razorpay Create Order Error]:", error);

    if (error.statusCode === 401 || error.message?.includes("credentials")) {
      return res.status(401).json({
        success: false,
        message: "Authentication failure: Invalid or missing Razorpay credentials.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.error?.description || error.message || "Failed to create Razorpay order.",
    });
  }
};

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 */
const verifyPaymentHandler = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      payment_id,
      signature,
    } = req.body;

    const targetOrderId = razorpay_order_id || order_id;
    const targetPaymentId = razorpay_payment_id || payment_id;
    const targetSignature = razorpay_signature || signature;

    if (!targetOrderId || !targetPaymentId || !targetSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: order_id, payment_id, and signature are required.",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(401).json({
        success: false,
        message: "Razorpay secret key is not configured.",
      });
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const bodyToSign = `${targetOrderId}|${targetPaymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(bodyToSign)
      .digest("hex");

    if (generatedSignature !== targetSignature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Signature mismatch.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order_id: targetOrderId,
      payment_id: targetPaymentId,
    });
  } catch (error) {
    console.error("[Razorpay Verify Signature Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during payment verification.",
    });
  }
};

module.exports = {
  createOrderHandler,
  verifyPaymentHandler,
};
