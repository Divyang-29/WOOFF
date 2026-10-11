const pool = require("../config/db");

/**
 * Log an administrative action to admin_audit_logs table
 *
 * @param {Object} params
 * @param {number|null} params.adminId - ID of the admin user
 * @param {string} params.adminUsername - Username or email of admin
 * @param {string} params.action - Action verb e.g. 'PRODUCT_CREATED', 'ORDER_STATUS_UPDATED', 'ORDER_CANCELLED', 'SHIPROCKET_FULFILLED'
 * @param {string} params.entityType - Entity e.g. 'PRODUCT', 'ORDER', 'BLOG', 'COUPON', 'CATEGORY', 'INGREDIENT'
 * @param {string|number} params.entityId - Primary key/ID of target entity
 * @param {Object} [params.details] - Arbitrary context details
 * @param {Object} [params.req] - Express request object to extract IP address
 */
const logAdminAction = async ({
  adminId = null,
  adminUsername = "Admin",
  action,
  entityType,
  entityId = null,
  details = {},
  req = null,
}) => {
  try {
    let ipAddress = "127.0.0.1";
    if (req) {
      ipAddress =
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        req.ip ||
        "127.0.0.1";
      if (typeof ipAddress === "string" && ipAddress.includes(",")) {
        ipAddress = ipAddress.split(",")[0].trim();
      }
    }

    const query = `
      INSERT INTO admin_audit_logs (
        admin_id, admin_username, action, entity_type, entity_id, details, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at;
    `;

    const values = [
      adminId,
      adminUsername,
      action,
      entityType,
      entityId ? String(entityId) : null,
      JSON.stringify(details || {}),
      ipAddress,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    // Non-blocking log failure
    console.error("[Audit Trail Error] Failed to write audit log:", err.message);
    return null;
  }
};

/**
 * Retrieve paginated audit logs for Admin Panel
 */
const getAuditLogs = async ({
  page = 1,
  limit = 25,
  action = "",
  entityType = "",
  search = "",
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (action && action.trim()) {
    params.push(action.trim());
    conditions.push(`action = $${params.length}`);
  }

  if (entityType && entityType.trim()) {
    params.push(entityType.trim());
    conditions.push(`entity_type = $${params.length}`);
  }

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    const sParam = `$${params.length}`;
    conditions.push(
      `(admin_username ILIKE ${sParam} OR action ILIKE ${sParam} OR entity_type ILIKE ${sParam} OR entity_id ILIKE ${sParam})`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*)::int as total FROM admin_audit_logs ${whereClause}`;
  const countRes = await pool.query(countQuery, params);
  const total = countRes.rows[0]?.total || 0;

  const dataParams = [...params, limitNum, offset];
  const dataQuery = `
    SELECT 
      id, admin_id, admin_username, action, entity_type, entity_id, details, ip_address, created_at
    FROM admin_audit_logs
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
  `;

  const result = await pool.query(dataQuery, dataParams);

  return {
    logs: result.rows,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

module.exports = {
  logAdminAction,
  getAuditLogs,
};
