/**
 * Product Data & Caching Utilities
 * Provides instant 0ms initial product rendering (SWR),
 * automatic Cloudinary image optimization, and localStorage caching.
 */

export function getOptimizedImageUrl(url, { width = 800, quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string') {
    return '/assets/tooth_paste.webp';
  }

  // Handle Cloudinary URLs: apply auto format, auto quality, and specific bounding width
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/w_')) {
      return url;
    }
    return url.replace(
      '/image/upload/',
      `/image/upload/f_auto,q_${quality},w_${width}/`
    );
  }

  return url;
}

export const STATIC_PRODUCTS = [
  {
    id: 9,
    category_id: 1,
    title: "Wooff Kids Chocolate Flavour Toothpaste, 50 g (Above 2 Years)",
    slug: "choco-toothpaste",
    price: "299.00",
    final_price: "249.00",
    primary_image: "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791781980/wooff_assets/b3fd4z5qwuoqeysk29zs.webp",
    hero_image: "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791781980/wooff_assets/b3fd4z5qwuoqeysk29zs.webp",
    images: [
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791781547/wooff_assets/zy37l64bppfrdlstenyc.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791781555/wooff_assets/my08smsbyzpd3qqosl6c.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791781991/wooff_assets/o0jeosfzzt79asi833jp.webp"
    ],
    gallery_images: [
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791781547/wooff_assets/zy37l64bppfrdlstenyc.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791781555/wooff_assets/my08smsbyzpd3qqosl6c.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791781991/wooff_assets/o0jeosfzzt79asi833jp.webp"
    ],
    description: "Brushing just got delicious! Wooff Kids Chocolate Flavour Toothpaste is a chocolate toothpaste for kids above 2 years, made with Nano-Hydroxyapatite, Theobromine, Lactoferrin, Coenzyme Q10 and more. A yummy chocolate taste helps kids look forward to brushing every day.",
    stock: 100,
    sku: "WOOFF-KIDS-CHOCO-50G-P1",
    estimated_delivery: "2-4 business days",
    rating_avg: "5.00",
    review_count: 24,
    is_active: true,
    is_bestseller: false,
    bundle_type: "single",
    category_name: "Toothpaste",
    category_slug: "toothpaste",
    ingredients: [],
    faqs: [],
    reviews: []
  },
  {
    id: 10,
    category_id: 1,
    title: "Wooff Kids Chocolate Flavour Toothpaste, Pack of 2 (50 g each)",
    slug: "choco-toothpaste-pack-of-2",
    price: "599.00",
    final_price: "499.00",
    primary_image: "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788409/wooff_assets/vh3ks7obzzjdil6kzqah.webp",
    hero_image: "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788409/wooff_assets/vh3ks7obzzjdil6kzqah.webp",
    images: [
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788417/wooff_assets/ujgcek9vnpbqqtj9rluq.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788427/wooff_assets/znq2j2izahb5wndbqkrz.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788437/wooff_assets/dyyth1yoaikaitsqagdw.webp"
    ],
    gallery_images: [
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788417/wooff_assets/ujgcek9vnpbqqtj9rluq.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788427/wooff_assets/znq2j2izahb5wndbqkrz.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788437/wooff_assets/dyyth1yoaikaitsqagdw.webp"
    ],
    description: "Make brushing a daily habit with the Wooff Kids Chocolate Flavour Toothpaste Pack of 2. You get two 50g tubes (100g in total), so you always have one ready at home and one for travel, school or the grandparents’ house.\n\nMade for children above 2 years, Wooff Kids has a yummy chocolate taste that kids actually want to brush with. It contains Nano-Hydroxyapatite, Theobromine, Inulin, Vitamin C, Lactoferrin, Coenzyme Q10 and Calcium Gluconate.",
    stock: 100,
    sku: "WOOFF-KIDS-CHOCO-50G-P2",
    estimated_delivery: "2-4 business days",
    rating_avg: "5.00",
    review_count: 18,
    is_active: true,
    is_bestseller: true,
    bundle_type: "bundle-2",
    category_name: "Toothpaste",
    category_slug: "toothpaste",
    ingredients: [],
    faqs: [],
    reviews: []
  }
];

const CACHE_KEY_PRODUCTS = 'wooff_cached_products_v1';
const CACHE_KEY_PRODUCT_PREFIX = 'wooff_cached_prod_v1_';

export function getCachedProducts() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(CACHE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Could not read cached products:', err);
  }
  return STATIC_PRODUCTS;
}

export function setCachedProducts(products) {
  try {
    if (typeof window !== 'undefined' && window.localStorage && Array.isArray(products) && products.length > 0) {
      localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(products));
      // Also cache individual items
      products.forEach((p) => {
        if (p.slug) {
          localStorage.setItem(`${CACHE_KEY_PRODUCT_PREFIX}${p.slug}`, JSON.stringify(p));
        }
        if (p.id) {
          localStorage.setItem(`${CACHE_KEY_PRODUCT_PREFIX}${p.id}`, JSON.stringify(p));
        }
      });
    }
  } catch (err) {
    console.warn('Could not write cached products:', err);
  }
}

export function getCachedProductBySlug(slugOrId) {
  if (!slugOrId) return STATIC_PRODUCTS[0];
  const query = String(slugOrId).trim().toLowerCase();

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(`${CACHE_KEY_PRODUCT_PREFIX}${query}`);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (err) {
    // ignore localstorage errors
  }

  // Check all in-memory / static products
  const pool = getCachedProducts();

  // 1. Direct slug match
  let found = pool.find((p) => p.slug && p.slug.toLowerCase() === query);
  if (found) return found;

  // 2. Direct ID match
  found = pool.find((p) => String(p.id) === query);
  if (found) return found;

  // 3. Fuzzy matches
  if (query.includes('pack-of-2') || query.includes('bundle') || query.includes('p2')) {
    return pool.find((p) => p.bundle_type === 'bundle-2') || STATIC_PRODUCTS[1];
  }
  if (query.includes('choco') || query.includes('toothpaste')) {
    return pool.find((p) => p.bundle_type === 'single') || STATIC_PRODUCTS[0];
  }

  return STATIC_PRODUCTS[0];
}

export function setCachedProduct(slugOrId, product) {
  try {
    if (typeof window !== 'undefined' && window.localStorage && product) {
      if (slugOrId) {
        localStorage.setItem(`${CACHE_KEY_PRODUCT_PREFIX}${String(slugOrId).trim().toLowerCase()}`, JSON.stringify(product));
      }
      if (product.slug) {
        localStorage.setItem(`${CACHE_KEY_PRODUCT_PREFIX}${product.slug.toLowerCase()}`, JSON.stringify(product));
      }
      if (product.id) {
        localStorage.setItem(`${CACHE_KEY_PRODUCT_PREFIX}${product.id}`, JSON.stringify(product));
      }
    }
  } catch (err) {
    console.warn('Could not write cached product:', err);
  }
}

/**
 * Background silent prefetch of products to warm up the cache
 */
export async function prefetchProducts() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setCachedProducts(data.products);
      }
    }
  } catch (err) {
    // Non-blocking prefetch failure
  }
}
