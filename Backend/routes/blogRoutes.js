const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getAllBlogsHandler,
  getBlogBySlugHandler,
  getBlogByIdHandler,
  createBlogHandler,
  updateBlogHandler,
  deleteBlogHandler,
} = require("../controllers/blogController");

const router = express.Router();

// GET /api/blogs - fetch all blogs ordered by created_at DESC (Public)
router.get("/", getAllBlogsHandler);

// GET /api/blogs/:slug - fetch single blog record where slug matches (Public)
router.get("/:slug", getBlogBySlugHandler);

// Protected Admin routes for blog management
router.post("/", authMiddleware, adminMiddleware, createBlogHandler);
router.put("/:id", authMiddleware, adminMiddleware, updateBlogHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBlogHandler);

module.exports = router;
