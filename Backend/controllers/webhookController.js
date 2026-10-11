const { processWebhookEvent } = require("../models/paymentModel");
const { updateOrderByShiprocketAwb } = require("../models/orderModel");

/**
 * Maps Shiprocket tracking statuses to internal Wooff order_status enum values:
 * ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
 */
const mapShiprocketStatusToOrderStatus = (rawStatus) => {
  if (!rawStatus) return null;
  const statusUpper = String(rawStatus).toUpperCase().trim();

  // Delivered
  if (statusUpper.includes("DELIVERED") && !statusUpper.includes("RTO")) {
    return "delivered";
  }

  // Returned / RTO Initiated / RTO Delivered
  if (
    statusUpper.includes("RTO") ||
    statusUpper.includes("RETURN") ||
    statusUpper.includes("REJECTED")
  ) {
    return "returned";
  }

  // Cancelled
  if (statusUpper.includes("CANCEL")) {
    return "cancelled";
  }

  // Shipped / In Transit / Picked Up / Out For Delivery
  if (
    statusUpper.includes("SHIPPED") ||
    statusUpper.includes("PICKED UP") ||
    statusUpper.includes("IN TRANSIT") ||
    statusUpper.includes("OUT FOR DELIVERY") ||
    statusUpper.includes("REACHED AT HUB") ||
    statusUpper.includes("DISPATCH")
  ) {
    return "shipped";
  }

  // Processing / Manifest Generated / Pickup Scheduled / AWB Assigned
  if (
    statusUpper.includes("MANIFEST") ||
    statusUpper.includes("PICKUP SCHEDULED") ||
    statusUpper.includes("AWB ASSIGNED") ||
    statusUpper.includes("LABEL GENERATED") ||
    statusUpper.includes("PROCESSING") ||
    statusUpper.includes("NEW")
  ) {
    return "processing";
  }

  return null;
};

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

// Shiprocket Tracking Webhook Handler (POST /api/webhooks/shiprocket)
const handleShiprocketWebhook = async (req, res) => {
  // Respond 200 OK immediately so Shiprocket doesn't retry the webhook
  res.status(200).json({
    success: true,
    message: "Shiprocket tracking webhook received successfully",
  });

  // Asynchronously process the tracking payload in background
  try {
    const payload = req.body || {};
    console.log("[Shiprocket Webhook Received]:", JSON.stringify(payload));

    // Extract AWB, statuses, and metadata from payload
    const awb =
      payload.awb ||
      payload.awb_code ||
      payload.tracking_number ||
      payload.shipment_track?.[0]?.awb_code ||
      payload.data?.awb;

    const currentStatus =
      payload.current_status ||
      payload.shipment_status ||
      payload.status ||
      payload.shipment_track?.[0]?.current_status ||
      payload.data?.status;

    const courierName =
      payload.courier_name ||
      payload.shipment_track?.[0]?.courier_name ||
      payload.data?.courier_name;

    const orderId =
      payload.order_id ||
      payload.shipment_track?.[0]?.order_id ||
      payload.data?.order_id;

    if (!awb && !orderId) {
      console.warn("[Shiprocket Webhook] No AWB or order_id present in incoming payload:", payload);
      return;
    }

    const mappedOrderStatus = mapShiprocketStatusToOrderStatus(currentStatus);

    await updateOrderByShiprocketAwb({
      awbCode: awb,
      orderId,
      orderStatus: mappedOrderStatus,
      shiprocketStatus: currentStatus || "UPDATED",
      courierName,
      rawPayload: payload,
    });
  } catch (error) {
    console.error("[Shiprocket Webhook Processing Error]:", error.message);
  }
};

module.exports = {
  handlePaymentWebhook,
  handleShiprocketWebhook,
  mapShiprocketStatusToOrderStatus,
};

