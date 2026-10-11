const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUserNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
} = require("../controllers/notificationController");

const router = express.Router();

// Customer-Facing In-App Notification Endpoints
router.get("/", authMiddleware, getUserNotificationsHandler);
router.put("/read-all", authMiddleware, markAllNotificationsReadHandler);
router.put("/:id/read", authMiddleware, markNotificationReadHandler);

module.exports = router;
