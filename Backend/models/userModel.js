const pool = require("../config/db");

// Find User By Phone Number
const findUserByPhone = async (phoneNumber) => {
  const query = `
    SELECT * FROM users
    WHERE phone_number = $1
  `;
  const result = await pool.query(query, [phoneNumber]);
  return result.rows[0];
};

// Find User By Username
const findUserByUsername = async (username) => {
  const query = `
    SELECT * FROM users
    WHERE username = $1
  `;
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

// Create Passwordless User via Phone
const createPhoneUser = async (phoneNumber, username = null, birthdate = null, gender = null) => {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const defaultUsername = username || `user_${cleanNumber.slice(-6)}${randomSuffix}`;

  const query = `
    INSERT INTO users (phone_number, username, birthdate, gender)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, phone_number, gender, birthdate, created_at
  `;

  const values = [phoneNumber, defaultUsername, birthdate, gender];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Save/Update OTP by Phone Number
const saveOTPByPhone = async (phoneNumber, otp, otpExpiry) => {
  const existingUser = await findUserByPhone(phoneNumber);
  if (existingUser) {
    const query = `
      UPDATE users
      SET otp = $1, otp_expiry = $2
      WHERE phone_number = $3
      RETURNING *
    `;
    const result = await pool.query(query, [otp, otpExpiry, phoneNumber]);
    return result.rows[0];
  } else {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const defaultUsername = `user_${cleanNumber.slice(-6)}${randomSuffix}`;

    const query = `
      INSERT INTO users (phone_number, username, otp, otp_expiry)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [phoneNumber, defaultUsername, otp, otpExpiry]);
    return result.rows[0];
  }
};

// Update Profile Details
const updateUserProfile = async (userId, { username, birthdate, gender }) => {
  const fields = [];
  const values = [];
  let paramIdx = 1;

  if (username) {
    fields.push(`username = $${paramIdx++}`);
    values.push(username);
  }
  if (birthdate) {
    fields.push(`birthdate = $${paramIdx++}`);
    values.push(birthdate);
  }
  if (gender) {
    fields.push(`gender = $${paramIdx++}`);
    values.push(gender);
  }

  if (fields.length === 0) return;

  values.push(userId);
  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${paramIdx}
  `;

  await pool.query(query, values);
};

// Find User By Email
const findUserByEmail = async (email) => {
  const query = `
    SELECT * FROM users
    WHERE LOWER(email) = LOWER($1)
  `;
  const result = await pool.query(query, [email.trim()]);
  return result.rows[0];
};

// Create User with Email and Password
const createUserWithEmail = async ({ email, passwordHash, username = null, childName = null }) => {
  const cleanEmail = email.trim().toLowerCase();
  const defaultUsername = username || cleanEmail.split("@")[0];

  const query = `
    INSERT INTO users (email, password_hash, username, child_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, child_name, role, created_at
  `;

  const values = [cleanEmail, passwordHash, defaultUsername, childName];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Clear User OTP
const clearOTP = async (userId) => {
  const query = `
    UPDATE users
    SET otp = NULL, otp_expiry = NULL
    WHERE id = $1
  `;
  await pool.query(query, [userId]);
};

module.exports = {
  findUserByPhone,
  findUserByUsername,
  findUserByEmail,
  createUserWithEmail,
  createPhoneUser,
  saveOTPByPhone,
  updateUserProfile,
  clearOTP,
};