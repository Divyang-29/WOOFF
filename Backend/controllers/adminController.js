const {
  getLowStockProducts,
  getAdminAnalytics,
  getAdminOrders,
  getAdminCustomers,
  getOrderInvoiceDetails,
  cancelOrderAdmin,
  getOrdersForCsvExport,
  getCustomersForCsvExport,
} = require("../models/adminModel");
const { logAdminAction, getAuditLogs } = require("../services/auditService");
const { createShiprocketFulfillment } = require("../services/shiprocketFulfillmentService");

// Get Low-Stock Inventory Items (GET /api/admin/inventory/low-stock)
const getLowStockHandler = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;
    const products = await getLowStockProducts(threshold);

    return res.status(200).json({
      success: true,
      threshold: parseInt(threshold),
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Low-Stock Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch low-stock inventory.",
    });
  }
};

// Get Admin Dashboard Analytics Summary (GET /api/admin/analytics)
const getAnalyticsHandler = async (req, res) => {
  try {
    const analytics = await getAdminAnalytics();

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to aggregate admin analytics.",
    });
  }
};

// Verify Admin Authentication & Role (GET /api/admin/verify)
const verifyAdminHandler = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin authenticated successfully.",
    user: {
      id: req.user.id,
      role: req.user.role,
      username: req.user.username,
      email: req.user.email,
    },
  });
};

// Get Orders for Admin (GET /api/admin/orders?page=1&limit=20&status=&search=)
const getAdminOrdersHandler = async (req, res) => {
  try {
    const { page, limit, order_status, payment_status, search } = req.query;
    const result = await getAdminOrders({
      page,
      limit,
      order_status,
      payment_status,
      search,
    });

    return res.status(200).json({
      success: true,
      count: result.orders.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      orders: result.orders,
    });
  } catch (error) {
    console.error("Get Admin Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders.",
    });
  }
};

// Get Customers for Admin (GET /api/admin/customers?page=1&limit=20&search=)
const getAdminCustomersHandler = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getAdminCustomers({ page, limit, search });

    return res.status(200).json({
      success: true,
      count: result.customers.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      customers: result.customers,
    });
  } catch (error) {
    console.error("Get Admin Customers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registered customers.",
    });
  }
};

// Get Order Invoice / Packing Slip Details (GET /api/admin/orders/:id/invoice)
const getOrderInvoiceHandler = async (req, res) => {
  try {
    const order = await getOrderInvoiceDetails(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order invoice details.",
    });
  }
};

// Cancel Order & Restore Stock (POST /api/admin/orders/:id/cancel)
const cancelOrderAdminHandler = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await cancelOrderAdmin(req.params.id, reason || "Cancelled by Administrator");

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "ORDER_CANCELLED",
      entityType: "ORDER",
      entityId: req.params.id,
      details: { reason: reason || "Cancelled by Administrator" },
      req,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel order.",
    });
  }
};

// One-Click Shiprocket Fulfillment & AWB Generation (POST /api/admin/orders/:id/shiprocket-fulfill)
const shiprocketFulfillOrderHandler = async (req, res) => {
  try {
    const fulfillmentResult = await createShiprocketFulfillment(req.params.id);

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "SHIPROCKET_FULFILLMENT_TRIGGERED",
      entityType: "ORDER",
      entityId: req.params.id,
      details: fulfillmentResult,
      req,
    });

    if (fulfillmentResult.success) {
      return res.status(200).json({
        success: true,
        message: "Order successfully submitted to Shiprocket!",
        data: fulfillmentResult,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: fulfillmentResult.error || "Shiprocket fulfillment failed pre-dispatch audit.",
        errors: fulfillmentResult.validation_errors || [],
      });
    }
  } catch (error) {
    console.error("Shiprocket Fulfill Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to execute Shiprocket dispatch.",
    });
  }
};

// Server-Side Orders CSV Export (GET /api/admin/orders/export/csv)
const exportOrdersCsvHandler = async (req, res) => {
  try {
    const orders = await getOrdersForCsvExport(req.query);

    const headers = [
      "Order ID",
      "Order Number",
      "Customer Name",
      "Phone",
      "Email",
      "Total Amount (INR)",
      "Payment Status",
      "Order Status",
      "Shipping City",
      "Shipping State",
      "Pincode",
      "Shiprocket AWB",
      "Order Date",
    ];

    const escapeCsv = (val) => {
      const str = String(val === null || val === undefined ? "" : val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = orders.map((o) => [
      o.id,
      o.order_number,
      escapeCsv(o.customer_name),
      escapeCsv(o.phone),
      escapeCsv(o.email),
      o.total_amount,
      o.payment_status,
      o.order_status,
      escapeCsv(o.shipping_city),
      escapeCsv(o.shipping_state),
      escapeCsv(o.shipping_postal_code),
      escapeCsv(o.shiprocket_awb_code),
      o.order_date,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="wooff_orders_${new Date().toISOString().split("T")[0]}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Orders CSV Export Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Orders CSV export.",
    });
  }
};

// Server-Side Customers CSV Export (GET /api/admin/customers/export/csv)
const exportCustomersCsvHandler = async (req, res) => {
  try {
    const customers = await getCustomersForCsvExport(req.query);

    const headers = [
      "Customer ID",
      "Username",
      "Email",
      "Phone",
      "Child Name",
      "Total Orders",
      "Total Spent (INR)",
      "Registration Date",
    ];

    const escapeCsv = (val) => {
      const str = String(val === null || val === undefined ? "" : val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = customers.map((c) => [
      c.id,
      escapeCsv(c.username),
      escapeCsv(c.email),
      escapeCsv(c.phone_number),
      escapeCsv(c.child_name),
      c.total_orders,
      c.total_spent,
      c.registered_date,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="wooff_customers_${new Date().toISOString().split("T")[0]}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Customers CSV Export Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Customers CSV export.",
    });
  }
};

// Get Admin Audit Activity Logs (GET /api/admin/audit-logs?page=1&limit=25&action=&entity_type=)
const getAuditLogsHandler = async (req, res) => {
  try {
    const { page, limit, action, entity_type, search } = req.query;
    const result = await getAuditLogs({
      page,
      limit,
      action,
      entityType: entity_type,
      search,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin audit logs.",
    });
  }
};

module.exports = {
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
};
