const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  verifyAdminHandler,
  getLowStockHandler,
  getAnalyticsHandler,
  getAdminOrdersHandler,
  getAdminCustomersHandler,
  getOrderInvoiceHandler,
  cancelOrderAdminHandler,
  shiprocketFulfillOrderHandler,
  exportOrdersCsvHandler,
  exportCustomersCsvHandler,
  getAuditLogsHandler,
} = require("../controllers/adminController");

const router = express.Router();

// Protected Admin Verification, Analytics, Inventory, Orders & Customers Routes
router.get("/verify", authMiddleware, adminMiddleware, verifyAdminHandler);
router.get("/inventory/low-stock", authMiddleware, adminMiddleware, getLowStockHandler);
router.get("/analytics", authMiddleware, adminMiddleware, getAnalyticsHandler);

// Orders Operational Endpoints
router.get("/orders", authMiddleware, adminMiddleware, getAdminOrdersHandler);
router.get("/orders/export/csv", authMiddleware, adminMiddleware, exportOrdersCsvHandler);
router.get("/orders/:id/invoice", authMiddleware, adminMiddleware, getOrderInvoiceHandler);
router.post("/orders/:id/cancel", authMiddleware, adminMiddleware, cancelOrderAdminHandler);
router.post("/orders/:id/shiprocket-fulfill", authMiddleware, adminMiddleware, shiprocketFulfillOrderHandler);

// Customers Operational Endpoints
router.get("/customers", authMiddleware, adminMiddleware, getAdminCustomersHandler);
router.get("/customers/export/csv", authMiddleware, adminMiddleware, exportCustomersCsvHandler);

// Admin Audit Activity Logs
router.get("/audit-logs", authMiddleware, adminMiddleware, getAuditLogsHandler);

// Abandoned Cart Recovery Endpoints
const {
  getAbandonedCartsAdminHandler,
  updateAbandonedCartStatusHandler,
  deleteAbandonedCartHandler,
} = require("../controllers/abandonedCartController");

router.get("/abandoned-carts", authMiddleware, adminMiddleware, getAbandonedCartsAdminHandler);
router.put("/abandoned-carts/:id/status", authMiddleware, adminMiddleware, updateAbandonedCartStatusHandler);
router.delete("/abandoned-carts/:id", authMiddleware, adminMiddleware, deleteAbandonedCartHandler);

// In-App User Notifications Dispatch & History Endpoints (Phase 5)
const {
  sendNotificationAdminHandler,
  getDispatchHistoryAdminHandler,
  deleteNotificationAdminHandler,
} = require("../controllers/notificationController");

router.post("/notifications/send", authMiddleware, adminMiddleware, sendNotificationAdminHandler);
router.get("/notifications", authMiddleware, adminMiddleware, getDispatchHistoryAdminHandler);
router.delete("/notifications/:id", authMiddleware, adminMiddleware, deleteNotificationAdminHandler);

module.exports = router;
