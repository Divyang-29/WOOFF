const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} = require("../controllers/categoryController");

const router = express.Router();

// Public routes
router.get("/", getAllCategoriesHandler);
router.get("/:id", getCategoryByIdHandler);

// Protected Admin routes
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createCategoryHandler);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateCategoryHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategoryHandler);

module.exports = router;
