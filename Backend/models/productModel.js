const pool = require("../config/db");

// Auto migration to ensure is_bestseller column and product_reviews table exist
pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;").catch(() => {});
pool.query(`
  CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    rating NUMERIC(3,2) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`).catch(() => {});

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

// Create Product with Mandatory Category Validation
const createProduct = async ({
  category_id,
  title,
  slug,
  price,
  final_price,
  primary_image,
  images = [],
  description,
  stock = 0,
  sku,
  estimated_delivery = "2-4 business days",
  ingredients = [],
  faqs = [],
}) => {
  if (!category_id) {
    throw new Error("category_id is required. Every product must be assigned to a category.");
  }

  // Verify category exists
  const categoryRes = await pool.query("SELECT id FROM categories WHERE id = $1", [category_id]);
  if (!categoryRes.rows[0]) {
    throw new Error(`Invalid category_id ${category_id}. Specified category does not exist.`);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productSlug = slug ? generateSlug(slug) : generateSlug(title);

    // Insert Product
    const productQuery = `
      INSERT INTO products (
        category_id, title, slug, price, final_price, primary_image, images, description, stock, sku, estimated_delivery, is_active, is_bestseller
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, true, $12)
      RETURNING *
    `;

    const productValues = [
      parseInt(category_id),
      title.trim(),
      productSlug,
      price,
      final_price,
      primary_image,
      JSON.stringify(images),
      description ? description.trim() : null,
      stock,
      sku.trim(),
      estimated_delivery ? estimated_delivery.trim() : "2-4 business days",
      Boolean(is_bestseller),
    ];

    const productRes = await client.query(productQuery, productValues);
    const product = productRes.rows[0];

    // Insert Key Ingredients if provided
    let insertedIngredients = [];
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      for (const ing of ingredients) {
        if (ing.title) {
          const ingRes = await client.query(
            `INSERT INTO product_ingredients (product_id, title, sub_title, description, image_url)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [product.id, ing.title, ing.sub_title || null, ing.description || null, ing.image_url || null]
          );
          insertedIngredients.push(ingRes.rows[0]);
        }
      }
    }

    // Insert FAQs if provided
    let insertedFaqs = [];
    if (Array.isArray(faqs) && faqs.length > 0) {
      for (const faq of faqs) {
        if (faq.question && faq.answer) {
          const faqRes = await client.query(
            `INSERT INTO product_faqs (product_id, question, answer)
             VALUES ($1, $2, $3) RETURNING *`,
            [product.id, faq.question, faq.answer]
          );
          insertedFaqs.push(faqRes.rows[0]);
        }
      }
    }

    await client.query("COMMIT");

    return {
      ...product,
      ingredients: insertedIngredients,
      faqs: insertedFaqs,
      reviews: [],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Get Full Product Page Details by Slug or ID
const getProductBySlugOrId = async (identifier, includeInactive = false) => {
  const isId = !isNaN(identifier);
  let condition = isId ? "p.id = $1" : "p.slug = $1";

  if (!includeInactive) {
    condition += " AND p.is_active = true";
  }

  const productQuery = `
    SELECT 
      p.*, 
      c.name as category_name, 
      c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE ${condition}
  `;

  const productRes = await pool.query(productQuery, [identifier]);
  const product = productRes.rows[0];

  if (!product) return null;

  // Fetch Key Ingredients
  const ingredientsRes = await pool.query(
    `SELECT id, title, sub_title, description, image_url FROM product_ingredients WHERE product_id = $1`,
    [product.id]
  );

  // Fetch FAQs
  const faqsRes = await pool.query(
    `SELECT id, question, answer FROM product_faqs WHERE product_id = $1`,
    [product.id]
  );

  // Fetch Customer Reviews
  const reviewsRes = await pool.query(
    `SELECT id, customer_name, rating, review_text, created_at FROM product_reviews WHERE product_id = $1 ORDER BY created_at DESC`,
    [product.id]
  );

  return {
    ...product,
    ingredients: ingredientsRes.rows,
    faqs: faqsRes.rows,
    reviews: reviewsRes.rows,
  };
};

// Get All Products Listing with Search, Category Filter, Sorting, and Pagination
const getAllProducts = async ({
  category = null,
  search = null,
  sort = "popular",
  page = 1,
  limit = 20,
  includeInactive = false,
} = {}) => {
  const values = [];
  const conditions = [];

  if (!includeInactive) {
    conditions.push("p.is_active = true");
  }

  if (category) {
    values.push(category);
    conditions.push(`(c.slug = $${values.length} OR p.category_id::text = $${values.length})`);
  }

  if (search) {
    values.push(`%${search.trim()}%`);
    conditions.push(`(p.title ILIKE $${values.length} OR p.description ILIKE $${values.length} OR p.sku ILIKE $${values.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Order By Clause
  let orderBy = "ORDER BY p.rating_avg DESC, p.created_at DESC";
  if (sort === "price_asc") {
    orderBy = "ORDER BY p.final_price ASC";
  } else if (sort === "price_desc") {
    orderBy = "ORDER BY p.final_price DESC";
  } else if (sort === "newest") {
    orderBy = "ORDER BY p.created_at DESC";
  }

  // Count Query
  const countQuery = `
    SELECT COUNT(*)::int as total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `;
  const countRes = await pool.query(countQuery, values);
  const totalCount = countRes.rows[0].total;

  // Pagination Values
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const offset = (parsedPage - 1) * parsedLimit;

  values.push(parsedLimit);
  const limitIdx = values.length;
  values.push(offset);
  const offsetIdx = values.length;

  const dataQuery = `
    SELECT 
      p.*, 
      c.name as category_name, 
      c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ${orderBy}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const result = await pool.query(dataQuery, values);

  return {
    products: result.rows,
    pagination: {
      total_count: totalCount,
      page: parsedPage,
      limit: parsedLimit,
      total_pages: Math.ceil(totalCount / parsedLimit),
    },
  };
};

// Update Product
const updateProduct = async (id, data) => {
  if (data.category_id !== undefined && data.category_id !== null) {
    const categoryRes = await pool.query("SELECT id FROM categories WHERE id = $1", [data.category_id]);
    if (!categoryRes.rows[0]) {
      throw new Error(`Invalid category_id ${data.category_id}. Specified category does not exist.`);
    }
  }

  const fields = [];
  const values = [];
  let paramIdx = 1;

  const allowedFields = [
    "category_id", "title", "slug", "price", "final_price",
    "primary_image", "description", "stock", "sku", "estimated_delivery", "is_active", "is_bestseller"
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIdx++}`);
      values.push(data[field]);
    }
  }

  if (data.images !== undefined) {
    fields.push(`images = $${paramIdx++}::jsonb`);
    values.push(JSON.stringify(data.images));
  }

  if (fields.length === 0) return await getProductBySlugOrId(id, true);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE products
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING *
  `;

  await pool.query(query, values);
  return await getProductBySlugOrId(id, true);
};

// Delete Product from Database
const deleteProduct = async (id) => {
  const query = `
    DELETE FROM products 
    WHERE id = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Add Customer Review and Recalculate Rating Average & Count
const addProductReview = async (productId, { customer_name, rating, review_text }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const reviewQuery = `
      INSERT INTO product_reviews (product_id, customer_name, rating, review_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const reviewRes = await client.query(reviewQuery, [productId, customer_name, rating, review_text || null]);
    const review = reviewRes.rows[0];

    const statsRes = await client.query(
      `SELECT AVG(rating)::numeric(3,2) as rating_avg, COUNT(*)::int as review_count
       FROM product_reviews WHERE product_id = $1`,
      [productId]
    );

    const { rating_avg, review_count } = statsRes.rows[0];

    await client.query(
      `UPDATE products SET rating_avg = $1, review_count = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [rating_avg, review_count, productId]
    );

    await client.query("COMMIT");
    return { review, rating_avg, review_count };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Delete Customer Review and Recalculate Rating Average & Count
const deleteProductReview = async (reviewId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const reviewRes = await client.query("SELECT * FROM product_reviews WHERE id = $1", [reviewId]);
    const review = reviewRes.rows[0];
    if (!review) {
      await client.query("ROLLBACK");
      return null;
    }

    const productId = review.product_id;

    await client.query("DELETE FROM product_reviews WHERE id = $1", [reviewId]);

    const statsRes = await client.query(
      `SELECT COALESCE(AVG(rating)::numeric(3,2), 0.00) as rating_avg, COUNT(*)::int as review_count
       FROM product_reviews WHERE product_id = $1`,
      [productId]
    );

    const { rating_avg, review_count } = statsRes.rows[0];

    await client.query(
      `UPDATE products SET rating_avg = $1, review_count = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [rating_avg, review_count, productId]
    );

    await client.query("COMMIT");
    return { review, rating_avg, review_count, productId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Get All Product Reviews for Admin Panel
const getAllProductReviews = async () => {
  const query = `
    SELECT 
      r.id, 
      r.product_id, 
      r.customer_name, 
      r.rating, 
      r.review_text, 
      r.created_at,
      p.title as product_title,
      p.slug as product_slug
    FROM product_reviews r
    LEFT JOIN products p ON r.product_id = p.id
    ORDER BY r.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createProduct,
  getProductBySlugOrId,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addProductReview,
  deleteProductReview,
  getAllProductReviews,
};
