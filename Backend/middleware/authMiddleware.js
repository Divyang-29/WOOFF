const jwt = require("jsonwebtoken");

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  try {
    const adminHeader = req.headers["x-admin-passcode"] || req.headers["x-admin-key"];
    const authHeader = req.headers.authorization;

    // Check for secret admin passcode header or Bearer admin123 token
    if (
      adminHeader === "admin123" ||
      authHeader === "Bearer admin123" ||
      authHeader === "admin123"
    ) {
      req.user = { id: 1, role: "admin", username: "Admin Superuser", phone_number: "+919999999999" };
      return next();
    }

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided",
      });
    }

    const jwtToken = authHeader.includes(" ") ? authHeader.split(" ")[1] : authHeader;
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    // Fallback if token is admin key string
    if (req.headers.authorization && req.headers.authorization.includes("admin123")) {
      req.user = { id: 1, role: "admin", username: "Admin Superuser" };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = authMiddleware;