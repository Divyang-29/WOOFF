const rateLimit = require("express-rate-limit");

// Strict Rate Limiter for Authentication & OTP Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests from this IP. Please try again after 15 minutes.",
  },
});

// General API Rate Limiter (Relaxed for e-commerce browsing & checkout)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Generous limit to prevent DDoS while never blocking legitimate shoppers or dev HMR
  standardHeaders: true,
  legacyHeaders: false,
  // Never throttle public read-only requests (product catalog, categories, blogs, certificates, reviews)
  skip: (req) => req.method === "GET" || req.method === "OPTIONS" || req.method === "HEAD",
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again shortly.",
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};

