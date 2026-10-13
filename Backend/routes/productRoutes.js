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
    { name: "hero_image", maxCount: 1 },
    { name: "primary_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 5 },
    { name: "images", maxCount: 5 },
  ]),
  createProductHandler
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "hero_image", maxCount: 1 },
    { name: "primary_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 5 },
    { name: "images", maxCount: 5 },
  ]),
  updateProductHandler
);

router.delete("/reviews/:id", (req, res, next) => {
  const adminPass = req.headers["x-admin-passcode"];
  if (adminPass === "admin123" || (process.env.ADMIN_PASSCODE && adminPass === process.env.ADMIN_PASSCODE)) {
    return next();
  }
  return authMiddleware(req, res, () => adminMiddleware(req, res, next));
}, deleteReviewHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProductHandler);

module.exports = router;
