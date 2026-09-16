const pool = require("../config/db");

// Helper to format coupon code to uppercase
const formatCode = (code) => {
  return code ? code.toString().trim().toUpperCase() : "";
};

// Create Coupon
const createCoupon = async ({
  code,
  discount_type,
  discount_value,
  min_cart_value = 0.00,
  max_discount_amount = null,
  is_active = true,
  usage_limit = null,
  expires_at = null,
}) => {
  const formattedCode = formatCode(code);
  if (!formattedCode) {
    throw new Error("Coupon code is required.");
  }

  if (!["percentage", "flat"].includes(discount_type)) {
    throw new Error("discount_type must be either 'percentage' or 'flat'.");
  }

  const query = `
    INSERT INTO coupons (
      code, discount_type, discount_value, min_cart_value, max_discount_amount, is_active, usage_limit, expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    formattedCode,
    discount_type,
    parseFloat(discount_value),
    parseFloat(min_cart_value || 0),
    max_discount_amount ? parseFloat(max_discount_amount) : null,
    Boolean(is_active),
    usage_limit ? parseInt(usage_limit) : null,
    expires_at ? new Date(expires_at) : null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get Coupon By Code
const getCouponByCode = async (code) => {
  const query = "SELECT * FROM coupons WHERE code = $1";
  const result = await pool.query(query, [formatCode(code)]);
  return result.rows[0];
};

// Get Coupon By ID
const getCouponById = async (id) => {
  const query = "SELECT * FROM coupons WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Get All Coupons
const getAllCoupons = async (includeInactive = true) => {
  let query = "SELECT * FROM coupons";
  if (!includeInactive) {
    query += " WHERE is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)";
  }
  query += " ORDER BY created_at DESC";

  const result = await pool.query(query);
  return result.rows;
};

// Update Coupon
const updateCoupon = async (id, data) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (data.code) {
    fields.push(`code = $${paramIdx++}`);
    values.push(formatCode(data.code));
  }
  if (data.discount_type) {
    if (!["percentage", "flat"].includes(data.discount_type)) {
      throw new Error("discount_type must be 'percentage' or 'flat'.");
    }
    fields.push(`discount_type = $${paramIdx++}`);
    values.push(data.discount_type);
  }
  if (data.discount_value !== undefined) {
    fields.push(`discount_value = $${paramIdx++}`);
    values.push(parseFloat(data.discount_value));
  }
  if (data.min_cart_value !== undefined) {
    fields.push(`min_cart_value = $${paramIdx++}`);
    values.push(parseFloat(data.min_cart_value));
  }
  if (data.max_discount_amount !== undefined) {
    fields.push(`max_discount_amount = $${paramIdx++}`);
    values.push(data.max_discount_amount ? parseFloat(data.max_discount_amount) : null);
  }
  if (data.is_active !== undefined) {
    fields.push(`is_active = $${paramIdx++}`);
    values.push(Boolean(data.is_active));
  }
  if (data.usage_limit !== undefined) {
    fields.push(`usage_limit = $${paramIdx++}`);
    values.push(data.usage_limit ? parseInt(data.usage_limit) : null);
  }
  if (data.expires_at !== undefined) {
    fields.push(`expires_at = $${paramIdx++}`);
    values.push(data.expires_at ? new Date(data.expires_at) : null);
  }

  if (fields.length === 0) return await getCouponById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE coupons
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete / Toggle Active Status Coupon
const deleteCoupon = async (id) => {
  const query = "DELETE FROM coupons WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Validate Coupon and Calculate Discount Amount
const validateCoupon = async (code, cartSubtotal) => {
  const formattedCode = formatCode(code);
  if (!formattedCode) {
    throw new Error("Coupon code is required.");
  }

  const subtotal = parseFloat(cartSubtotal || 0);
  if (isNaN(subtotal) || subtotal <= 0) {
    throw new Error("Cart subtotal must be greater than 0.");
  }

  const coupon = await getCouponByCode(formattedCode);
  if (!coupon) {
    throw new Error(`Coupon code '${formattedCode}' is invalid.`);
  }

  if (!coupon.is_active) {
    throw new Error(`Coupon '${formattedCode}' is no longer active.`);
  }

  if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
    throw new Error(`Coupon '${formattedCode}' has expired.`);
  }

  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    throw new Error(`Coupon '${formattedCode}' usage limit has been reached.`);
  }

  const minVal = parseFloat(coupon.min_cart_value || 0);
  if (subtotal < minVal) {
    throw new Error(`Cart subtotal (₹${subtotal}) does not meet the minimum requirement of ₹${minVal} for coupon '${formattedCode}'.`);
  }

  // Calculate discount
  let discountAmount = 0;
  const val = parseFloat(coupon.discount_value);

  if (coupon.discount_type === "percentage") {
    discountAmount = subtotal * (val / 100);
    if (coupon.max_discount_amount) {
      const maxCap = parseFloat(coupon.max_discount_amount);
      discountAmount = Math.min(discountAmount, maxCap);
    }
  } else if (coupon.discount_type === "flat") {
    discountAmount = Math.min(val, subtotal);
  }

  discountAmount = parseFloat(discountAmount.toFixed(2));
  const finalSubtotal = parseFloat(Math.max(0, subtotal - discountAmount).toFixed(2));

  return {
    valid: true,
    code: coupon.code,
    coupon_id: coupon.id,
    discount_type: coupon.discount_type,
    discount_value: val,
    discount_amount: discountAmount,
    subtotal: subtotal,
    final_subtotal: finalSubtotal,
  };
};

module.exports = {
  createCoupon,
  getCouponByCode,
  getCouponById,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
