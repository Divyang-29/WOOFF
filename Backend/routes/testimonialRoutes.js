const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createTestimonialHandler,
  getAllTestimonialsHandler,
  updateTestimonialHandler,
  deleteTestimonialHandler,
} = require("../controllers/testimonialController");

const router = express.Router();

// Public route to view testimonials ("Word on the street is")
router.get("/", getAllTestimonialsHandler);

// Protected Admin routes to manage testimonials
router.post("/", authMiddleware, adminMiddleware, createTestimonialHandler);
router.put("/:id", authMiddleware, adminMiddleware, updateTestimonialHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTestimonialHandler);

module.exports = router;
