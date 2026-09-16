const express = require("express");
const {
  getAllBlogsHandler,
  getBlogBySlugHandler,
  getBlogByIdHandler,
  createBlogHandler,
  updateBlogHandler,
  deleteBlogHandler,
} = require("../controllers/blogController");

const router = express.Router();

// GET /api/blogs - fetch all blogs ordered by created_at DESC
router.get("/", getAllBlogsHandler);

// GET /api/blogs/:slug - fetch single blog record where slug matches
router.get("/:slug", getBlogBySlugHandler);

// POST, PUT, DELETE (if needed for blog administration)
router.post("/", createBlogHandler);
router.put("/:id", updateBlogHandler);
router.delete("/:id", deleteBlogHandler);

module.exports = router;
