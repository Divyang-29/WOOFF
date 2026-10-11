const crypto = require("crypto");
const Razorpay = require("razorpay");
const pool = require("../config/db");
const { createShiprocketFulfillment } = require("../services/shiprocketFulfillmentService");
const { markCartsRecoveredOnOrder } = require("../models/abandonedCartModel");
const { incrementCouponUsage } = require("../models/couponModel");

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

    // Resolve Database Order ID
    let resolvedDbOrderId = null;
    if (order_id && !isNaN(Number(order_id))) {
      resolvedDbOrderId = parseInt(order_id);
    } else {
      // Look up by Razorpay Provider Order ID
      const txRes = await pool.query(
        "SELECT order_id FROM payment_transactions WHERE provider_order_id = $1 LIMIT 1",
        [targetOrderId]
      );
      if (txRes.rows.length > 0) {
        resolvedDbOrderId = txRes.rows[0].order_id;
      }
    }

    if (resolvedDbOrderId) {
      // 1. Update Order status
      await pool.query(
        `UPDATE orders
         SET payment_status = 'paid', order_status = 'processing', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [resolvedDbOrderId]
      );

      // 2. Update payment transaction record
      await pool.query(
        `UPDATE payment_transactions
         SET status = 'paid', provider_payment_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $2`,
        [targetPaymentId, resolvedDbOrderId]
      );

      // 3. Auto-recover abandoned carts & increment coupon usage
      setImmediate(async () => {
        try {
          const ordMeta = await pool.query(
            "SELECT email, phone, coupon_code FROM orders WHERE id = $1",
            [resolvedDbOrderId]
          );
          if (ordMeta.rows.length > 0) {
            const { email, phone, coupon_code } = ordMeta.rows[0];
            if (email || phone) {
              markCartsRecoveredOnOrder(email, phone).catch(() => {});
            }
            if (coupon_code) {
              incrementCouponUsage(coupon_code).catch(() => {});
            }
          }
        } catch (e) {
          console.warn("[Post-Payment Sync Warning]:", e.message);
        }
      });

      // 4. Asynchronously trigger Shiprocket fulfillment
      setImmediate(() => {
        createShiprocketFulfillment(resolvedDbOrderId).catch((err) => {
          console.error(`[Shiprocket Dispatch Error] Order #${resolvedDbOrderId}:`, err.message);
        });
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order_id: resolvedDbOrderId || targetOrderId,
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
