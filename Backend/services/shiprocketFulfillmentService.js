const pool = require("../config/db");

// Configuration Constants
const SHIPROCKET_LOGISTICS_API = "https://apiv2.shiprocket.in/v1/external";
const DEFAULT_HSN = 33061020; // HSN Code for Toothpaste / Dentifrices
const TOOTHPASTE_UNIT_WEIGHT_KG = 0.150; // Wooff 50g tube + outer packaging = 150g
const SINGLE_BOX_LENGTH_CM = 15.0;
const SINGLE_BOX_BREADTH_CM = 5.0;
const SINGLE_BOX_HEIGHT_CM = 4.0;

// In-Memory Token Cache
let cachedAuthToken = null;
let tokenExpiresAt = null;

/**
 * 1. Strict Pre-Dispatch Audit Function
 * Validates shipping address integrity, PIN code validity, and contact details
 * before forwarding order data to Shiprocket.
 *
 * @param {Object} order - Order row from database
 * @param {Array} items - Array of order_items
 * @returns {Object} { isValid: boolean, errors: string[], sanitized: Object }
 */
function auditOrderBeforeDispatch(order, items) {
  const errors = [];

  // A. Pincode Validation (Strict 6-digit Indian Postal Code: 100000 - 999999)
  const rawPincode = String(order.shipping_postal_code || "").trim();
  const pincodeClean = rawPincode.replace(/\D/g, "");
  if (!/^[1-9][0-9]{5}$/.test(pincodeClean)) {
    errors.push(`Invalid postal code "${rawPincode}". Indian delivery PIN code must be 6 digits and not start with 0.`);
  }

  // B. Required Address Fields
  const address1 = (order.shipping_address_line_1 || "").trim();
  const city = (order.shipping_city || "").trim();
  const state = (order.shipping_state || "").trim();

  if (!address1 || address1.length < 5) {
    errors.push("shipping_address_line_1 must be at least 5 characters long.");
  }
  if (!city) {
    errors.push("shipping_city is required.");
  }
  if (!state) {
    errors.push("shipping_state is required.");
  }

  // C. Phone Validation (10 digits)
  const rawPhone = String(order.customer_phone || "").replace(/\D/g, "");
  const phoneClean = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
  if (!/^[6-9]\d{9}$/.test(phoneClean)) {
    errors.push(`Invalid phone number "${order.customer_phone}". Delivery phone must be a 10-digit Indian mobile number.`);
  }

  // D. Email Validation
  let emailClean = (order.customer_email || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailClean || !emailRegex.test(emailClean)) {
    // If invalid or missing, create a deterministic safe dispatch fallback using phone
    emailClean = `${phoneClean || "order"}@woof.care`;
  }

  // E. Items Validation
  if (!Array.isArray(items) || items.length === 0) {
    errors.push("Order contains no items for fulfillment dispatch.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      pincode: pincodeClean,
      address1,
      address2: (order.shipping_address_line_2 || "").trim(),
      city,
      state,
      phone: phoneClean,
      email: emailClean,
    },
  };
}

/**
 * 2. Authenticate with Shiprocket Logistics API
 * Generates and caches JWT token for API requests.
 */
