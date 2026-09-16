const pool = require("../config/db");

// Get All Blogs ordered by created_at DESC (newest posts first)
const getAllBlogs = async () => {
  const query = `
    SELECT id, title, slug, content, image_url, author, created_at
    FROM blogs
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get Blog By Slug
const getBlogBySlug = async (slug) => {
  const query = `
    SELECT id, title, slug, content, image_url, author, created_at
    FROM blogs
    WHERE slug = $1
  `;
  const result = await pool.query(query, [slug]);
  return result.rows[0];
};

// Get Blog By ID
const getBlogById = async (id) => {
  const query = `
    SELECT id, title, slug, content, image_url, author, created_at
    FROM blogs
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Create New Blog
const createBlog = async ({ title, slug, content, image_url, author }) => {
  const generatedSlug =
    slug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const query = `
    INSERT INTO blogs (title, slug, content, image_url, author)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, title, slug, content, image_url, author, created_at
  `;
  const result = await pool.query(query, [title, generatedSlug, content, image_url, author]);
  return result.rows[0];
};

// Update Blog
const updateBlog = async (id, { title, slug, content, image_url, author }) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (title) {
    fields.push(`title = $${paramIdx++}`);
    values.push(title);
  }
  if (slug) {
    fields.push(`slug = $${paramIdx++}`);
    values.push(slug);
  }
  if (content) {
    fields.push(`content = $${paramIdx++}`);
    values.push(content);
  }
  if (image_url !== undefined) {
    fields.push(`image_url = $${paramIdx++}`);
    values.push(image_url);
  }
  if (author) {
    fields.push(`author = $${paramIdx++}`);
    values.push(author);
  }

  if (fields.length === 0) return await getBlogById(id);

  values.push(id);
  const query = `
    UPDATE blogs
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING id, title, slug, content, image_url, author, created_at
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete Blog
const deleteBlog = async (id) => {
  const query = `
    DELETE FROM blogs
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
