const rateLimit = require("express-rate-limit");

// Strict Rate Limiter for Authentication & OTP Endpoints (10 requests per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 OTP / login requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many authentication requests from this IP. Please try again after 15 minutes.",
  },
});

// General API Rate Limiter (300 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again shortly.",
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
