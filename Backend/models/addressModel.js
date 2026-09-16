const pool = require("../config/db");

// Helper to validate Indian 6-digit PIN code
const isValidPinCode = (pin) => {
  return typeof pin === "string" && /^[1-9][0-9]{5}$/.test(pin.trim());
};

// Create User Address
const createAddress = async (userId, {
  address_line_1,
  address_line_2,
  city,
  state,
  postal_code,
  landmark,
  address_type = "Home",
  is_default = false,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if user has any existing addresses
    const countRes = await client.query(
      "SELECT COUNT(*)::int as count FROM user_addresses WHERE user_id = $1",
      [userId]
    );
    const existingCount = countRes.rows[0].count;

    // First address is automatically set as default
    const shouldBeDefault = is_default || existingCount === 0;

    if (shouldBeDefault) {
      // Unset any existing default address for this user
      await client.query(
        "UPDATE user_addresses SET is_default = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1",
        [userId]
      );
    }

    const insertQuery = `
      INSERT INTO user_addresses (
        user_id, address_line_1, address_line_2, city, state, postal_code, landmark, address_type, is_default
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      userId,
      address_line_1.trim(),
      address_line_2 ? address_line_2.trim() : null,
      city.trim(),
      state.trim(),
      postal_code.trim(),
      landmark ? landmark.trim() : null,
      address_type || "Home",
      shouldBeDefault,
    ];

    const result = await client.query(insertQuery, values);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Get All Addresses for User
const getUserAddresses = async (userId) => {
  const query = `
    SELECT * FROM user_addresses
    WHERE user_id = $1
    ORDER BY is_default DESC, created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Get Single Address by ID and User ID
const getAddressById = async (addressId, userId) => {
  const query = `
    SELECT * FROM user_addresses
    WHERE id = $1 AND user_id = $2
  `;
  const result = await pool.query(query, [addressId, userId]);
  return result.rows[0];
};

// Update Address
const updateAddress = async (addressId, userId, data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure address belongs to user
    const existingRes = await client.query(
      "SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2",
      [addressId, userId]
    );

    if (!existingRes.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    const {
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      landmark,
      address_type,
      is_default,
    } = data;

    if (is_default === true) {
      await client.query(
        "UPDATE user_addresses SET is_default = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1",
        [userId]
      );
    }

    const fields = [];
    const values = [];
    let paramIdx = 1;

    if (address_line_1 !== undefined) {
      fields.push(`address_line_1 = $${paramIdx++}`);
      values.push(address_line_1.trim());
    }
    if (address_line_2 !== undefined) {
      fields.push(`address_line_2 = $${paramIdx++}`);
      values.push(address_line_2 ? address_line_2.trim() : null);
    }
    if (city !== undefined) {
      fields.push(`city = $${paramIdx++}`);
      values.push(city.trim());
    }
    if (state !== undefined) {
      fields.push(`state = $${paramIdx++}`);
      values.push(state.trim());
    }
    if (postal_code !== undefined) {
      fields.push(`postal_code = $${paramIdx++}`);
      values.push(postal_code.trim());
    }
    if (landmark !== undefined) {
      fields.push(`landmark = $${paramIdx++}`);
      values.push(landmark ? landmark.trim() : null);
    }
    if (address_type !== undefined) {
      fields.push(`address_type = $${paramIdx++}`);
      values.push(address_type);
    }
    if (is_default !== undefined) {
      fields.push(`is_default = $${paramIdx++}`);
      values.push(is_default);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(addressId);
    values.push(userId);

    const updateQuery = `
      UPDATE user_addresses
      SET ${fields.join(", ")}
      WHERE id = $${paramIdx++} AND user_id = $${paramIdx}
      RETURNING *
    `;

    const result = await client.query(updateQuery, values);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Set Default Address
const setDefaultAddress = async (addressId, userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check ownership
    const checkRes = await client.query(
      "SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2",
      [addressId, userId]
    );

    if (!checkRes.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    // Step 1: Unset all default addresses for user
    await client.query(
      "UPDATE user_addresses SET is_default = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1",
      [userId]
    );

    // Step 2: Set target address as default
    const updateRes = await client.query(
      "UPDATE user_addresses SET is_default = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *",
      [addressId, userId]
    );

    await client.query("COMMIT");
    return updateRes.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Delete Address
const deleteAddress = async (addressId, userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch address to check if it was default
    const targetRes = await client.query(
      "SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2",
      [addressId, userId]
    );

    const targetAddress = targetRes.rows[0];
    if (!targetAddress) {
      await client.query("ROLLBACK");
      return null;
    }

    // Delete address
    await client.query("DELETE FROM user_addresses WHERE id = $1 AND user_id = $2", [addressId, userId]);

    // If deleted address was default, reassign default to the most recent remaining address
    if (targetAddress.is_default) {
      const remainingRes = await client.query(
        "SELECT id FROM user_addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
        [userId]
      );
      if (remainingRes.rows[0]) {
        await client.query(
          "UPDATE user_addresses SET is_default = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [remainingRes.rows[0].id]
        );
      }
    }

    await client.query("COMMIT");
    return targetAddress;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  isValidPinCode,
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
