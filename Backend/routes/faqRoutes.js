const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAllFaqsHandler,
  getFaqByIdHandler,
  createFaqHandler,
  updateFaqHandler,
  deleteFaqHandler,
} = require("../controllers/faqController");

const router = express.Router();

// Public route to view all FAQs
router.get("/", getAllFaqsHandler);

// Public route to view FAQ by id
router.get("/:id", getFaqByIdHandler);

// Protected admin routes
router.post("/", authMiddleware, adminMiddleware, createFaqHandler);
router.put("/:id", authMiddleware, adminMiddleware, updateFaqHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteFaqHandler);

module.exports = router;
