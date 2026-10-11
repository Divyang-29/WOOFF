const pool = require("../config/db");

/**
 * Record or update an abandoned cart record
 */
const recordOrUpdateAbandonedCart = async ({
  userId = null,
  customerName = "",
  email = "",
  phone = "",
  items = [],
  totalValue = 0,
  checkoutStep = "shipping_details",
  recoveryNotes = null,
  req = null,
}) => {
  const cleanEmail = email ? email.trim().toLowerCase() : null;
  const cleanPhone = phone ? phone.trim().replace(/\D/g, "") : null;
  const cleanName = customerName ? customerName.trim() : null;

  // We require at least an email or phone and some items/value to track
  if (!cleanEmail && !cleanPhone) {
    throw new Error("Email or phone is required to record cart recovery.");
  }

  let ipAddress = "127.0.0.1";
  let userAgent = "";
  if (req) {
    ipAddress =
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      req.ip ||
      "127.0.0.1";
    if (typeof ipAddress === "string" && ipAddress.includes(",")) {
      ipAddress = ipAddress.split(",")[0].trim();
    }
    userAgent = req.headers["user-agent"] || "";
  }

  const parsedTotal = Math.max(0, parseFloat(totalValue || 0));
  const sanitizedItems = Array.isArray(items) ? items : [];

  // Check if an existing open abandoned cart exists within the last 24 hours
  let existingQuery = `
    SELECT id FROM abandoned_carts
    WHERE recovery_status = 'abandoned'
      AND updated_at >= NOW() - INTERVAL '24 hours'
      AND (
        ($1::text IS NOT NULL AND email = $1)
        OR ($2::text IS NOT NULL AND phone = $2)
      )
    ORDER BY updated_at DESC
    LIMIT 1;
  `;
  const existingRes = await pool.query(existingQuery, [cleanEmail, cleanPhone]);

  if (existingRes.rows.length > 0) {
    const existingId = existingRes.rows[0].id;
    const updateQuery = `
      UPDATE abandoned_carts
      SET customer_name = COALESCE($1, customer_name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          items = $4,
          total_value = $5,
          checkout_step = $6,
          user_id = COALESCE($7, user_id),
          ip_address = $8,
          user_agent = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *;
    `;
    const updateRes = await pool.query(updateQuery, [
      cleanName,
      cleanEmail,
      cleanPhone,
      JSON.stringify(sanitizedItems),
      parsedTotal,
      checkoutStep,
      userId,
      ipAddress,
      userAgent,
      existingId,
    ]);
    return updateRes.rows[0];
  } else {
    const insertQuery = `
      INSERT INTO abandoned_carts (
        user_id, customer_name, email, phone, items, total_value,
        recovery_status, checkout_step, recovery_notes, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, 'abandoned', $7, $8, $9, $10)
      RETURNING *;
    `;
    const insertRes = await pool.query(insertQuery, [
      userId,
      cleanName,
      cleanEmail,
      cleanPhone,
      JSON.stringify(sanitizedItems),
      parsedTotal,
      checkoutStep,
      recoveryNotes,
      ipAddress,
      userAgent,
    ]);
    return insertRes.rows[0];
  }
};

/**
 * Get paginated abandoned carts with dynamic sorting & filters
 */
