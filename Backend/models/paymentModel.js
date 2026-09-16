const crypto = require("crypto");
const pool = require("../config/db");
const { getOrderDetailsById } = require("./orderModel");

// Initialize Payment Transaction
const initializePayment = async (orderId, userId, paymentProvider = "razorpay") => {
  const order = await getOrderDetailsById(orderId, userId, false);

  if (!order) {
    throw new Error("Order not found or unauthorized.");
  }

  if (order.payment_status === "paid") {
    throw new Error("Order has already been paid.");
  }

  const providerOrderId = `rzp_order_${order.id}_${Date.now()}`;

  const query = `
    INSERT INTO payment_transactions (
      order_id, payment_provider, provider_order_id, amount, currency, status, metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const metadata = {
    order_number: order.order_number,
    customer_phone: order.customer_phone,
    customer_name: order.customer_name,
    environment: process.env.NODE_ENV || "development",
  };

  const values = [
    order.id,
    paymentProvider,
    providerOrderId,
    order.total_amount,
    order.currency || "INR",
    "created",
    JSON.stringify(metadata),
  ];

  const result = await pool.query(query, values);
  const transaction = result.rows[0];

  return {
    transaction_id: transaction.id,
    order_id: order.id,
    order_number: order.order_number,
    amount: order.total_amount,
    amount_in_paise: Math.round(order.total_amount * 100),
    currency: order.currency || "INR",
    provider: paymentProvider,
    provider_order_id: providerOrderId,
    status: transaction.status,
    customer: {
      name: order.customer_name,
      phone: order.customer_phone,
    },
    sdk_config: {
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      name: "Wooff Pet Care",
      description: `Order ${order.order_number}`,
    },
  };
};

// Verify Payment Signature & Update Status (Database Transaction + Idempotency)
const verifyPaymentSignature = async ({
  orderId,
  providerOrderId,
  providerPaymentId,
  signature,
  userId,
}) => {
  const client = await pool.connect();
  try {
    const orderRes = await client.query("SELECT * FROM orders WHERE id = $1 AND user_id = $2", [
      orderId,
      userId,
    ]);
    const order = orderRes.rows[0];

    if (!order) {
      throw new Error("Order not found or unauthorized.");
    }

    // Idempotency Check: If order is already paid, return clean success immediately
    if (order.payment_status === "paid") {
      const fullOrder = await getOrderDetailsById(orderId, userId, false);
      return {
        success: true,
        already_processed: true,
        message: "Order is already paid.",
        order: fullOrder,
      };
    }

    // Cryptographic HMAC SHA256 Signature Verification
    const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";
    const bodyToSign = `${providerOrderId || ""}|${providerPaymentId || ""}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyToSign)
      .digest("hex");

    // Allow mock testing signature in development mode if passed explicitly
    const isDev = process.env.NODE_ENV !== "production";
    const isValid =
      signature === expectedSignature || (isDev && signature === "mock_signature");

    await client.query("BEGIN");

    if (isValid) {
      // 1. Update Payment Transaction Record
      await client.query(
        `UPDATE payment_transactions
         SET status = 'paid', provider_payment_id = $1, provider_order_id = $2, updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $3`,
        [providerPaymentId, providerOrderId, orderId]
      );

      // 2. Update Order Record: payment_status = paid, order_status = processing
      await client.query(
        `UPDATE orders
         SET payment_status = 'paid', order_status = 'processing', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [orderId]
      );

      await client.query("COMMIT");

      const updatedOrder = await getOrderDetailsById(orderId, userId, false);
      return {
        success: true,
        message: "Payment verified successfully.",
        order: updatedOrder,
      };
    } else {
      // Record Failed Transaction
      await client.query(
        `UPDATE payment_transactions
         SET status = 'failed', failure_code = 'BAD_SIGNATURE', failure_message = 'Signature verification failed', updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $1`,
        [orderId]
      );

      await client.query(
        `UPDATE orders SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [orderId]
      );

      await client.query("COMMIT");

      return {
        success: false,
        message: "Invalid payment signature.",
      };
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Process Gateway Webhook Event (Idempotent Server-to-Server)
const processWebhookEvent = async (webhookBody, signatureHeader, rawBody = null) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  // Signature verification for webhooks: Strictly required in production
  if (isProduction || signatureHeader) {
    if (!signatureHeader) {
      throw new Error("Missing required x-razorpay-signature header.");
    }

    if (!secret) {
      throw new Error("Razorpay webhook secret is not configured on the server.");
    }

    const payloadToVerify = rawBody || (typeof webhookBody === "string" ? webhookBody : JSON.stringify(webhookBody));
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadToVerify)
      .digest("hex");

    const isDevMock = !isProduction && signatureHeader === "mock_signature";
    if (signatureHeader !== expectedSig && !isDevMock) {
      throw new Error("Invalid webhook signature.");
    }
  }

  const payload = typeof webhookBody === "string" ? JSON.parse(webhookBody) : webhookBody;
  const event = payload.event || "payment.captured";
  const paymentEntity = payload.payload?.payment?.entity || payload.payment || {};

  const providerOrderId = paymentEntity.order_id || payload.provider_order_id;
  const providerPaymentId = paymentEntity.id || payload.provider_payment_id;

  if (!providerOrderId && !payload.order_id) {
    return { success: true, message: "Ignored event: No order mapping found." };
  }

  const client = await pool.connect();
  try {
    let orderRes;
    if (payload.order_id) {
      orderRes = await client.query("SELECT * FROM orders WHERE id = $1", [payload.order_id]);
    } else {
      const txRes = await client.query(
        "SELECT order_id FROM payment_transactions WHERE provider_order_id = $1 LIMIT 1",
        [providerOrderId]
      );
      if (txRes.rows[0]) {
        orderRes = await client.query("SELECT * FROM orders WHERE id = $1", [txRes.rows[0].order_id]);
      }
    }

    const order = orderRes?.rows[0];

    if (!order) {
      return { success: true, message: "Order not found for webhook event." };
    }

    // Idempotency: Ignore if already marked as paid
    if (order.payment_status === "paid") {
      return { success: true, message: "Order already marked as paid." };
    }

    await client.query("BEGIN");

    if (event === "payment.captured" || event === "order.paid") {
      await client.query(
        `UPDATE payment_transactions
         SET status = 'paid', provider_payment_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $2`,
        [providerPaymentId || "wh_captured", order.id]
      );

      await client.query(
        `UPDATE orders
         SET payment_status = 'paid', order_status = 'processing', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [order.id]
      );
    } else if (event === "payment.failed") {
      await client.query(
        `UPDATE payment_transactions
         SET status = 'failed', failure_message = 'Payment failed via webhook', updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $1`,
        [order.id]
      );

      await client.query(
        `UPDATE orders SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [order.id]
      );
    }

    await client.query("COMMIT");
    return { success: true, message: `Webhook processed for event: ${event}` };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  initializePayment,
  verifyPaymentSignature,
  processWebhookEvent,
};
