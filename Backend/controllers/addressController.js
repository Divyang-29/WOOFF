const {
  isValidPinCode,
  createAddress,
  getUserAddresses,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} = require("../models/addressModel");

// Add New Address
const addAddressHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      landmark,
      address_type,
      is_default,
    } = req.body;

    if (!address_line_1 || !city || !state || !postal_code) {
      return res.status(400).json({
        success: false,
        message: "Address line 1, city, state, and postal code are required.",
      });
    }

    if (!isValidPinCode(postal_code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid postal code. Must be a valid 6-digit Indian PIN code (e.g., 110001, 380001).",
      });
    }

    const address = await createAddress(userId, {
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      landmark,
      address_type,
      is_default: Boolean(is_default),
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      address,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add address.",
    });
  }
};

// Get All User Addresses
const getUserAddressesHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await getUserAddresses(userId);
    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get User Addresses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user addresses.",
    });
  }
};

// Update Address
const updateAddressHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (req.body.postal_code && !isValidPinCode(req.body.postal_code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid postal code. Must be a valid 6-digit Indian PIN code.",
      });
    }

    const updated = await updateAddress(parseInt(id), userId, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      address: updated,
    });
  } catch (error) {
    console.error("Update Address Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update address.",
    });
  }
};

// Set Address as Default
const setDefaultAddressHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const defaultAddress = await setDefaultAddress(parseInt(id), userId);

    if (!defaultAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully.",
      address: defaultAddress,
    });
  } catch (error) {
    console.error("Set Default Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set default address.",
    });
  }
};

// Delete Address
const deleteAddressHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await deleteAddress(parseInt(id), userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address.",
    });
  }
};

module.exports = {
  addAddressHandler,
  getUserAddressesHandler,
  updateAddressHandler,
  setDefaultAddressHandler,
  deleteAddressHandler,
};
