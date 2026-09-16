const pool = require("../config/db");

// Create New Video Reel
const createVideoReel = async ({
  product_id = null,
  video_url,
  product_name,
  product_photo,
  price,
  caption = null,
  author = null,
  rating = "5.0 ★",
  reviews_count = "1k+",
  product_slug = null,
}) => {
  const query = `
    INSERT INTO video_reels (product_id, video_url, product_name, product_photo, price, caption, author, rating, reviews_count, product_slug)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const values = [
    product_id,
    video_url,
    product_name,
    product_photo,
    price,
    caption,
    author,
    rating,
    reviews_count,
    product_slug,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get All Video Reels
const getAllVideoReels = async () => {
  const query = `
    SELECT 
      v.id,
      v.video_url,
      v.product_name,
      v.product_photo,
      v.price,
      v.caption,
      v.author,
      v.rating,
      v.reviews_count,
      COALESCE(v.product_slug, p.slug) AS product_slug,
      v.created_at,
      v.product_id
    FROM video_reels v
    LEFT JOIN products p ON v.product_id = p.id
    ORDER BY v.id ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get Video Reel By ID
const getVideoReelById = async (id) => {
  const query = `
    SELECT 
      v.*,
      COALESCE(v.product_slug, p.slug) AS product_slug
    FROM video_reels v
    LEFT JOIN products p ON v.product_id = p.id
    WHERE v.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Update Video Reel
const updateVideoReel = async (id, data) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  const allowed = [
    "product_id",
    "video_url",
    "product_name",
    "product_photo",
    "price",
    "caption",
    "author",
    "rating",
    "reviews_count",
    "product_slug",
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${paramIdx++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return await getVideoReelById(id);

  values.push(id);
  const query = `
    UPDATE video_reels
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING *
  `;
  await pool.query(query, values);
  return await getVideoReelById(id);
};

// Delete Video Reel
const deleteVideoReel = async (id) => {
  const query = `
    DELETE FROM video_reels
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createVideoReel,
  getAllVideoReels,
  getVideoReelById,
  updateVideoReel,
  deleteVideoReel,
};
