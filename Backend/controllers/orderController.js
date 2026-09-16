const {
  createCheckoutOrder,
  getUserOrders,
  getOrderDetailsById,
  updateOrderStatusByAdmin,
} = require("../models/orderModel");

// Checkout Endpoint (POST /api/orders/checkout)
const checkoutHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_id, notes, coupon_code, couponCode } = req.body;

    const order = await createCheckoutOrder(userId, {
      address_id,
      notes,
      coupon_code: coupon_code || couponCode,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Checkout Error:", error.message);
    const isUserError =
      error.message.includes("Cart is empty") ||
      error.message.includes("No delivery address") ||
      error.message.includes("Insufficient stock") ||
      error.message.includes("Coupon") ||
      error.message.includes("coupon");

    return res.status(isUserError ? 400 : 500).json({
      success: false,
      message: error.message || "Checkout failed.",
    });
  }
};

// Get User Orders List with Pagination (GET /api/orders)
const getUserOrdersHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";
    const { page, limit, status, payment_status } = req.query;

    const result = await getUserOrders(userId, {
      isAdmin,
      page,
      limit,
      status,
      payment_status,
    });

    return res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
};

// Get Single Order Details (GET /api/orders/:id)
const getOrderDetailsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";
    const { id } = req.params;

    const order = await getOrderDetailsById(parseInt(id), userId, isAdmin);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details.",
    });
  }
};

// Admin Order Status Update (PUT /api/orders/:id/status)
const updateOrderStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, status } = req.body;
    const targetStatus = order_status || status;

    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        message: "order_status is required.",
      });
    }

    const updatedOrder = await updateOrderStatusByAdmin(parseInt(id), targetStatus.toLowerCase().trim());

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error.message);
    const isValidationError = error.message.includes("Invalid order status");
    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to update order status.",
    });
  }
};

module.exports = {
  checkoutHandler,
  getUserOrdersHandler,
  getOrderDetailsHandler,
  updateOrderStatusHandler,
};
