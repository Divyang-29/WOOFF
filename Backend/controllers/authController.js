const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendWhatsAppOTP: dispatchWhatsAppOTP } = require("../utils/whatsappService");

const {
  findUserByPhone,
  saveOTPByPhone,
  updateUserProfile,
  clearOTP,
} = require("../models/userModel");

// Send WhatsApp 6-Digit OTP (Passwordless Login / Register Step 1)
const sendWhatsAppOTP = async (req, res) => {
  try {
    const { phoneNumber, phone } = req.body;
    const targetPhone = phoneNumber || phone;

    if (!targetPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const cleanedPhone = targetPhone.trim();
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await saveOTPByPhone(cleanedPhone, otp, otpExpiry);

    const dispatchResult = await dispatchWhatsAppOTP(cleanedPhone, otp);

    return res.status(200).json({
      success: true,
      message: "6-digit OTP sent successfully via WhatsApp",
      provider: dispatchResult.provider,
    });
  } catch (error) {
    console.error("Send WhatsApp OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send WhatsApp OTP",
    });
  }
};

// Verify WhatsApp 6-Digit OTP (Passwordless Login / Register Step 2)
const verifyWhatsAppOTP = async (req, res) => {
  try {
    const { phoneNumber, phone, otp, username, birthdate, gender } = req.body;
    const targetPhone = phoneNumber || phone;

    if (!targetPhone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and 6-digit OTP are required",
      });
    }

    const cleanedPhone = targetPhone.trim();
    const user = await findUserByPhone(cleanedPhone);

    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or request expired. Please request a new OTP.",
      });
    }

    if (user.otp !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid 6-digit OTP code",
      });
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new code.",
      });
    }

    if (username || birthdate || gender) {
      await updateUserProfile(user.id, { username, birthdate, gender });
    }

    await clearOTP(user.id);

    const updatedUser = await findUserByPhone(cleanedPhone);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured on the server");
    }

    const token = jwt.sign(
      {
        id: updatedUser.id,
        phone_number: updatedUser.phone_number,
        username: updatedUser.username,
        role: updatedUser.role || "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      token,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        phone_number: updatedUser.phone_number,
        role: updatedUser.role || "user",
        birthdate: updatedUser.birthdate,
        gender: updatedUser.gender,
      },
    });
  } catch (error) {
    console.error("Verify WhatsApp OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error during OTP verification",
    });
  }
};

// Resend WhatsApp 6-Digit OTP
const resendWhatsAppOTP = async (req, res) => {
  try {
    const { phoneNumber, phone } = req.body;
    const targetPhone = phoneNumber || phone;

    if (!targetPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const cleanedPhone = targetPhone.trim();
    const user = await findUserByPhone(cleanedPhone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found for this phone number. Please request a new OTP.",
      });
    }

    // Generate new secure 6-digit OTP code & 10-min expiry
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await saveOTPByPhone(cleanedPhone, otp, otpExpiry);

    const dispatchResult = await dispatchWhatsAppOTP(cleanedPhone, otp);

    return res.status(200).json({
      success: true,
      message: "6-digit OTP resent successfully via WhatsApp",
      provider: dispatchResult.provider,
    });
  } catch (error) {
    console.error("Resend WhatsApp OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resend WhatsApp OTP",
    });
  }
};

// Register Alias (Passwordless WhatsApp OTP)
const register = async (req, res) => {
  return sendWhatsAppOTP(req, res);
};

// Login Alias (Passwordless WhatsApp OTP)
const login = async (req, res) => {
  return sendWhatsAppOTP(req, res);
};

module.exports = {
  sendWhatsAppOTP,
  verifyWhatsAppOTP,
  resendWhatsAppOTP,
  register,
  login,
};