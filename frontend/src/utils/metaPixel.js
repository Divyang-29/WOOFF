/**
 * Safe Meta Pixel (Facebook Pixel) Tracking Utility
 * Guards against undefined window/fbq in SSR or blocked scripts.
 */

export const trackMetaEvent = (eventName, params = {}) => {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, params);
    }
  } catch (err) {
    console.warn(`[Meta Pixel] Failed to track ${eventName}:`, err);
  }
};

/**
 * Track ViewContent standard event
 * @param {Object} product - Product data object
 */
export const trackViewContent = (product) => {
  if (!product) return;
  const name = product.name || product.title || 'Product';
  const price = parseFloat(product.final_price || product.price || 0);

  trackMetaEvent('ViewContent', {
    content_name: name,
    value: price,
    currency: 'INR',
  });
};

/**
 * Track AddToCart standard event
 * @param {Object} product - Product data object
 * @param {number} quantity - Quantity added
 */
export const trackAddToCart = (product, quantity = 1) => {
  if (!product) return;
  const name = product.name || product.title || 'Product';
  const price = parseFloat(product.final_price || product.price || 0);
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  trackMetaEvent('AddToCart', {
    content_name: name,
    value: price * qty,
    currency: 'INR',
  });
};

/**
 * Track InitiateCheckout standard event
 * @param {Object} [params] - Optional checkout params
 */
export const trackInitiateCheckout = (params = {}) => {
  trackMetaEvent('InitiateCheckout', {
    currency: 'INR',
    ...params,
  });
};

/**
 * Track Purchase standard event
 * @param {Object} order - Order confirmation object
 */
export const trackPurchase = (order) => {
  if (!order) return;
  const val = parseFloat(order.totalPrice || order.totalAmount || 0);

  trackMetaEvent('Purchase', {
    value: val,
    currency: 'INR',
  });
};
