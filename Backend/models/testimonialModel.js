const pool = require("../config/db");

// Create New Testimonial (Rating, Text, Author)
const createTestimonial = async ({ rating = 5.0, text, author }) => {
  const query = `
    INSERT INTO testimonials (rating, text, author)
    VALUES ($1, $2, $3)
    RETURNING id, rating, text, author, created_at
  `;
  const values = [rating, text, author];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get All Testimonials
const getAllTestimonials = async () => {
  const query = `
    SELECT id, rating, text, author, created_at
    FROM testimonials
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get Testimonial By ID
const getTestimonialById = async (id) => {
  const query = `
    SELECT id, rating, text, author, created_at
    FROM testimonials
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Update Testimonial
const updateTestimonial = async (id, { rating, text, author }) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (rating !== undefined) {
    fields.push(`rating = $${paramIdx++}`);
    values.push(rating);
  }
  if (text) {
    fields.push(`text = $${paramIdx++}`);
    values.push(text);
  }
  if (author) {
    fields.push(`author = $${paramIdx++}`);
    values.push(author);
  }

  if (fields.length === 0) return await getTestimonialById(id);

  values.push(id);
  const query = `
    UPDATE testimonials
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
    RETURNING id, rating, text, author, created_at
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete Testimonial
const deleteTestimonial = async (id) => {
  const query = `
    DELETE FROM testimonials
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};
