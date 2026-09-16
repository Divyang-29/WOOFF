const pool = require("../config/db");

// Helper to generate URL-friendly slug
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// Create Certificate
const createCertificate = async ({
  title,
  slug,
  product_id,
  product_slug,
  image_url,
  description,
}) => {
  let targetProductId = product_id || null;

  // Resolve product_id from product_slug if needed
  if (!targetProductId && product_slug) {
    const prodRes = await pool.query(
      `SELECT id FROM products WHERE slug = $1 OR id::text = $1`,
      [product_slug]
    );
    if (prodRes.rows[0]) {
      targetProductId = prodRes.rows[0].id;
    }
  }

  const certSlug = slug ? generateSlug(slug) : generateSlug(title);

  const query = `
    INSERT INTO certificates (title, slug, product_id, image_url, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [
    title,
    certSlug,
    targetProductId,
    image_url,
    description || null,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get All Certificates (Optionally filtered by product_id or product_slug)
const getAllCertificates = async ({ product_id, product_slug } = {}) => {
  let query = `
    SELECT 
      c.*,
      p.title as product_title,
      p.slug as product_slug
    FROM certificates c
    LEFT JOIN products p ON c.product_id = p.id
  `;
  const values = [];

  if (product_id) {
    query += ` WHERE c.product_id = $1`;
    values.push(product_id);
  } else if (product_slug) {
    query += ` WHERE p.slug = $1 OR c.product_id::text = $1`;
    values.push(product_slug);
  }

  query += ` ORDER BY c.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

// Get Certificate By Slug or ID
const getCertificateBySlugOrId = async (identifier) => {
  const isId = !isNaN(identifier) && Number.isInteger(Number(identifier));
  const condition = isId ? "c.id = $1" : "c.slug = $1";

  const query = `
    SELECT 
      c.*,
      p.title as product_title,
      p.slug as product_slug
    FROM certificates c
    LEFT JOIN products p ON c.product_id = p.id
    WHERE ${condition}
  `;

  const result = await pool.query(query, [identifier]);
  return result.rows[0];
};

// Update Certificate
const updateCertificate = async (
  id,
  { title, slug, product_id, product_slug, image_url, description }
) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramIdx++}`);
    values.push(title);
    if (!slug) {
      fields.push(`slug = $${paramIdx++}`);
      values.push(generateSlug(title));
    }
  }

  if (slug !== undefined) {
    fields.push(`slug = $${paramIdx++}`);
    values.push(generateSlug(slug));
  }

  if (product_id !== undefined) {
    fields.push(`product_id = $${paramIdx++}`);
    values.push(product_id);
  } else if (product_slug !== undefined) {
    let targetProdId = null;
    if (product_slug) {
      const prodRes = await pool.query(
        `SELECT id FROM products WHERE slug = $1 OR id::text = $1`,
        [product_slug]
      );
      if (prodRes.rows[0]) targetProdId = prodRes.rows[0].id;
    }
    fields.push(`product_id = $${paramIdx++}`);
    values.push(targetProdId);
  }

  if (image_url !== undefined) {
    fields.push(`image_url = $${paramIdx++}`);
    values.push(image_url);
  }

  if (description !== undefined) {
    fields.push(`description = $${paramIdx++}`);
    values.push(description);
  }

  if (fields.length === 0) {
    return await getCertificateBySlugOrId(id);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);
  const query = `
    UPDATE certificates
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] ? await getCertificateBySlugOrId(result.rows[0].id) : null;
};

// Delete Certificate
const deleteCertificate = async (id) => {
  const query = `
    DELETE FROM certificates
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createCertificate,
  getAllCertificates,
  getCertificateBySlugOrId,
  updateCertificate,
  deleteCertificate,
  generateSlug,
};
