const pool = require("../config/db");

// Create New Contact Message
const createContactMessage = async ({ name, email, subject = "", phone_number = "", message }) => {
  const query = `
    INSERT INTO contact_messages (name, email, subject, phone_number, message)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, subject, phone_number, message, created_at
  `;
  const values = [name, email, subject || "", phone_number || "", message];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get All Submitted Contact Messages (Admin)
const getAllContactMessages = async () => {
  const query = `
    SELECT id, name, email, subject, phone_number, message, created_at
    FROM contact_messages
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Delete Contact Message By ID (Admin)
const deleteContactMessage = async (id) => {
  const query = `
    DELETE FROM contact_messages
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createContactMessage,
  getAllContactMessages,
  deleteContactMessage,
};
