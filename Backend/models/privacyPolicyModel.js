const pool = require("../config/db");

// Get Latest Privacy Policy
const getPrivacyPolicy = async () => {
  const query = `
    SELECT id, title, content, created_at, updated_at
    FROM privacy_policies
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query);
  return result.rows[0] || null;
};

// Upsert Privacy Policy (Create or Update single active policy)
const upsertPrivacyPolicy = async ({ title, content }) => {
  const existing = await getPrivacyPolicy();

  if (existing) {
    const query = `
      UPDATE privacy_policies
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
      INSERT INTO privacy_policies (title, content)
      VALUES ($1, $2)
      RETURNING id, title, content, created_at, updated_at
    `;
    const result = await pool.query(query, [
      title || "Privacy Policy",
      content,
    ]);
    return result.rows[0];
  }
};

module.exports = {
  getPrivacyPolicy,
  upsertPrivacyPolicy,
};
