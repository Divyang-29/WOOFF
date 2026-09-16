require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const pool = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

// Strict CORS configuration
const rawOrigins = process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature", "x-signature"],
};

app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Global API rate limiting
app.use(apiLimiter);

// Parse JSON while preserving raw body for cryptographic webhook signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const privacyPolicyRoutes = require("./routes/privacyPolicyRoutes");
const contactRoutes = require("./routes/contactRoutes");
const termsRoutes = require("./routes/termsRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const videoRoutes = require("./routes/videoRoutes");
const shippingPolicyRoutes = require("./routes/shippingPolicyRoutes");
const refundPolicyRoutes = require("./routes/refundPolicyRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const addressRoutes = require("./routes/addressRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const couponRoutes = require("./routes/couponRoutes");
const adminRoutes = require("./routes/adminRoutes");
const faqRoutes = require("./routes/faqRoutes");
const benefitRoutes = require("./routes/benefitRoutes");
const pillarRoutes = require("./routes/pillarRoutes");
const blogRoutes = require("./routes/blogRoutes");

app.use("/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/categories", categoryRoutes);
app.use("/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/products", productRoutes);
app.use("/product", productRoutes);
app.use("/privacy-policy", privacyPolicyRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/contact-us", contactRoutes);
app.use("/contact", contactRoutes);
app.use("/terms-and-conditions", termsRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/testimonials", testimonialRoutes);
app.use("/testimonial", testimonialRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/faq", faqRoutes);
app.use("/faqs", faqRoutes);
app.use("/faq", faqRoutes);
app.use("/api/benefits", benefitRoutes);
app.use("/benefits", benefitRoutes);
app.use("/api/pillars", pillarRoutes);
app.use("/pillars", pillarRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/video", videoRoutes);
app.use("/video", videoRoutes);
app.use("/shipping-policy", shippingPolicyRoutes);
app.use("/shipment-policy", shippingPolicyRoutes);
app.use("/refund-policy", refundPolicyRoutes);
app.use("/return-policy", refundPolicyRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/certificate", certificateRoutes);
app.use("/certificates", certificateRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/addresses", addressRoutes);
app.use("/address", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/orders", orderRoutes);
app.use("/order", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/payments", paymentRoutes);
app.use("/payment", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/webhook", webhookRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/blog", blogRoutes);
app.use("/blogs", blogRoutes);
app.use("/blog", blogRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Wooff API Running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Centralized Error Handling Middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`[${signal}] Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    pool.end(() => {
      console.log("Database connection pool closed.");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("Forceful shutdown timeout triggered.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));