const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAllBenefitsHandler,
  getBenefitByIdHandler,
  createBenefitHandler,
  updateBenefitHandler,
  deleteBenefitHandler,
} = require("../controllers/benefitController");

const router = express.Router();

// Public routes
router.get("/", getAllBenefitsHandler);
router.get("/:id", getBenefitByIdHandler);

// Protected admin routes
router.post("/", authMiddleware, adminMiddleware, createBenefitHandler);
router.put("/:id", authMiddleware, adminMiddleware, updateBenefitHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBenefitHandler);

module.exports = router;
