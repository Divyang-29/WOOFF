const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createProductHandler,
  getAllProductsHandler,
  getProductDetailsHandler,
  updateProductHandler,
  deleteProductHandler,
  addReviewHandler,
  deleteReviewHandler,
  getAllReviewsHandler,
} = require("../controllers/productController");

const router = express.Router();

// Public routes
router.get("/", getAllProductsHandler);
router.get("/reviews/all", getAllReviewsHandler);
router.get("/:slugOrId", getProductDetailsHandler);
router.post("/:id/review", addReviewHandler);

// Protected Admin routes
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "primary_image", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createProductHandler
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "primary_image", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  updateProductHandler
);

router.delete("/reviews/:id", authMiddleware, adminMiddleware, deleteReviewHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProductHandler);

module.exports = router;
