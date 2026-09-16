const pool = require("../config/db");

// Get Latest Shipping Policy
const getShippingPolicy = async () => {
  const query = `
    SELECT id, title, content, created_at, updated_at
    FROM shipping_policies
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query);
  return result.rows[0] || null;
};

// Upsert Shipping Policy (Create or Update active policy)
const upsertShippingPolicy = async ({ title, content }) => {
  const existing = await getShippingPolicy();

  if (existing) {
    const query = `
      UPDATE shipping_policies
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
      INSERT INTO shipping_policies (title, content)
      VALUES ($1, $2)
      RETURNING id, title, content, created_at, updated_at
    `;
    const result = await pool.query(query, [
      title || "Shipping & Delivery Policy",
      content,
    ]);
    return result.rows[0];
  }
};

module.exports = {
  getShippingPolicy,
  upsertShippingPolicy,
};
