const pool = require("../config/db");

// Get all hero formulation ingredients (ordered by display_order)
const getAllIngredients = async (onlyActive = true) => {
  const query = onlyActive
    ? "SELECT * FROM hero_ingredients WHERE is_active = true ORDER BY display_order ASC, id ASC"
    : "SELECT * FROM hero_ingredients ORDER BY display_order ASC, id ASC";
  const result = await pool.query(query);
  return result.rows;
};

// Get single ingredient by ID or Slug
const getIngredientByIdOrSlug = async (idOrSlug) => {
  const isNumeric = /^\d+$/.test(String(idOrSlug).trim());
  const query = isNumeric
    ? "SELECT * FROM hero_ingredients WHERE id = $1"
    : "SELECT * FROM hero_ingredients WHERE slug = $1";
  const result = await pool.query(query, [idOrSlug]);
  return result.rows[0] || null;
};

// Create new ingredient
const createIngredient = async (data) => {
  const {
    name,
    slug,
    sub_title = "",
    tag = "",
    description,
    benefits = [],
    badge_text = "Clinically Backed",
    icon_url = "/assets/tooth_paste.webp",
    display_order = 0,
    is_active = true,
  } = data;

  const generatedSlug = slug && slug.trim()
    ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const query = `
    INSERT INTO hero_ingredients (
      name, slug, sub_title, tag, description, benefits, badge_text, icon_url, display_order, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const values = [
    name.trim(),
    generatedSlug,
    sub_title.trim(),
    tag.trim(),
    description.trim(),
    JSON.stringify(Array.isArray(benefits) ? benefits : [benefits]),
    badge_text.trim(),
    icon_url.trim(),
    parseInt(display_order, 10) || 0,
    Boolean(is_active),
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update existing ingredient
const updateIngredient = async (id, data) => {
  const {
    name,
    slug,
    sub_title,
    tag,
    description,
    benefits,
    badge_text,
    icon_url,
    display_order,
    is_active,
  } = data;

  const fields = [];
  const values = [];

  if (name !== undefined) {
    values.push(name.trim());
    fields.push(`name = $${values.length}`);
  }
  if (slug !== undefined) {
    values.push(slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    fields.push(`slug = $${values.length}`);
  }
  if (sub_title !== undefined) {
    values.push(sub_title.trim());
    fields.push(`sub_title = $${values.length}`);
  }
  if (tag !== undefined) {
    values.push(tag.trim());
    fields.push(`tag = $${values.length}`);
  }
  if (description !== undefined) {
    values.push(description.trim());
    fields.push(`description = $${values.length}`);
  }
  if (benefits !== undefined) {
    values.push(JSON.stringify(Array.isArray(benefits) ? benefits : [benefits]));
    fields.push(`benefits = $${values.length}`);
  }
  if (badge_text !== undefined) {
    values.push(badge_text.trim());
    fields.push(`badge_text = $${values.length}`);
  }
  if (icon_url !== undefined) {
    values.push(icon_url.trim());
    fields.push(`icon_url = $${values.length}`);
  }
  if (display_order !== undefined) {
    values.push(parseInt(display_order, 10) || 0);
    fields.push(`display_order = $${values.length}`);
  }
  if (is_active !== undefined) {
    values.push(Boolean(is_active));
    fields.push(`is_active = $${values.length}`);
  }

  if (fields.length === 0) return null;

  values.push(CURRENT_TIMESTAMP = new Date());
  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);
  const query = `
    UPDATE hero_ingredients
    SET ${fields.join(", ")}
    WHERE id = $${values.length}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

// Delete ingredient
const deleteIngredient = async (id) => {
  const result = await pool.query(
    "DELETE FROM hero_ingredients WHERE id = $1 RETURNING id, name",
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  getAllIngredients,
  getIngredientByIdOrSlug,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
