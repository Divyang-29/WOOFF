const pool = require("../config/db");

// Auto-migration & seeding for hero_ingredients table
const ensureIngredientTableAndSeed = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_ingredients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        sub_title VARCHAR(255) DEFAULT '',
        tag VARCHAR(100) DEFAULT '',
        description TEXT NOT NULL,
        benefits JSONB DEFAULT '[]'::jsonb,
        badge_text VARCHAR(100) DEFAULT 'Clinically Backed',
        icon_url VARCHAR(500) DEFAULT '/images/ingredients/nhap_clean.png',
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const countRes = await pool.query("SELECT COUNT(*) FROM hero_ingredients;");
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log("[Database] Seeding default hero formulation ingredients...");
      await pool.query(`
        INSERT INTO hero_ingredients (name, slug, sub_title, tag, description, benefits, badge_text, icon_url, display_order, is_active)
        VALUES 
        ('Nano-Hydroxyapatite', 'nano-hydroxyapatite', 'Enamel Mineral Support', 'Rebuilds Enamel', 'A biomimetic mineral that closely resembles the mineral naturally found in teeth. It helps support enamel remineralization safely without harsh chemicals or warning labels.', '["Deposits calcium and phosphate ions into micro-porosities", "Rebuilds and protects tooth enamel", "100% biocompatible and safe if swallowed"]'::jsonb, 'Enamel Protector', '/images/ingredients/nhap_clean.png', 1, true),
        ('Theobromine', 'theobromine', 'Enamel Strength Support', 'Natural Cacao Extract', 'Derived from natural cacao, theobromine has been studied for its potential to support enamel remineralization and crystal growth alongside Nano-hydroxyapatite.', '["Strengthens crystalline enamel structure", "Non-toxic natural cacao component", "Synergizes with Nano-Hydroxyapatite"]'::jsonb, 'Clinically Studied', '/images/ingredients/theobromine_clean.png', 2, true),
        ('Inulin', 'prebiotics-inulin', 'Prebiotic Oral Care', 'Microbiome Balance', 'A naturally derived prebiotic included to nourish beneficial oral bacteria and support a healthy, balanced oral environment.', '["Nourishes protective oral flora", "Suppresses harmful acid-producing bacteria", "Supports whole-mouth wellness"]'::jsonb, 'Prebiotic Care', '/images/ingredients/inulin_clean.png', 3, true),
        ('Vitamin C', 'vitamin-c', 'Antioxidant & Gum Support', 'Collagen Support', 'Vitamin C is a vital antioxidant that contributes to the health of oral tissues and supports a strong, healthy gum environment.', '["Supports healthy collagen production in gums", "Potent antioxidant defence against inflammation", "Nourishes delicate oral tissues"]'::jsonb, 'Gum Support', '/images/ingredients/vitaminc_clean.png', 4, true),
        ('Lactoferrin', 'lactoferrin', 'Natural Oral Defence', 'Salivary Protein', 'A naturally occurring protein found in saliva and mother’s milk, lactoferrin provides natural antimicrobial defence against unwanted mouth bacteria.', '["Bio-mimetic salivary protection", "Maintains oral microbiome equilibrium", "Gentle on developing gums"]'::jsonb, 'Natural Defence', '/images/ingredients/lactoferrin_clean.png', 5, true),
        ('Coenzyme Q10', 'coenzyme-q10', 'Antioxidant Gum Care', 'Cellular Energy', 'A naturally occurring cellular antioxidant widely studied in periodontal and gum tissue care for cellular vitality.', '["Enhances periodontal cellular vitality", "Fights oxidative stress in gum pockets", "Promotes gum healing and resilience"]'::jsonb, 'Periodontal Care', '/images/ingredients/coq10_clean.png', 6, true),
        ('Calcium Gluconate', 'calcium-gluconate', 'Tooth Enamel Support', 'Mineral Building Block', 'Calcium is an essential building block of tooth enamel, working synergistically with nHAp to keep growing teeth mineral-dense and resilient.', '["Provides essential bio-available calcium ions", "Enhances remineralization synergy", "Gentle and non-abrasive"]'::jsonb, 'Essential Mineral', '/images/ingredients/calcium_clean.png', 7, true);
      `);
      console.log("[Database] Hero formulation ingredients seeded successfully.");
    }
  } catch (err) {
    console.warn("[Database] ensureIngredientTableAndSeed notice:", err.message);
  }
};
ensureIngredientTableAndSeed();

// Get all hero formulation ingredients (ordered by display_order)
const getAllIngredients = async (onlyActive = true) => {
  const query = onlyActive
    ? "SELECT * FROM hero_ingredients WHERE is_active = true ORDER BY display_order ASC, id ASC"
    : "SELECT * FROM hero_ingredients ORDER BY display_order ASC, id ASC";
  try {
    const result = await pool.query(query);
    if (result.rows.length === 0) {
      await ensureIngredientTableAndSeed();
      const retryResult = await pool.query(query);
      return retryResult.rows;
    }
    return result.rows;
  } catch (err) {
    if (err.code === "42P01") {
      await ensureIngredientTableAndSeed();
      const retryResult = await pool.query(query);
      return retryResult.rows;
    }
    throw err;
  }
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
  ensureIngredientTableAndSeed,
};
