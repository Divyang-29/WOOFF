const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createVideoReelHandler,
  getAllVideoReelsHandler,
  updateVideoReelHandler,
  deleteVideoReelHandler,
} = require("../controllers/videoController");

const router = express.Router();

// Public route to view video section reels ("This is Brushers Co.")
router.get("/", getAllVideoReelsHandler);

// Protected Admin routes to create, update, and delete video reels
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "product_photo", maxCount: 1 },
  ]),
  createVideoReelHandler
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "product_photo", maxCount: 1 },
  ]),
  updateVideoReelHandler
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteVideoReelHandler);

module.exports = router;
