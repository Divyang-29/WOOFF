const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getPrivacyPolicyHandler,
  upsertPrivacyPolicyHandler,
} = require("../controllers/privacyPolicyController");

const router = express.Router();

// Public route to view Privacy Policy
router.get("/", getPrivacyPolicyHandler);

// Protected Admin routes to create or update Privacy Policy
router.post("/", authMiddleware, adminMiddleware, upsertPrivacyPolicyHandler);
router.put("/", authMiddleware, adminMiddleware, upsertPrivacyPolicyHandler);

module.exports = router;