async function getShiprocketAuthToken() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn(
      "[Shiprocket Fulfillment] SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not configured. Please add them in .env"
    );
    return null;
  }

  // Check cache
  if (cachedAuthToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedAuthToken;
  }

  try {
    const response = await fetch(`${SHIPROCKET_LOGISTICS_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.token) {
      throw new Error(data.message || `Auth failed with HTTP ${response.status}`);
    }

    cachedAuthToken = data.token;
    // Cache token for 24 hours (Shiprocket tokens expire in 10 days)
    tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    return cachedAuthToken;
  } catch (err) {
    console.error("[Shiprocket Auth Error]:", err.message);
    throw err;
  }
}

/**
 * 3. Main Fulfillment Interception Function
 * Checks idempotency, runs pre-dispatch audit, calculates packaging dimensions,
 * pushes adhoc order to Shiprocket, and records shipment tracking details in the DB.
 *
 * @param {number|string} orderId - Primary key ID of the order in `orders` table
 * @returns {Promise<Object>} Fulfillment result summary
 */
async function createShiprocketFulfillment(orderId) {
  const parsedOrderId = parseInt(orderId, 10);
  if (!parsedOrderId) {
    throw new Error(`Invalid order ID: ${orderId}`);
  }

  console.log(`[Shiprocket Fulfillment] Processing fulfillment for Order #${parsedOrderId}...`);

  // 1. Fetch complete order from database
  const orderRes = await pool.query("SELECT * FROM orders WHERE id = $1", [parsedOrderId]);
  const order = orderRes.rows[0];

  if (!order) {
    console.error(`[Shiprocket Fulfillment] Order #${parsedOrderId} not found.`);
    return { success: false, message: "Order not found" };
  }

  // 2. Strict Idempotency Check: Skip if already fulfilled or pushed
  if (order.shiprocket_order_id) {
    console.log(
      `[Shiprocket Fulfillment] Order #${parsedOrderId} (${order.order_number}) is already registered with Shiprocket (SR ID: ${order.shiprocket_order_id}). Skipping.`
    );
    return {
      success: true,
      already_fulfilled: true,
      shiprocket_order_id: order.shiprocket_order_id,
      shiprocket_shipment_id: order.shiprocket_shipment_id,
      awb: order.shiprocket_awb_code,
    };
  }

  // 3. Fetch line items
  const itemsRes = await pool.query(
    "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC",
    [parsedOrderId]
  );
  const items = itemsRes.rows;

  // 4. Run Strict Pre-Dispatch Audit
  const audit = auditOrderBeforeDispatch(order, items);
  if (!audit.isValid) {
    const errorSummary = audit.errors.join(" | ");
    console.error(`[Shiprocket Fulfillment Pre-Dispatch Failed] Order #${parsedOrderId}: ${errorSummary}`);

    await pool.query(
      `UPDATE orders 
       SET shiprocket_status = 'pre_dispatch_audit_failed',
           shiprocket_response = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify({ audit_errors: audit.errors, timestamp: new Date().toISOString() }), parsedOrderId]
    );

    return {
      success: false,
      audit_failed: true,
      errors: audit.errors,
    };
  }

  // 5. Dynamic Parcel Weight and Dimension Calculations
  // Based on Wooff 50g Toothpaste Specifications:
  // - 0.150 kg per tube packaging
  // - 15cm (L) x 5cm (B) x 4cm (H) per single box
  let totalUnits = 0;
  let totalCalculatedWeight = 0;

  for (const item of items) {
    const qty = parseInt(item.quantity, 10) || 1;
    totalUnits += qty;
    totalCalculatedWeight += qty * TOOTHPASTE_UNIT_WEIGHT_KG;
  }

  const finalWeightKg = parseFloat(Math.max(0.15, totalCalculatedWeight).toFixed(3));
  // Dimensions scale with quantity into standard shipping mailer / box
  const pkgLength = SINGLE_BOX_LENGTH_CM;
  const pkgBreadth = Math.min(30.0, Math.max(SINGLE_BOX_BREADTH_CM, Math.ceil(totalUnits / 2) * SINGLE_BOX_BREADTH_CM));
  const pkgHeight = totalUnits > 2 ? 8.0 : SINGLE_BOX_HEIGHT_CM;

  // 6. Split customer name into first and last name
  const rawName = (order.customer_name || "Customer").trim();
  const nameParts = rawName.split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Format order date: YYYY-MM-DD HH:mm
  const orderDateObj = order.created_at ? new Date(order.created_at) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const formattedOrderDate = `${orderDateObj.getFullYear()}-${pad(orderDateObj.getMonth() + 1)}-${pad(
    orderDateObj.getDate()
  )} ${pad(orderDateObj.getHours())}:${pad(orderDateObj.getMinutes())}`;

  // 7. Construct Shiprocket Adhoc Order Payload
  const shiprocketPayload = {
    order_id: order.order_number,
    order_date: formattedOrderDate,
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    channel_id: "",
    comment: order.notes || "Wooff Prebiotic Kids Toothpaste Order",
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: audit.sanitized.address1,
    billing_address_2: audit.sanitized.address2,
    billing_city: audit.sanitized.city,
    billing_pincode: audit.sanitized.pincode,
    billing_state: audit.sanitized.state,
    billing_country: "India",
    billing_email: audit.sanitized.email,
    billing_phone: audit.sanitized.phone,
    shipping_is_billing: true,
    order_items: items.map((item) => ({
      name: item.product_name,
      sku: item.product_sku || "WOOFF-CHOCO-01",
      units: parseInt(item.quantity, 10),
      selling_price: parseFloat(item.unit_price),
      discount: 0,
      tax: 0,
      hsn: DEFAULT_HSN,
    })),
    payment_method: String(order.payment_method || "").toLowerCase() === "cod" ? "COD" : "Prepaid",
    shipping_charges: parseFloat(order.shipping_amount || 0),
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: parseFloat(order.discount_amount || 0),
    sub_total: parseFloat(order.total_amount),
    length: pkgLength,
    breadth: pkgBreadth,
    height: pkgHeight,
    weight: finalWeightKg,
  };

  // 8. Authenticate and dispatch to Shiprocket
  let token = null;
  try {
    token = await getShiprocketAuthToken();
  } catch (authErr) {
    console.error("[Shiprocket Fulfillment Auth Failed]:", authErr.message);
    await pool.query(
      `UPDATE orders 
       SET shiprocket_status = 'auth_failed',
           shiprocket_response = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify({ error: authErr.message, note: "Check SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD in .env" }), parsedOrderId]
    );
    return { success: false, error: authErr.message };
  }

  if (!token) {
    // If credentials are not present, log gracefully and mark as pending configuration
    console.log(
      `[Shiprocket Fulfillment] Mock/Simulated dispatch for Order #${parsedOrderId}. Credentials pending in .env.`
    );
    await pool.query(
      `UPDATE orders 
       SET shiprocket_status = 'pending_credentials',
           shiprocket_response = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [
        JSON.stringify({
          status: "pending_credentials",
          simulated_payload: shiprocketPayload,
          message: "Awaiting valid SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in environment.",
        }),
        parsedOrderId,
      ]
    );
    return {
      success: true,
      simulated: true,
      message: "Order audited successfully. Credentials pending in environment.",
    };
  }

  // 9. Send Payload to Shiprocket Adhoc Order Endpoint
  try {
    const srResponse = await fetch(`${SHIPROCKET_LOGISTICS_API}/orders/create/adhoc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shiprocketPayload),
    });

    const srData = await srResponse.json().catch(() => ({}));

    if (!srResponse.ok || !srData.order_id) {
      console.error(
        `[Shiprocket Adhoc API Error] Order #${parsedOrderId} returned HTTP ${srResponse.status}:`,
        srData
      );

      await pool.query(
        `UPDATE orders 
         SET shiprocket_status = 'dispatch_rejected',
             shiprocket_response = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [JSON.stringify(srData), parsedOrderId]
      );

      return {
        success: false,
        message: srData.message || "Shiprocket rejected order creation",
        details: srData,
      };
    }

    // 10. Success: Update Order with Shiprocket Fulfillment IDs
    const srOrderId = String(srData.order_id);
    const srShipmentId = String(srData.shipment_id || "");
    let srAwbCode = String(srData.awb_code || "");
    let srCourier = String(srData.courier_name || "");
    let srStatus = srData.status || "created";

    // Attempt automatic AWB assignment if AWB was not returned in adhoc creation
    if (!srAwbCode && srShipmentId) {
      try {
        const awbRes = await fetch(`${SHIPROCKET_LOGISTICS_API}/courier/assign/awb`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shipment_id: parseInt(srShipmentId, 10) }),
        });
        const awbData = await awbRes.json().catch(() => ({}));
        if (awbData?.response?.data?.awb_code) {
          srAwbCode = String(awbData.response.data.awb_code);
          srCourier = String(awbData.response.data.courier_name || srCourier);
          srStatus = "AWB_ASSIGNED";
        } else if (awbData?.message) {
          console.log(`[Shiprocket AWB Assignment Notice] Order #${parsedOrderId}: ${awbData.message}`);
        }
      } catch (awbErr) {
        console.warn("[Shiprocket AWB Assignment Warning]:", awbErr.message);
      }
    }

    await pool.query(
      `UPDATE orders 
       SET shiprocket_order_id = $1,
           shiprocket_shipment_id = $2,
           shiprocket_awb_code = $3,
           shiprocket_courier_name = $4,
           shiprocket_status = $5,
           shiprocket_response = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [srOrderId, srShipmentId, srAwbCode, srCourier, srStatus, JSON.stringify(srData), parsedOrderId]
    );

    console.log(
      `[Shiprocket Fulfillment Success] Order #${parsedOrderId} created with SR Order ID: ${srOrderId}, Shipment ID: ${srShipmentId}, AWB: ${srAwbCode || "Pending assign"}`
    );

    return {
      success: true,
      order_id: srOrderId,
      shipment_id: srShipmentId,
      awb_code: srAwbCode,
      status: srStatus,
    };
  } catch (apiErr) {
    console.error(`[Shiprocket Network Error] Order #${parsedOrderId}:`, apiErr.message);

    await pool.query(
      `UPDATE orders 
       SET shiprocket_status = 'network_error',
           shiprocket_response = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify({ error: apiErr.message }), parsedOrderId]
    );

    return { success: false, error: apiErr.message };
  }
}

module.exports = {
  auditOrderBeforeDispatch,
  getShiprocketAuthToken,
  createShiprocketFulfillment,
};
