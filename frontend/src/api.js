/**
 * Centralized API Endpoints Configuration for Wooff Frontend.
 * Automatically prepends `import.meta.env.VITE_API_URL` if defined,
 * otherwise falls back to relative paths for Vite proxy forwarding.
 */
const rawBaseUrl = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

// Intercept window.fetch so all relative API calls (/api/... and /terms-and-conditions) automatically route to API_BASE_URL in production
if (API_BASE_URL && typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function (resource, config) {
    if (typeof resource === 'string') {
      if (resource.startsWith('/api') || resource.startsWith('/terms-and-conditions')) {
        resource = `${API_BASE_URL}${resource}`;
      }
    } else if (resource instanceof Request && resource.url) {
      try {
        const parsedUrl = new URL(resource.url);
        if (parsedUrl.pathname.startsWith('/api') || parsedUrl.pathname.startsWith('/terms-and-conditions')) {
          resource = new Request(`${API_BASE_URL}${parsedUrl.pathname}${parsedUrl.search}`, resource);
        }
      } catch {
        // keep original resource if URL parsing fails
      }
    }
    return originalFetch.call(this, resource, config);
  };
}

export const API_ENDPOINTS = {
  CONTACT: `${API_BASE_URL}/api/contact`,
  TESTIMONIALS: `${API_BASE_URL}/api/testimonials`,
  CERTIFICATES: `${API_BASE_URL}/api/certificates`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  BLOGS: `${API_BASE_URL}/api/blogs`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  ADDRESSES: `${API_BASE_URL}/api/addresses`,
  COUPONS: `${API_BASE_URL}/api/coupons`,
  FAQS: `${API_BASE_URL}/api/faqs`,
  TERMS: `${API_BASE_URL}/terms-and-conditions`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  INGREDIENTS: `${API_BASE_URL}/api/ingredients`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  NOTIFICATION_READ: (id) => `${API_BASE_URL}/api/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: `${API_BASE_URL}/api/notifications/read-all`,
  AUTH: {
    SEND_OTP: `${API_BASE_URL}/api/auth/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
    RESEND_OTP: `${API_BASE_URL}/api/auth/resend-otp`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
  },
  ADMIN: {
    VERIFY: `${API_BASE_URL}/api/admin/verify`,
    ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
    LOW_STOCK: `${API_BASE_URL}/api/admin/inventory/low-stock`,
    ORDERS: `${API_BASE_URL}/api/admin/orders`,
    CUSTOMERS: `${API_BASE_URL}/api/admin/customers`,
    AUDIT_LOGS: `${API_BASE_URL}/api/admin/audit-logs`,
    EXPORT_ORDERS_CSV: `${API_BASE_URL}/api/admin/orders/export/csv`,
    EXPORT_CUSTOMERS_CSV: `${API_BASE_URL}/api/admin/customers/export/csv`,
    ORDER_INVOICE: (id) => `${API_BASE_URL}/api/admin/orders/${id}/invoice`,
    ORDER_CANCEL: (id) => `${API_BASE_URL}/api/admin/orders/${id}/cancel`,
    ORDER_SHIPROCKET_FULFILL: (id) => `${API_BASE_URL}/api/admin/orders/${id}/shiprocket-fulfill`,
    ABANDONED_CARTS: `${API_BASE_URL}/api/admin/abandoned-carts`,
    ABANDONED_CART_STATUS: (id) => `${API_BASE_URL}/api/admin/abandoned-carts/${id}/status`,
    ABANDONED_CART_DELETE: (id) => `${API_BASE_URL}/api/admin/abandoned-carts/${id}`,
    NOTIFICATIONS: `${API_BASE_URL}/api/admin/notifications`,
    NOTIFICATION_SEND: `${API_BASE_URL}/api/admin/notifications/send`,
    NOTIFICATION_DELETE: (id) => `${API_BASE_URL}/api/admin/notifications/${id}`,
  },
  SHIPROCKET: {
    INITIATE: `${API_BASE_URL}/api/shiprocket/checkout/initiate`,
    LOYALTY_GET_POINTS: `${API_BASE_URL}/api/shiprocket/loyalty/get-points`,
  },
};

export default API_ENDPOINTS;
