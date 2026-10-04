const pool = require("../config/db");

const BLOG_COLUMNS = `
  id, title, slug, content, image_url, author,
  COALESCE(category, 'Dental Health') AS category,
  COALESCE(tags, 'OralCare, KidsWellness, Wooff') AS tags,
  excerpt,
  COALESCE(reading_time, '5 min read') AS reading_time,
  COALESCE(author_role, 'Pediatric Dental Specialist') AS author_role,
  COALESCE(author_avatar, '/assets/wooff-logo.png') AS author_avatar,
  author_bio,
  image_caption,
  COALESCE(faqs, '[]'::jsonb) AS faqs,
  COALESCE(conclusion_takeaways, '[]'::jsonb) AS conclusion_takeaways,
  created_at,
  COALESCE(updated_at, created_at) AS updated_at
`;

const ensureJsonString = (val) => {
  if (val === undefined || val === null || val === '') return '[]';
  if (typeof val === 'string') {
    try {
      JSON.parse(val);
      return val;
    } catch {
      const lines = val.split('\n').map((s) => s.trim()).filter(Boolean);
      return JSON.stringify(lines);
    }
  }
  return JSON.stringify(val);
};

// Get All Blogs ordered by created_at DESC
const getAllBlogs = async () => {
  const query = `
    SELECT ${BLOG_COLUMNS}
    FROM blogs
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get Blog By Slug
const getBlogBySlug = async (slug) => {
  const query = `
    SELECT ${BLOG_COLUMNS}
    FROM blogs
    WHERE slug = $1
  `;
  const result = await pool.query(query, [slug]);
  return result.rows[0];
};

// Get Blog By ID
const getBlogById = async (id) => {
  const query = `
    SELECT ${BLOG_COLUMNS}
    FROM blogs
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Create New Blog
const createBlog = async ({
  title,
  slug,
  content,
  image_url,
  author,
  category = 'Dental Health',
  tags = 'OralCare, KidsWellness, Wooff',
  excerpt = '',
  reading_time = '5 min read',
  author_role = 'Pediatric Dental Specialist',
  author_avatar = '/assets/wooff-logo.png',
  author_bio = '',
  image_caption = '',
  faqs = [],
  conclusion_takeaways = [],
}) => {
  const generatedSlug =
    slug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const query = `
    INSERT INTO blogs (
      title, slug, content, image_url, author,
      category, tags, excerpt, reading_time,
      author_role, author_avatar, author_bio, image_caption,
      faqs, conclusion_takeaways, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
    RETURNING ${BLOG_COLUMNS}
  `;

  const values = [
    title,
    generatedSlug,
    content,
    image_url,
    author || 'Wooff Dental Team',
    category,
    tags,
    excerpt,
    reading_time,
    author_role,
    author_avatar,
    author_bio,
    image_caption,
    ensureJsonString(faqs),
    ensureJsonString(conclusion_takeaways),
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update Blog
const updateBlog = async (id, data) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  const allowedFields = [
    'title',
    'slug',
    'content',
    'image_url',
    'author',
    'category',
    'tags',
    'excerpt',
    'reading_time',
    'author_role',
    'author_avatar',
    'author_bio',
    'image_caption',
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIdx++}`);
      values.push(data[field]);
    }
  }

  if (data.faqs !== undefined) {
    fields.push(`faqs = $${paramIdx++}::jsonb`);
    values.push(ensureJsonString(data.faqs));
  }

  if (data.conclusion_takeaways !== undefined) {
    fields.push(`conclusion_takeaways = $${paramIdx++}::jsonb`);
    values.push(ensureJsonString(data.conclusion_takeaways));
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  if (fields.length === 1) return await getBlogById(id);

  values.push(id);
  const query = `
    UPDATE blogs
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING ${BLOG_COLUMNS}
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
