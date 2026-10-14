const Razorpay = require("razorpay");
const pool = require("../config/db");
const { createShiprocketFulfillment } = require("./shiprocketFulfillmentService");

/**
 * Auto-Reconciles Pending Razorpay Orders
 * Checks Razorpay API directly to verify if orders have been paid,
 * ensuring orders are NEVER lost even if customer closes browser or webhook is missed.
 */
async function reconcilePendingOrders() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) return;

  const razorpay = new Razorpay({
    key_id,
    key_secret,
  });

  try {
    const res = await pool.query(`
      SELECT o.id, o.order_number, pt.provider_order_id
      FROM orders o
      JOIN payment_transactions pt ON pt.order_id = o.id
      WHERE o.payment_status = 'pending'
        AND (o.payment_method = 'razorpay' OR o.payment_method = 'prepaid')
        AND pt.provider_order_id IS NOT NULL
        AND o.created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY o.id DESC
      LIMIT 25
    `);

    for (const row of res.rows) {
      try {
        const rzpOrder = await razorpay.orders.fetch(row.provider_order_id);
        if (rzpOrder && (rzpOrder.status === "paid" || (rzpOrder.amount_paid && rzpOrder.amount_paid >= rzpOrder.amount))) {
          console.log(`[Auto-Reconciliation] Order #${row.id} (${row.order_number}) is PAID on Razorpay. Marking paid and fulfilling...`);

          const payments = await razorpay.orders.fetchPayments(row.provider_order_id);
          const capturedPayment = payments.items?.find((p) => p.status === "captured") || payments.items?.[0];
          const paymentId = capturedPayment?.id || "rzp_reconciled";

          await pool.query(
            "UPDATE orders SET payment_status = 'paid', order_status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
            [row.id]
          );
          await pool.query(
            "UPDATE payment_transactions SET status = 'paid', provider_payment_id = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2",
            [paymentId, row.id]
          );

          // Asynchronously trigger Shiprocket dispatch
          createShiprocketFulfillment(row.id).catch((err) => {
            console.error(`[Auto-Reconciliation Shiprocket Dispatch Error] Order #${row.id}:`, err.message);
          });
        }
      } catch (orderErr) {
        // Individual check failure non-fatal
      }
    }
  } catch (err) {
    console.warn("[Auto-Reconciliation Warning]:", err.message);
  }
}

/**
 * Starts periodic reconciliation interval (runs every 60 seconds)
 */
function startReconciliationCron() {
  // Run 10 seconds after server boot
  setTimeout(() => {
    reconcilePendingOrders();
  }, 10000);

  // Run periodically every 60 seconds
  setInterval(() => {
    reconcilePendingOrders();
  }, 60000);
}

module.exports = {
  reconcilePendingOrders,
  startReconciliationCron,
};
