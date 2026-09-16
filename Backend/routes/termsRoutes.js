const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getTermsHandler,
  upsertTermsHandler,
} = require("../controllers/termsController");

const router = express.Router();

// Public route to view Terms & Conditions
router.get("/", getTermsHandler);

// Protected Admin routes to create or update Terms & Conditions
router.post("/", authMiddleware, adminMiddleware, upsertTermsHandler);
router.put("/", authMiddleware, adminMiddleware, upsertTermsHandler);

module.exports = router;
