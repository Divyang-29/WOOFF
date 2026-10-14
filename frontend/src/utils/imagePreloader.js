/**
 * Global Ultra-Fast Image Preloader & Cache Engine
 * Preloads product galleries, banners, icons, and hero images into the browser cache
 * so images render with 0ms latency when opening product and store pages.
 */

import { getOptimizedImageUrl, getCachedProducts, registerPrefetchCallback } from './productData';

// Cache tracking to avoid re-preloading
const preloadedUrls = new Set();

// Wire up prefetch listener so newly fetched product images preload automatically
registerPrefetchCallback((products) => {
  if (Array.isArray(products)) {
    products.forEach((p) => preloadProduct(p));
  }
});

/**
 * Preload an individual image URL using the browser Image object
 */
export function preloadImage(url) {
  if (!url || typeof url !== 'string' || preloadedUrls.has(url)) {
    return Promise.resolve(url);
  }

  preloadedUrls.add(url);

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(url);
    img.onerror = () => resolve(url); // Don't reject on network failure
    img.src = url;
  });
}

/**
 * Preload an array of image URLs
 */
export function preloadImages(urls = []) {
  if (!Array.isArray(urls)) return Promise.resolve();
  const validUrls = urls.filter((u) => u && typeof u === 'string');
  return Promise.all(validUrls.map((u) => preloadImage(u)));
}

/**
 * Preload all image variants for a given product (main hero 850px, 500px, thumbnails 160px)
 */
export function preloadProduct(product) {
  if (!product) return;

  const urlsToPreload = [];

  const hero = product.primary_image || product.hero_image;
  if (hero) {
    urlsToPreload.push(getOptimizedImageUrl(hero, { width: 850 }));
    urlsToPreload.push(getOptimizedImageUrl(hero, { width: 500 }));
    urlsToPreload.push(getOptimizedImageUrl(hero, { width: 160 }));
  }

  const rawGallery = product.gallery_images || product.images || [];
  let galleryList = [];
  if (Array.isArray(rawGallery)) {
    galleryList = rawGallery;
  } else if (typeof rawGallery === 'string') {
    try {
      galleryList = JSON.parse(rawGallery);
    } catch (e) {
      galleryList = [];
    }
  }

  galleryList.forEach((img) => {
    if (img && typeof img === 'string') {
      urlsToPreload.push(getOptimizedImageUrl(img, { width: 850 }));
      urlsToPreload.push(getOptimizedImageUrl(img, { width: 160 }));
    }
  });

  return preloadImages(urlsToPreload);
}

/**
 * Key critical site-wide images that should always be cached in memory
 */
export const CRITICAL_SITE_IMAGES = [
  // Core Product Brand Assets
  '/assets/wooff-choco-tube.webp',
  '/assets/chocolate_clean.webp',
  '/assets/mint_clean.webp',
  '/assets/jungle-bg.webp',
  '/assets/nHAp.webp',
  '/assets/prebiotic.webp',
  '/assets/Swallowed.webp',
  '/assets/choco.webp',
  '/assets/tooth_paste.webp',
  '/images/dr-shrushti.webp',
  '/images/dr-shrushti-avatar.webp',

  // Key Ingredients Visuals
  '/images/ingredients/nhap_clean.webp',
  '/images/ingredients/theobromine_clean.webp',
  '/images/ingredients/inulin_clean.webp',
  '/images/ingredients/vitaminc_clean.webp',
  '/images/ingredients/lactoferrin_clean.webp',
  '/images/ingredients/coq10_clean.webp',
  '/images/ingredients/calcium_clean.webp',

  // Trust Badges
  '/assets/ce_certified.svg',
  '/assets/gmp_certified.webp',
  '/assets/dr_approved.webp',
  '/assets/peta_approved.webp',
];

/**
 * Initialize background preloader when browser is idle
 */
export function initGlobalImagePreloader() {
  if (typeof window === 'undefined') return;

  const runPreload = () => {
    // 1. Preload critical site images
    preloadImages(CRITICAL_SITE_IMAGES);

    // 2. Preload all product images (both 850px & 160px for every image)
    try {
      const products = getCachedProducts();
      if (Array.isArray(products)) {
        products.forEach((prod) => {
          preloadProduct(prod);
        });
      }
    } catch (err) {
      // Non-blocking
    }
  };

  // Run in idle callback if available, or shortly after initial mount
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => runPreload(), { timeout: 1500 });
  } else {
    setTimeout(runPreload, 250);
  }
}
