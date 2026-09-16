const {
  getLowStockProducts,
  getAdminAnalytics,
} = require("../models/adminModel");

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

module.exports = {
  getLowStockHandler,
  getAnalyticsHandler,
};
