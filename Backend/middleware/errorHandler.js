// Centralized Error Handling Middleware (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Server-side logging for diagnostics
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // 1. JSON parsing error in request body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body.",
    });
  }

  // 2. Multer file upload errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 50MB maximum allowed limit.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // 3. CORS origin rejection
  if (err.message && err.message.includes("CORS policy")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  // 4. Default / General HTTP errors
  const statusCode = err.status || err.statusCode || 500;
  const message =
    isProduction && statusCode === 500
      ? "Internal server error. Please try again later."
      : err.message || "An unexpected error occurred.";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
