const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  submitContactHandler,
  getAllContactMessagesHandler,
  deleteContactMessageHandler,
} = require("../controllers/contactController");

const router = express.Router();

// Public route to submit Contact Us message
router.post("/", submitContactHandler);

// Protected Admin routes to view and manage inquiries
router.get("/", authMiddleware, adminMiddleware, getAllContactMessagesHandler);
router.delete("/:id", authMiddleware, adminMiddleware, deleteContactMessageHandler);

module.exports = router;
