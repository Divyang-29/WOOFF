const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  createCouponHandler,
  getAllCouponsHandler,
  getCouponByIdHandler,
  updateCouponHandler,
  deleteCouponHandler,
  validateCouponHandler,
} = require("../controllers/couponController");

const router = express.Router();

// Public / User route to validate promo code
router.post("/validate", validateCouponHandler);

// Admin-Only CRUD routes
router.get("/", authMiddleware, adminMiddleware, getAllCouponsHandler);
router.get("/:id", authMiddleware, adminMiddleware, getCouponByIdHandler);
router.post("/", authMiddleware, adminMiddleware, createCouponHandler);
router.put("/:id", authMiddleware, adminMiddleware, updateCouponHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCouponHandler);

module.exports = router;
