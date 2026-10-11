const {
  createTargetedNotification,
  createBroadcastNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAdminDispatchHistory,
  deleteNotificationById,
} = require("../models/notificationModel");
const { logAdminAction } = require("../services/auditService");

// Admin: Dispatch Notification (POST /api/admin/notifications/send)
const sendNotificationAdminHandler = async (req, res) => {
  try {
    const { title, message, type = "promotional", target_audience, audience, user_id } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification title is required.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification message body is required.",
      });
    }

    const validTypes = ["promotional", "order_update", "system"];
    const sanitizedType = validTypes.includes(type) ? type : "system";

    const isTargeted =
      (target_audience === "specific" || audience === "specific") ||
      (user_id !== undefined && user_id !== null && user_id !== "");

    let dispatched;

    if (isTargeted) {
      const targetUserId = parseInt(user_id, 10);
      if (!targetUserId || isNaN(targetUserId)) {
        return res.status(400).json({
          success: false,
          message: "A valid customer user_id is required for targeted notifications.",
        });
      }

      dispatched = await createTargetedNotification({
        userId: targetUserId,
        title,
        message,
        type: sanitizedType,
      });
    } else {
      // Global broadcast to all registered users
      dispatched = await createBroadcastNotification({
        title,
        message,
        type: sanitizedType,
      });
    }

    // Record in Admin Audit Log
    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "NOTIFICATION_DISPATCHED",
      entityType: "NOTIFICATION",
      entityId: dispatched.id,
      details: {
        title: dispatched.title,
        type: dispatched.type,
        audience: isTargeted ? "targeted" : "broadcast",
        targetUserId: isTargeted ? user_id : null,
      },
      req,
    });

    return res.status(201).json({
      success: true,
      message: isTargeted
        ? "Targeted notification sent successfully."
        : "Broadcast notification dispatched to all users successfully.",
      notification: dispatched,
    });
  } catch (error) {
    console.error("Admin Dispatch Notification Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to dispatch notification.",
    });
  }
};

// Admin: Get Paginated Dispatch History (GET /api/admin/notifications)
const getDispatchHistoryAdminHandler = async (req, res) => {
  try {
    const { page, limit, search, type, audience } = req.query;
    const result = await getAdminDispatchHistory({
      page,
      limit,
      search,
      type,
      audience,
    });

    return res.status(200).json({
      success: true,
      count: result.notifications.length,
      ...result,
    });
  } catch (error) {
    console.error("Get Dispatch History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification dispatch history.",
    });
  }
};

// Admin: Retract / Delete Notification (DELETE /api/admin/notifications/:id)
const deleteNotificationAdminHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteNotificationById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or already deleted.",
      });
    }

    // Record in Admin Audit Log
    await logAdminAction({
      adminId: req.user?.id,
      adminUsername: req.user?.username || req.user?.email || "Admin",
      action: "NOTIFICATION_DELETED",
      entityType: "NOTIFICATION",
      entityId: deleted.id,
      details: {
        title: deleted.title,
        type: deleted.type,
        userId: deleted.user_id,
      },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Notification retracted successfully.",
      notification: deleted,
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};

// Customer-Facing: Get User's Notifications (GET /api/notifications)
const getUserNotificationsHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to retrieve notifications.",
      });
    }

    const { unread_only, page, limit } = req.query;
    const result = await getUserNotifications(userId, {
      unreadOnly: unread_only === "true" || unread_only === "1",
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      count: result.notifications.length,
      ...result,
    });
  } catch (error) {
    console.error("Get User Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
};

// Customer-Facing: Mark Notification Read (PUT /api/notifications/:id/read)
const markNotificationReadHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const updated = await markNotificationAsRead(id, userId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: updated,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to mark notification as read.",
    });
  }
};

// Customer-Facing: Mark All Notifications Read (PUT /api/notifications/read-all)
const markAllNotificationsReadHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await markAllNotificationsAsRead(userId);
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      ...result,
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read.",
    });
  }
};

module.exports = {
  sendNotificationAdminHandler,
  getDispatchHistoryAdminHandler,
  deleteNotificationAdminHandler,
  getUserNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
};
