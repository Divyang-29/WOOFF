const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../models/couponModel");
const { logAdminAction } = require("../services/auditService");

// Create Coupon (Admin Only)
const createCouponHandler = async (req, res) => {
  try {
    const coupon = await createCoupon(req.body);

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "COUPON_CREATED",
      entityType: "COUPON",
      entityId: coupon.id,
      details: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        usage_limit: coupon.usage_limit,
      },
      req,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon,
    });
  } catch (error) {
    console.error("Create Coupon Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create coupon.",
    });
  }
};

// Get All Coupons (Admin Only / Listing)
const getAllCouponsHandler = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    const coupons = await getAllCoupons(isAdmin);
    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Get All Coupons Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons.",
    });
  }
};

// Get Coupon By ID
const getCouponByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await getCouponById(parseInt(id, 10));
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }
    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error("Get Coupon By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon.",
    });
  }
};

// Update Coupon (Admin Only)
const updateCouponHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateCoupon(parseInt(id, 10), req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "COUPON_UPDATED",
      entityType: "COUPON",
      entityId: id,
      details: req.body,
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully.",
      coupon: updated,
    });
  } catch (error) {
    console.error("Update Coupon Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update coupon.",
    });
  }
};

// Delete Coupon (Admin Only)
const deleteCouponHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCoupon(parseInt(id, 10));
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "COUPON_DELETED",
      entityType: "COUPON",
      entityId: id,
      details: { code: deleted.code },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon.",
    });
  }
};

// Validate Coupon (Public / Protected User Endpoint)
const validateCouponHandler = async (req, res) => {
  try {
    const { code, cart_subtotal, subtotal } = req.body;
    const targetSubtotal = cart_subtotal || subtotal;

    if (!code || targetSubtotal === undefined) {
      return res.status(400).json({
        success: false,
        message: "code and cart_subtotal are required.",
      });
    }

    const result = await validateCoupon(code, targetSubtotal);

    return res.status(200).json({
      success: true,
      message: "Coupon is valid.",
      ...result,
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error.message);
    return res.status(400).json({
      success: false,
      valid: false,
      message: error.message || "Invalid coupon.",
    });
  }
};

module.exports = {
  createCouponHandler,
  getAllCouponsHandler,
  getCouponByIdHandler,
  updateCouponHandler,
  deleteCouponHandler,
  validateCouponHandler,
};