const getAbandonedCarts = async ({
  page = 1,
  limit = 15,
  sort = "highest_value",
  status = "all",
  search = "",
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (status && status !== "all") {
    conditions.push(`recovery_status = $${paramIdx++}`);
    params.push(status);
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(`(
      LOWER(customer_name) LIKE $${paramIdx} OR
      LOWER(email) LIKE $${paramIdx} OR
      phone LIKE $${paramIdx}
    )`);
    params.push(searchTerm);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Dynamic sorting
  let orderBy = "total_value DESC, created_at DESC";
  if (sort === "recent") {
    orderBy = "created_at DESC";
  } else if (sort === "lowest_value") {
    orderBy = "total_value ASC, created_at DESC";
  } else if (sort === "highest_value" || sort === "value_desc") {
    orderBy = "total_value DESC, created_at DESC";
  }

  // Count Query
  const countQuery = `SELECT COUNT(*)::int as total FROM abandoned_carts ${whereClause};`;
  const countRes = await pool.query(countQuery, params);
  const total = countRes.rows[0]?.total || 0;

  // Data Query
  const dataParams = [...params, limitNum, offset];
  const dataQuery = `
    SELECT 
      id, user_id, customer_name, email, phone, items, total_value,
      recovery_status, checkout_step, recovery_notes, ip_address,
      created_at, updated_at
    FROM abandoned_carts
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length};
  `;
  const dataRes = await pool.query(dataQuery, dataParams);

  // Overall Statistics Query
  const statsRes = await pool.query(`
    SELECT
      COUNT(CASE WHEN recovery_status = 'abandoned' THEN 1 END)::int as abandoned_count,
      COALESCE(SUM(CASE WHEN recovery_status = 'abandoned' THEN total_value ELSE 0 END), 0.00)::numeric(10,2) as potential_lost_value,
      COUNT(CASE WHEN recovery_status = 'recovered' THEN 1 END)::int as recovered_count,
      COALESCE(SUM(CASE WHEN recovery_status = 'recovered' THEN total_value ELSE 0 END), 0.00)::numeric(10,2) as recovered_value,
      COUNT(*)::int as total_carts
    FROM abandoned_carts;
  `);

  const statsRow = statsRes.rows[0] || {};
  const totalCarts = statsRow.total_carts || 0;
  const recoveredCount = statsRow.recovered_count || 0;
  const conversionRate = totalCarts > 0 ? Math.round((recoveredCount / totalCarts) * 100) : 0;

  return {
    carts: dataRes.rows,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    stats: {
      abandonedCount: statsRow.abandoned_count || 0,
      potentialLostValue: parseFloat(statsRow.potential_lost_value || 0),
      recoveredCount,
      recoveredValue: parseFloat(statsRow.recovered_value || 0),
      conversionRate,
    },
  };
};

/**
 * Update recovery status of an abandoned cart
 */
const updateAbandonedCartStatus = async (id, { status, recovery_notes }) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (status) {
    if (!["abandoned", "recovered", "contacted", "cancelled"].includes(status)) {
      throw new Error("Invalid recovery status.");
    }
    fields.push(`recovery_status = $${paramIdx++}`);
    values.push(status);
  }

  if (recovery_notes !== undefined) {
    fields.push(`recovery_notes = $${paramIdx++}`);
    values.push(recovery_notes);
  }

  if (fields.length === 0) {
    throw new Error("No update fields provided.");
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE abandoned_carts
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete an abandoned cart record
 */
const deleteAbandonedCart = async (id) => {
  const query = `DELETE FROM abandoned_carts WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/**
 * Automatically mark abandoned carts as 'recovered' when an order is completed
 */
const markCartsRecoveredOnOrder = async (email, phone) => {
  try {
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim().replace(/\D/g, "") : null;

    if (!cleanEmail && !cleanPhone) return;

    await pool.query(
      `
      UPDATE abandoned_carts
      SET recovery_status = 'recovered',
          updated_at = CURRENT_TIMESTAMP
      WHERE recovery_status = 'abandoned'
        AND (
          ($1::text IS NOT NULL AND email = $1)
          OR ($2::text IS NOT NULL AND phone = $2)
        );
      `,
      [cleanEmail, cleanPhone]
    );
  } catch (err) {
    console.error("[Abandoned Cart Auto-Recovery Sync Error]:", err.message);
  }
};

module.exports = {
  recordOrUpdateAbandonedCart,
  getAbandonedCarts,
  updateAbandonedCartStatus,
  deleteAbandonedCart,
  markCartsRecoveredOnOrder,
};
