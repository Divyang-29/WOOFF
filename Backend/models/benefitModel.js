const pool = require("../config/db");

// Get All Benefits
const getAllBenefits = async () => {
  const query = `
    SELECT id, title, desc_text AS desc, desc_text, image_url AS image, image_url, display_order, created_at
    FROM benefits
    ORDER BY display_order ASC, id ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get Benefit By ID
const getBenefitById = async (id) => {
  const query = `
    SELECT id, title, desc_text AS desc, desc_text, image_url AS image, image_url, display_order, created_at
    FROM benefits
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Create Benefit
const createBenefit = async ({ title, desc_text, image_url, display_order = 0 }) => {
  const query = `
    INSERT INTO benefits (title, desc_text, image_url, display_order)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, desc_text, image_url, display_order, created_at
  `;
  const result = await pool.query(query, [title, desc_text, image_url, display_order]);
  return result.rows[0];
};

// Update Benefit
const updateBenefit = async (id, data) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (data.title) {
    fields.push(`title = $${paramIdx++}`);
    values.push(data.title);
  }
  if (data.desc_text || data.desc) {
    fields.push(`desc_text = $${paramIdx++}`);
    values.push(data.desc_text || data.desc);
  }
  if (data.image_url || data.image) {
    fields.push(`image_url = $${paramIdx++}`);
    values.push(data.image_url || data.image);
  }
  if (data.display_order !== undefined) {
    fields.push(`display_order = $${paramIdx++}`);
    values.push(data.display_order);
  }

  if (fields.length === 0) return await getBenefitById(id);

  values.push(id);
  const query = `
    UPDATE benefits
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING *
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete Benefit
const deleteBenefit = async (id) => {
  const query = `
    DELETE FROM benefits
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllBenefits,
  getBenefitById,
  createBenefit,
  updateBenefit,
  deleteBenefit,
};
