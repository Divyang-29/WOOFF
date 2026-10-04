const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendWhatsAppOTP: dispatchWhatsAppOTP } = require("../utils/whatsappService");

const {
  findUserByPhone,
  findUserByEmail,
  createUserWithEmail,
  saveOTPByPhone,
  updateUserProfile,
  clearOTP,
} = require("../models/userModel");

// Password hashing helpers
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
};


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

// Email & Password Register
const register = async (req, res) => {
  try {
    const { email, password, username, fullName, childName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email address and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please sign in.",
      });
    }

    const passwordHash = hashPassword(password);
    const displayName = fullName || username || cleanEmail.split("@")[0];

    const newUser = await createUserWithEmail({
      email: cleanEmail,
      passwordHash,
      username: displayName,
      childName: childName || null,
    });

    const jwtSecret = process.env.JWT_SECRET || "wooff_secret_key_123";
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role || "user",
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        childName: newUser.child_name || childName || "",
        role: newUser.role || "user",
      },
    });
  } catch (error) {
    console.error("Email Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create account.",
    });
  }
};

// Email & Password Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email address and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user || !user.password_hash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "wooff_secret_key_123";
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || "user",
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Welcome back!",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        childName: user.child_name || "",
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("Email Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error during login.",
    });
  }
};


module.exports = {
  sendWhatsAppOTP,
  verifyWhatsAppOTP,
  resendWhatsAppOTP,
  register,
  login,
};