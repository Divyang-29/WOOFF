const { findUserByPhone } = require("../models/userModel");

// Admin Authorization Middleware
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please authenticate first.",
      });
    }

    // Check role in token payload or verify against DB
    if (req.user.role === "admin") {
      return next();
    }

    // Fetch user from DB if role is not in JWT payload
    if (req.user.phone_number) {
      const user = await findUserByPhone(req.user.phone_number);
      if (user && user.role === "admin") {
        req.user.role = "admin";
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: "Access Denied. Administrator privileges required.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization verification error",
    });
  }
};

module.exports = adminMiddleware;
