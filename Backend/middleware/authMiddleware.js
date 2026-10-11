const jwt = require("jsonwebtoken");

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. No Token Provided",
      });
    }

    const jwtToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!jwtToken) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. Empty Token Provided",
      });
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Token Expired. Please log in again." : "Invalid Token",
    });
  }
};

// Optional Authentication Middleware (Allows guest users if no token provided)
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.user = null;
      return next();
    }

    const jwtToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!jwtToken) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
};

authMiddleware.authMiddleware = authMiddleware;
authMiddleware.optionalAuthMiddleware = optionalAuthMiddleware;

module.exports = authMiddleware;
module.exports.optionalAuthMiddleware = optionalAuthMiddleware;