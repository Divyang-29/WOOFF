const pool = require("../config/db");

// Get Latest Terms & Conditions
const getTermsAndConditions = async () => {
  const query = `
    SELECT id, title, content, created_at, updated_at
    FROM terms_and_conditions
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query);
  return result.rows[0] || null;
};

// Upsert Terms & Conditions (Create or Update active terms)
const upsertTermsAndConditions = async ({ title, content }) => {
  const existing = await getTermsAndConditions();

  if (existing) {
    const query = `
      UPDATE terms_and_conditions
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
      INSERT INTO terms_and_conditions (title, content)
      VALUES ($1, $2)
      RETURNING id, title, content, created_at, updated_at
    `;
    const result = await pool.query(query, [
      title || "Terms & Conditions",
      content,
    ]);
    return result.rows[0];
  }
};

module.exports = {
  getTermsAndConditions,
  upsertTermsAndConditions,
};
