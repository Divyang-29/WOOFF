const express = require("express");
const router = express.Router();
const shiprocketController = require("../controllers/shiprocketController");

// Catalog Sync APIs (Consumed by Shiprocket Checkout)
router.get("/catalog/products", shiprocketController.getProductsCatalog);
router.get("/catalog/collections", shiprocketController.getCollectionsCatalog);
router.get("/catalog/collection-products", shiprocketController.getProductsByCollection);

// Top-level aliases for direct Seller URL configuration
router.get("/products", shiprocketController.getProductsCatalog);
router.get("/collections", shiprocketController.getCollectionsCatalog);
router.get("/collection-products", shiprocketController.getProductsByCollection);

// Loyalty Points Manager APIs (Consumed by Shiprocket Checkout)
router.post("/loyalty/get-points", shiprocketController.getLoyaltyPoints);
router.post("/loyalty/block-points", shiprocketController.blockLoyaltyPoints);
router.post("/loyalty/unblock-points", shiprocketController.unblockLoyaltyPoints);

// Direct loyalty aliases
router.post("/get-points", shiprocketController.getLoyaltyPoints);
router.post("/block-points", shiprocketController.blockLoyaltyPoints);
router.post("/unblock-points", shiprocketController.unblockLoyaltyPoints);

// Order Webhook (Called by Shiprocket when order is placed)
router.post("/order-webhook", shiprocketController.handleOrderWebhook);
router.post("/webhook", shiprocketController.handleOrderWebhook);

// Checkout Initiation (Called by Frontend)
router.post("/checkout/initiate", shiprocketController.initiateCheckout);

// Order Details (Called by Merchant)
router.post("/order/details", shiprocketController.getOrderDetails);

module.exports = router;
