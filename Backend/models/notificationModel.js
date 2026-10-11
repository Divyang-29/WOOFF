const pool = require("../config/db");

/**
 * Notification Model for Phase 5 In-App User Notification Engine
 * Supports Global Broadcasts (user_id = NULL) and Targeted Alerts (user_id = specific_id)
 * with per-user read state tracking.
 */

// Send notification to a specific user
const createTargetedNotification = async ({ userId, title, message, type = "system" }) => {
  // Validate target user exists
  const userCheck = await pool.query(
    "SELECT id, username, email, phone_number FROM users WHERE id = $1",
    [userId]
  );
  if (userCheck.rows.length === 0) {
    throw new Error(`Target customer with ID ${userId} does not exist.`);
  }

  const query = `
    INSERT INTO notifications (user_id, title, message, type, is_read, created_at, updated_at)
    VALUES ($1, $2, $3, $4, FALSE, NOW(), NOW())
    RETURNING id, user_id, title, message, type, is_read, created_at
  `;
  const values = [userId, title.trim(), message.trim(), type];
  const result = await pool.query(query, values);
  return {
    ...result.rows[0],
    target_user: userCheck.rows[0],
  };
};

// Broadcast notification to ALL registered users simultaneously (user_id = NULL)
const createBroadcastNotification = async ({ title, message, type = "promotional" }) => {
  const query = `
    INSERT INTO notifications (user_id, title, message, type, is_read, created_at, updated_at)
    VALUES (NULL, $1, $2, $3, FALSE, NOW(), NOW())
    RETURNING id, user_id, title, message, type, is_read, created_at
  `;
  const values = [title.trim(), message.trim(), type];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Customer-Facing: Get notifications for a user (targeted + broadcasts)
const getUserNotifications = async (userId, { unreadOnly = false, limit = 50, page = 1 } = {}) => {
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  // 1. Get total unread count for badge
  const unreadCountQuery = `
    SELECT COUNT(*)::int AS unread_count
    FROM notifications n
    LEFT JOIN notification_reads nr 
      ON n.id = nr.notification_id AND nr.user_id = $1
    WHERE (n.user_id = $1 OR n.user_id IS NULL)
      AND (
        (n.user_id IS NOT NULL AND n.is_read = FALSE)
        OR (n.user_id IS NULL AND nr.id IS NULL)
      )
  `;
  const unreadCountResult = await pool.query(unreadCountQuery, [userId]);
  const unreadCount = unreadCountResult.rows[0]?.unread_count || 0;

  // 2. Fetch notifications list
  let query = `
    SELECT 
      n.id,
      n.user_id,
      n.title,
      n.message,
      n.type,
      CASE 
        WHEN n.user_id IS NOT NULL THEN n.is_read
        ELSE (nr.id IS NOT NULL)
      END AS is_read,
      n.created_at
    FROM notifications n
    LEFT JOIN notification_reads nr 
      ON n.id = nr.notification_id AND nr.user_id = $1
    WHERE (n.user_id = $1 OR n.user_id IS NULL)
  `;

  const queryParams = [userId];

  if (unreadOnly) {
    query += `
      AND (
        (n.user_id IS NOT NULL AND n.is_read = FALSE)
        OR (n.user_id IS NULL AND nr.id IS NULL)
      )
    `;
  }

  query += ` ORDER BY n.created_at DESC LIMIT $2 OFFSET $3`;
  queryParams.push(safeLimit, offset);

  const result = await pool.query(query, queryParams);

  // 3. Count total notifications for user
  const totalCountQuery = `
    SELECT COUNT(*)::int AS total
    FROM notifications
    WHERE user_id = $1 OR user_id IS NULL
  `;
  const totalCountResult = await pool.query(totalCountQuery, [userId]);
  const total = totalCountResult.rows[0]?.total || 0;

  return {
    notifications: result.rows,
    unreadCount,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
};

// Customer-Facing: Mark single notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  const notifCheck = await pool.query(
    "SELECT id, user_id, is_read FROM notifications WHERE id = $1",
    [notificationId]
  );

  if (notifCheck.rows.length === 0) {
    return null;
  }

  const notif = notifCheck.rows[0];

  if (notif.user_id !== null) {
    // Targeted notification - ensure it belongs to this user
    if (notif.user_id !== parseInt(userId, 10)) {
      throw new Error("Unauthorized to modify this notification.");
    }
    const updateResult = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE, updated_at = NOW() 
       WHERE id = $1 AND user_id = $2 
       RETURNING id, user_id, title, message, type, is_read, created_at`,
      [notificationId, userId]
    );
    return updateResult.rows[0];
  } else {
    // Global broadcast notification - track in notification_reads
    await pool.query(
      `INSERT INTO notification_reads (notification_id, user_id, read_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (notification_id, user_id) DO NOTHING`,
      [notificationId, userId]
    );

    return {
      id: notif.id,
      user_id: null,
      is_read: true,
    };
  }
};

// Customer-Facing: Mark ALL notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
  // 1. Mark all targeted unread
  const updateTargeted = await pool.query(
    `UPDATE notifications 
     SET is_read = TRUE, updated_at = NOW() 
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );

  // 2. Mark all broadcast unread
  const insertBroadcastReads = await pool.query(
    `INSERT INTO notification_reads (notification_id, user_id, read_at)
     SELECT n.id, $1, NOW()
     FROM notifications n
     WHERE n.user_id IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM notification_reads nr 
         WHERE nr.notification_id = n.id AND nr.user_id = $1
       )
     ON CONFLICT (notification_id, user_id) DO NOTHING`,
    [userId]
  );

  return {
    targetedUpdated: updateTargeted.rowCount || 0,
    broadcastReadsRecorded: insertBroadcastReads.rowCount || 0,
  };
};

// Admin: Get paginated dispatch history with live statistics & recipient details
const getAdminDispatchHistory = async ({
  page = 1,
  limit = 15,
  search = "",
  type = "",
  audience = "",
} = {}) => {
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  // Fetch total registered users for broadcast audience metrics
  const totalUsersRes = await pool.query("SELECT COUNT(*)::int AS count FROM users");
  const totalRegisteredUsers = totalUsersRes.rows[0]?.count || 0;

  // Build dynamic filters
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (search && search.trim()) {
    conditions.push(
      `(n.title ILIKE $${paramIdx} OR n.message ILIKE $${paramIdx} OR u.username ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx} OR u.phone_number ILIKE $${paramIdx})`
    );
    params.push(`%${search.trim()}%`);
    paramIdx++;
  }

  if (type && type.trim() && type !== "all") {
    conditions.push(`n.type = $${paramIdx}`);
    params.push(type.trim());
    paramIdx++;
  }

  if (audience === "all") {
    conditions.push(`n.user_id IS NULL`);
  } else if (audience === "specific") {
    conditions.push(`n.user_id IS NOT NULL`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Main paginated query
  const dataQuery = `
    SELECT 
      n.id,
      n.user_id,
      n.title,
      n.message,
      n.type,
      n.is_read,
      n.created_at,
      n.updated_at,
      u.username AS recipient_username,
      u.email AS recipient_email,
      u.phone_number AS recipient_phone,
      u.child_name AS recipient_child_name,
      CASE 
        WHEN n.user_id IS NULL THEN (
          SELECT COUNT(*)::int FROM notification_reads nr WHERE nr.notification_id = n.id
        )
        ELSE (CASE WHEN n.is_read THEN 1 ELSE 0 END)
      END AS read_count
    FROM notifications n
    LEFT JOIN users u ON n.user_id = u.id
    ${whereClause}
    ORDER BY n.created_at DESC
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;

  params.push(safeLimit, offset);
  const dataResult = await pool.query(dataQuery, params);

  // Total count query for pagination
  const countParams = params.slice(0, paramIdx - 1);
  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM notifications n
    LEFT JOIN users u ON n.user_id = u.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, countParams);
  const total = countResult.rows[0]?.total || 0;

  // Aggregate KPI summary metrics for dashboard cards
  const statsQuery = `
    SELECT 
      COUNT(*)::int AS total_dispatched,
      COUNT(CASE WHEN user_id IS NULL THEN 1 END)::int AS total_broadcasts,
      COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END)::int AS total_targeted,
      (
        COALESCE((SELECT COUNT(*)::int FROM notification_reads), 0) +
        COUNT(CASE WHEN user_id IS NOT NULL AND is_read = TRUE THEN 1 END)::int
      ) AS total_reads
    FROM notifications
  `;
  const statsResult = await pool.query(statsQuery);
  const stats = statsResult.rows[0] || {
    total_dispatched: 0,
    total_broadcasts: 0,
    total_targeted: 0,
    total_reads: 0,
  };

  return {
    notifications: dataResult.rows,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
    totalRegisteredUsers,
    stats: {
      totalDispatched: stats.total_dispatched,
      totalBroadcasts: stats.total_broadcasts,
      totalTargeted: stats.total_targeted,
      totalReads: stats.total_reads,
    },
  };
};

// Admin: Delete / Retract a dispatched notification
const deleteNotificationById = async (id) => {
  const result = await pool.query(
    "DELETE FROM notifications WHERE id = $1 RETURNING id, user_id, title, type",
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  createTargetedNotification,
  createBroadcastNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAdminDispatchHistory,
  deleteNotificationById,
};
