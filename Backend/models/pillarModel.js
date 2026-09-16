const pool = require("../config/db");

// Get All Pillars
const getAllPillars = async () => {
  const query = `
    SELECT id, title, desc_text AS desc, desc_text, icon, display_order, created_at
    FROM pillars
    ORDER BY display_order ASC, id ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get Pillar By ID
const getPillarById = async (id) => {
  const query = `
    SELECT id, title, desc_text AS desc, desc_text, icon, display_order, created_at
    FROM pillars
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Create Pillar
const createPillar = async ({ title, desc_text, icon, display_order = 0 }) => {
  const query = `
    INSERT INTO pillars (title, desc_text, icon, display_order)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, desc_text, icon, display_order, created_at
  `;
  const result = await pool.query(query, [title, desc_text, icon, display_order]);
  return result.rows[0];
};

// Update Pillar
const updatePillar = async (id, data) => {
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
  if (data.icon) {
    fields.push(`icon = $${paramIdx++}`);
    values.push(data.icon);
  }
  if (data.display_order !== undefined) {
    fields.push(`display_order = $${paramIdx++}`);
    values.push(data.display_order);
  }

  if (fields.length === 0) return await getPillarById(id);

  values.push(id);
  const query = `
    UPDATE pillars
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING *
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete Pillar
const deletePillar = async (id) => {
  const query = `
    DELETE FROM pillars
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllPillars,
  getPillarById,
  createPillar,
  updatePillar,
  deletePillar,
};
