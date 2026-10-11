const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  trackAbandonedCartHandler,
  getAbandonedCartsAdminHandler,
  updateAbandonedCartStatusHandler,
  deleteAbandonedCartHandler,
} = require("../controllers/abandonedCartController");

const router = express.Router();

// Public / Customer endpoint to track checkout drop-offs
router.post("/track", trackAbandonedCartHandler);
router.post("/abandoned", trackAbandonedCartHandler);

// Admin-only recovery routes
router.get("/", authMiddleware, adminMiddleware, getAbandonedCartsAdminHandler);
router.get("/admin", authMiddleware, adminMiddleware, getAbandonedCartsAdminHandler);
router.put("/:id/status", authMiddleware, adminMiddleware, updateAbandonedCartStatusHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteAbandonedCartHandler);

module.exports = router;
