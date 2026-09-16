const pool = require("../config/db");

// Get All FAQs ordered by display_order
const getAllFaqs = async () => {
  const query = `
    SELECT id, question, answer, display_order, created_at
    FROM faqs
    ORDER BY display_order ASC, id ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get FAQ By ID
const getFaqById = async (id) => {
  const query = `
    SELECT id, question, answer, display_order, created_at
    FROM faqs
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Create New FAQ
const createFaq = async ({ question, answer, display_order = 0 }) => {
  const query = `
    INSERT INTO faqs (question, answer, display_order)
    VALUES ($1, $2, $3)
    RETURNING id, question, answer, display_order, created_at
  `;
  const result = await pool.query(query, [question, answer, display_order]);
  return result.rows[0];
};

// Update FAQ
const updateFaq = async (id, { question, answer, display_order }) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (question) {
    fields.push(`question = $${paramIdx++}`);
    values.push(question);
  }
  if (answer) {
    fields.push(`answer = $${paramIdx++}`);
    values.push(answer);
  }
  if (display_order !== undefined) {
    fields.push(`display_order = $${paramIdx++}`);
    values.push(display_order);
  }

  if (fields.length === 0) return await getFaqById(id);

  values.push(id);
  const query = `
    UPDATE faqs
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING id, question, answer, display_order, created_at
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete FAQ
const deleteFaq = async (id) => {
  const query = `
    DELETE FROM faqs
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
};
