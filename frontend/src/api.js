/**
 * Centralized API Endpoints Configuration for Wooff Frontend.
 * Automatically prepends `import.meta.env.VITE_API_URL` if defined,
 * otherwise falls back to relative paths for Vite proxy forwarding.
 */
const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const API_ENDPOINTS = {
  CONTACT: `${API_BASE_URL}/api/contact`,
  TESTIMONIALS: `${API_BASE_URL}/api/testimonials`,
  CERTIFICATES: `${API_BASE_URL}/api/certificates`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  BLOGS: `${API_BASE_URL}/api/blogs`,
};

export default API_ENDPOINTS;
