import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../api';
import './NotificationCenter.css';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications from server
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('wooff_token') || localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user notifications:', err);
    }
  };

  // Poll on mount and every 30s when logged in
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (notif) => {
    if (notif.is_read) return;

    // Optimistically update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const token = localStorage.getItem('wooff_token') || localStorage.getItem('token');
      if (!token) return;

      await fetch(API_ENDPOINTS.NOTIFICATION_READ(notif.id), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const token = localStorage.getItem('wooff_token') || localStorage.getItem('token');
      if (!token) return;

      await fetch(API_ENDPOINTS.NOTIFICATIONS_READ_ALL, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'promotional':
        return <i className="fa-solid fa-gift"></i>;
      case 'order_update':
        return <i className="fa-solid fa-truck-fast"></i>;
      case 'system':
      default:
        return <i className="fa-solid fa-bell"></i>;
    }
  };

  return (
    <div className="wooff-notif-container" ref={dropdownRef}>
      <button
        type="button"
        className="wooff-notif-bell-btn"
        aria-label="Notifications"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
      >
        <svg
          className="wooff-notif-bell-icon"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="wooff-notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="wooff-notif-popover">
          {/* Header */}
          <div className="wooff-notif-header">
            <div className="wooff-notif-title-group">
              <h4 className="wooff-notif-header-title">Notifications</h4>
              {unreadCount > 0 && (
                <span className="wooff-notif-header-badge">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="wooff-notif-mark-all-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="wooff-notif-tabs">
            <button
              type="button"
              className={`wooff-notif-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`wooff-notif-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <ul className="wooff-notif-list">
            {filteredNotifications.length === 0 ? (
              <li className="wooff-notif-empty">
                <div className="wooff-notif-empty-icon">
                  <i className="fa-regular fa-bell-slash"></i>
                </div>
                <div className="wooff-notif-empty-title">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </div>
                <p className="wooff-notif-empty-desc">
                  {filter === 'unread'
                    ? "You're all caught up with recent updates!"
                    : 'Personal alerts, order milestones, and special offers will appear here.'}
                </p>
              </li>
            ) : (
              filteredNotifications.map((n) => (
                <li
                  key={n.id}
                  className={`wooff-notif-item ${!n.is_read ? 'unread' : ''}`}
                  onClick={() => handleMarkAsRead(n)}
                >
                  <div className={`wooff-notif-icon-wrap wooff-notif-icon-${n.type || 'system'}`}>
                    {getIconForType(n.type)}
                  </div>
                  <div className="wooff-notif-content">
                    <div className="wooff-notif-item-title">
                      <span>{n.title}</span>
                    </div>
                    <p className="wooff-notif-item-message">{n.message}</p>
                    <div className="wooff-notif-item-meta">
                      <span className="wooff-notif-item-time">{formatRelativeTime(n.created_at)}</span>
                      {n.type && (
                        <span className="text-uppercase fw-semibold" style={{ fontSize: '10px' }}>
                          • {n.type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  {!n.is_read && <span className="wooff-notif-unread-dot" title="Unread"></span>}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
