const pool = require("../config/db");

// Create Category
const createCategory = async ({ name, slug, description, image_url }) => {
  const query = `
    INSERT INTO categories (name, slug, description, image_url)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [name, slug, description || null, image_url || null];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get All Categories
const getAllCategories = async () => {
  const query = `
    SELECT * FROM categories
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get Category By ID
const getCategoryById = async (id) => {
  const query = `
    SELECT * FROM categories
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Get Category By Slug
const getCategoryBySlug = async (slug) => {
  const query = `
    SELECT * FROM categories
    WHERE slug = $1
  `;
  const result = await pool.query(query, [slug]);
  return result.rows[0];
};

// Update Category
const updateCategory = async (id, { name, slug, description, image_url }) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (name) {
    fields.push(`name = $${paramIdx++}`);
    values.push(name);
  }
  if (slug) {
    fields.push(`slug = $${paramIdx++}`);
    values.push(slug);
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIdx++}`);
    values.push(description);
  }
  if (image_url) {
    fields.push(`image_url = $${paramIdx++}`);
    values.push(image_url);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);
  const query = `
    UPDATE categories
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete Category
const deleteCategory = async (id) => {
  const query = `
    DELETE FROM categories
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
