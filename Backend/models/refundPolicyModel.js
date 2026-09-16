const pool = require("../config/db");

// Get Latest Refund Policy
const getRefundPolicy = async () => {
  const query = `
    SELECT id, title, content, created_at, updated_at
    FROM refund_policies
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query);
  return result.rows[0] || null;
};

// Upsert Refund Policy (Create or Update active policy)
const upsertRefundPolicy = async ({ title, content }) => {
  const existing = await getRefundPolicy();

  if (existing) {
    const query = `
      UPDATE refund_policies
      SET title = $1,
          content = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, title, content, created_at, updated_at
    `;
    const result = await pool.query(query, [
      title || existing.title,
      content,
      existing.id,
    ]);
    return result.rows[0];
  } else {
    const query = `
      INSERT INTO refund_policies (title, content)
      VALUES ($1, $2)
      RETURNING id, title, content, created_at, updated_at
    `;
    const result = await pool.query(query, [
      title || "Refund & Return Policy",
      content,
    ]);
    return result.rows[0];
  }
};

module.exports = {
  getRefundPolicy,
  upsertRefundPolicy,
};
