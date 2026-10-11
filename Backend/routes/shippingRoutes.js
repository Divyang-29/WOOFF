const express = require("express");
const { getDeliveryEstimateHandler } = require("../controllers/shippingController");

const router = express.Router();

// GET /api/shipping/estimate/:pincode
router.get("/estimate/:pincode", getDeliveryEstimateHandler);

module.exports = router;
