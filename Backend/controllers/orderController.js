const pool = require("../config/db");
const Razorpay = require("razorpay");
const {
  createCheckoutOrder,
  getUserOrders,
  getOrderDetailsById,
  updateOrderStatusByAdmin,
  getOrderByOrderNumber,
} = require("../models/orderModel");
const { logAdminAction } = require("../services/auditService");
const { recordOrUpdateAbandonedCart } = require("../models/abandonedCartModel");
const { createShiprocketFulfillment } = require("../services/shiprocketFulfillmentService");

// Checkout Endpoint (POST /api/orders/checkout)
const checkoutHandler = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const {
      address_id,
      notes,
      coupon_code,
      couponCode,
      email,
      customer_email,
      address,
      cart_items,
      items,
      payment_method = "razorpay",
      // Flat address fields support
      full_name,
      fullName,
      phone,
      address_line_1,
      addressLine1,
      address_line_2,
      addressLine2,
      city,
      state,
      pincode,
      postal_code,
    } = req.body;

    const resolvedAddress =
      address ||
      (address_line_1 || addressLine1
        ? {
            full_name: full_name || fullName,
            email: email || customer_email,
            phone,
            address_line_1: address_line_1 || addressLine1,
            address_line_2: address_line_2 || addressLine2,
            city,
            state,
            pincode: pincode || postal_code,
          }
        : null);

    // Validate 6-digit pincode if address is supplied
    if (resolvedAddress?.pincode) {
      const pinStr = String(resolvedAddress.pincode).trim();
      if (!/^\d{6}$/.test(pinStr)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 6-digit Indian postal pincode.",
        });
      }
    }

    const normalizedPaymentMethod = String(payment_method || "razorpay").toLowerCase();

    const order = await createCheckoutOrder(userId, {
      address_id,
      notes,
      coupon_code: coupon_code || couponCode,
      email: email || customer_email,
      address: resolvedAddress,
      cart_items: cart_items || items,
      payment_method: normalizedPaymentMethod,
    });

    // ── Handle Cash on Delivery (COD) Flow ─────────────────────────
    if (normalizedPaymentMethod === "cod") {
      try {
        await pool.query(
          `INSERT INTO payment_transactions (
            order_id, payment_provider, provider_order_id, amount, currency, status, payment_method, metadata
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            order.id,
            "cod",
            `cod_${order.id}_${Date.now()}`,
            order.total_amount,
            "INR",
            "pending",
            "cash_on_delivery",
            JSON.stringify({
              order_number: order.order_number,
              customer_email: order.customer_email,
              type: "cod",
            }),
          ]
        );
      } catch (txErr) {
        console.warn("Failed to record payment_transactions for COD:", txErr.message);
      }

      // Automatically dispatch to Shiprocket with COD payment method
      setImmediate(() => {
        createShiprocketFulfillment(order.id).catch((err) => {
          console.error(`[Shiprocket COD Dispatch Error] Order #${order.id}:`, err.message);
        });
      });

      return res.status(201).json({
        success: true,
        is_cod: true,
        message: "Cash on delivery order placed successfully.",
        order,
        order_id: order.id,
        amount: Math.round(Number(order.total_amount) * 100),
        currency: "INR",
      });
    }

    // ── Handle Online Prepaid Flow (Razorpay) ─────────────────────────
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error("Razorpay credentials are not configured on the server.");
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const amountInPaise = Math.round(Number(order.total_amount) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.max(100, amountInPaise),
      currency: "INR",
      receipt: `rcpt_${order.id}_${Date.now()}`,
      notes: {
        order_id: String(order.id),
        order_number: order.order_number,
        customer_name: order.customer_name || "Customer",
        customer_phone: order.customer_phone || "N/A",
      },
    });

    // Record initial transaction state in payment_transactions table
    try {
      await pool.query(
        `INSERT INTO payment_transactions (
          order_id, payment_provider, provider_order_id, amount, currency, status, payment_method, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          order.id,
          "razorpay",
          razorpayOrder.id,
          order.total_amount,
          "INR",
          "created",
          "online",
          JSON.stringify({
            order_number: order.order_number,
            razorpay_order_id: razorpayOrder.id,
            customer_email: order.customer_email,
          }),
        ]
      );
    } catch (txErr) {
      console.warn("Failed to record payment_transactions:", txErr.message);
    }

    // Record or update checkout payload in abandoned_carts
    recordOrUpdateAbandonedCart({
      userId,
      customerName: order.customer_name || resolvedAddress?.full_name,
      email: order.customer_email || email || customer_email,
      phone: order.customer_phone || resolvedAddress?.phone,
      items: cart_items || items || [],
      totalValue: order.total_amount,
      checkoutStep: "payment_pending",
      req,
    }).catch((e) => console.warn("[Cart Tracking Notice]:", e.message));

    return res.status(201).json({
      success: true,
      message: "Order placed successfully and payment session initialized.",
      order,
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount, // amount in paise
      currency: razorpayOrder.currency || "INR",
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Checkout Error:", error.message);
    const isUserError =
      error.message.includes("Cart is empty") ||
      error.message.includes("delivery address") ||
      error.message.includes("Insufficient stock") ||
      error.message.includes("pincode") ||
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

    // Record Admin Audit Trail
    await logAdminAction({
      adminId: req.user?.id,
      action: "UPDATE_ORDER_STATUS",
      entityType: "order",
      entityId: parseInt(id),
      details: {
        order_number: updatedOrder.order_number,
        new_status: targetStatus.toLowerCase().trim(),
        total_amount: updatedOrder.total_amount,
      },
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
    });

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

// Public Customer Order Tracking Endpoint (GET /api/orders/track/:order_number)
const trackOrderByNumberHandler = async (req, res) => {
  try {
    const { order_number } = req.params;

    if (!order_number || !order_number.trim()) {
      return res.status(400).json({
        success: false,
        message: "Order reference number is required.",
      });
    }

    const order = await getOrderByOrderNumber(order_number.trim());

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with reference "${order_number}". Please check your order ID and try again.`,
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        order_status: order.order_status,
        payment_status: order.payment_status,
        currency: order.currency || "INR",
        subtotal: order.subtotal,
        shipping_amount: order.shipping_amount,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        shipping_city: order.shipping_city,
        shipping_state: order.shipping_state,
        shipping_postal_code: order.shipping_postal_code,
        customer_name: order.customer_name,
        shiprocket_order_id: order.shiprocket_order_id,
        shiprocket_shipment_id: order.shiprocket_shipment_id,
        shiprocket_awb_code: order.shiprocket_awb_code,
        shiprocket_courier_name: order.shiprocket_courier_name,
        shiprocket_status: order.shiprocket_status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: order.items || [],
      },
    });
  } catch (error) {
    console.error("Track Order Handler Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order tracking details.",
    });
  }
};

module.exports = {
  checkoutHandler,
  getUserOrdersHandler,
  getOrderDetailsHandler,
  updateOrderStatusHandler,
  trackOrderByNumberHandler,
};

