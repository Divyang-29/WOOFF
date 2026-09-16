const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getAllPillarsHandler,
  getPillarByIdHandler,
  createPillarHandler,
  updatePillarHandler,
  deletePillarHandler,
} = require("../controllers/pillarController");

const router = express.Router();

// Public routes
router.get("/", getAllPillarsHandler);
router.get("/:id", getPillarByIdHandler);

// Protected admin routes
router.post("/", authMiddleware, adminMiddleware, createPillarHandler);
router.put("/:id", authMiddleware, adminMiddleware, updatePillarHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deletePillarHandler);

module.exports = router;
