const {
  recordOrUpdateAbandonedCart,
  getAbandonedCarts,
  updateAbandonedCartStatus,
  deleteAbandonedCart,
} = require("../models/abandonedCartModel");
const { logAdminAction } = require("../services/auditService");

/**
 * Public endpoint to log or update cart payload during checkout flow
 * POST /api/cart/abandoned
 */
const trackAbandonedCartHandler = async (req, res) => {
  try {
    const {
      customer_name,
      fullName,
      email,
      phone,
      items,
      cart_items,
      total_value,
      amount,
      checkout_step,
    } = req.body;

    const resolvedItems = items || cart_items || [];
    const resolvedName = customer_name || fullName || "";
    const resolvedTotal = total_value ?? (amount ? amount / 100 : 0);

    const cart = await recordOrUpdateAbandonedCart({
      userId: req.user?.id || null,
      customerName: resolvedName,
      email,
      phone,
      items: resolvedItems,
      totalValue: resolvedTotal,
      checkoutStep: checkout_step || "shipping_details",
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Cart drop-off tracked successfully.",
      cart_id: cart.id,
    });
  } catch (error) {
    // Non-blocking for the customer checkout experience
    console.warn("Track Abandoned Cart Notice:", error.message);
    return res.status(200).json({
      success: false,
      message: error.message || "Failed to log cart tracking.",
    });
  }
};

/**
 * Admin endpoint: Get paginated, sortable abandoned carts list
 * GET /api/admin/abandoned-carts
 */
const getAbandonedCartsAdminHandler = async (req, res) => {
  try {
    const { page, limit, sort, status, search } = req.query;

    const result = await getAbandonedCarts({
      page,
      limit,
      sort: sort || "highest_value",
      status: status || "all",
      search: search || "",
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Abandoned Carts Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch abandoned carts.",
    });
  }
};

/**
 * Admin endpoint: Update status (e.g. 'contacted', 'recovered', 'cancelled')
 * PUT /api/admin/abandoned-carts/:id/status
 */
const updateAbandonedCartStatusHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, recovery_status, recovery_notes } = req.body;

    const updated = await updateAbandonedCartStatus(parseInt(id, 10), {
      status: status || recovery_status,
      recovery_notes,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Abandoned cart record not found.",
      });
    }

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "ABANDONED_CART_STATUS_UPDATED",
      entityType: "ABANDONED_CART",
      entityId: id,
      details: {
        new_status: updated.recovery_status,
        customer_email: updated.email,
        total_value: updated.total_value,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Cart recovery status updated successfully.",
      cart: updated,
    });
  } catch (error) {
    console.error("Update Cart Recovery Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update recovery status.",
    });
  }
};

/**
 * Admin endpoint: Delete an abandoned cart record
 * DELETE /api/admin/abandoned-carts/:id
 */
const deleteAbandonedCartHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteAbandonedCart(parseInt(id, 10));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Abandoned cart record not found.",
      });
    }

    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "ABANDONED_CART_DELETED",
      entityType: "ABANDONED_CART",
      entityId: id,
      details: { email: deleted.email, total_value: deleted.total_value },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Abandoned cart record removed.",
    });
  } catch (error) {
    console.error("Delete Abandoned Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete abandoned cart record.",
    });
  }
};

module.exports = {
  trackAbandonedCartHandler,
  getAbandonedCartsAdminHandler,
  updateAbandonedCartStatusHandler,
  deleteAbandonedCartHandler,
};
