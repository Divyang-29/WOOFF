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
    if (url.includes(`w_${width}`)) {
      return url;
    }
    const uploadIdx = url.indexOf('/image/upload/');
    const rest = url.substring(uploadIdx + '/image/upload/'.length);
    const path = rest.replace(/^(?:[a-z]_[^/]+,?)+\//, '');
    return `${url.substring(0, uploadIdx)}/image/upload/f_auto,q_${quality},w_${width}/${path}`;
  }

  return url;
}

export const STATIC_PRODUCTS = [
  {
    id: 10,
    category_id: 1,
    title: "Wooff Kids Chocolate Flavour Toothpaste, Pack of 2 (50 g each)",
    slug: "choco-toothpaste-pack-of-2",
    price: "599.00",
    final_price: "499.00",
    primary_image: "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967017/wooff_assets/dkc3onzzzg2yztw3lj8m.jpg",
    hero_image: "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967017/wooff_assets/dkc3onzzzg2yztw3lj8m.jpg",
    images: [
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967017/wooff_assets/dkc3onzzzg2yztw3lj8m.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788427/wooff_assets/znq2j2izahb5wndbqkrz.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791815462/wooff_assets/oxb6pybtd6bvrgcj4gdq.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967034/wooff_assets/o75mhuuwshvx0cyotfqs.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967056/wooff_assets/musj098zuar4zx6oa44f.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967105/wooff_assets/xyreh4hk1lfyudwhwzu5.jpg"
    ],
    gallery_images: [
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967017/wooff_assets/dkc3onzzzg2yztw3lj8m.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791788427/wooff_assets/znq2j2izahb5wndbqkrz.webp",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791815462/wooff_assets/oxb6pybtd6bvrgcj4gdq.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967034/wooff_assets/o75mhuuwshvx0cyotfqs.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967056/wooff_assets/musj098zuar4zx6oa44f.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791967105/wooff_assets/xyreh4hk1lfyudwhwzu5.jpg"
    ],
    description: "Make brushing a daily habit with the Wooff Kids Chocolate Flavour Toothpaste Pack of 2. You get two 50g tubes (100g in total), so you always have one ready at home and one for travel, school or the grandparents’ house.\n\nMade for children above 2 years, Wooff Kids has a yummy chocolate taste that kids actually want to brush with. It contains Nano-Hydroxyapatite, Theobromine, Inulin, Vitamin C, Lactoferrin, Coenzyme Q10 and Calcium Gluconate.",
    stock: 100,
    sku: "WOOFF-KIDS-CHOCO-50G-P2",
    estimated_delivery: "2-4 business days",
    rating_avg: "4.80",
    review_count: 5,
    is_active: true,
    is_bestseller: true,
    bundle_type: "bundle-2",
    category_name: "Toothpaste",
    category_slug: "toothpaste",
    ingredients: [],
    faqs: [],
    reviews: []
  },
  {
    id: 9,
    category_id: 1,
    title: "Wooff Kids Choco Toothpaste 50g (Above 2 Years)",
    slug: "choco-toothpaste",
    price: "299.00",
    final_price: "249.00",
    primary_image: "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791815488/wooff_assets/relp8zkrytkkiozl7shc.jpg",
    hero_image: "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791815488/wooff_assets/relp8zkrytkkiozl7shc.jpg",
    images: [
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791815488/wooff_assets/relp8zkrytkkiozl7shc.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966772/wooff_assets/wdxgpry8jlhkzrkthcyh.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966726/wooff_assets/pncpleuxeuskef84e6fp.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966736/wooff_assets/b4xw9nuz8spvxx5k5cto.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966752/wooff_assets/j48dfjncw6lhemjdeyk3.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966808/wooff_assets/kkylwilrooaywztjdmia.jpg"
    ],
    gallery_images: [
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791815488/wooff_assets/relp8zkrytkkiozl7shc.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966772/wooff_assets/wdxgpry8jlhkzrkthcyh.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966726/wooff_assets/pncpleuxeuskef84e6fp.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966736/wooff_assets/b4xw9nuz8spvxx5k5cto.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966752/wooff_assets/j48dfjncw6lhemjdeyk3.jpg",
      "https://res.cloudinary.com/dnvgblkjo/image/upload/v1791966808/wooff_assets/kkylwilrooaywztjdmia.jpg"
    ],
    description: "Choco toothpaste is toothpaste with a chocolate flavour in place of mint. It cleans teeth the way any toothpaste does; the chocolate taste is there to make twice-daily brushing easier for children who find mint too strong.\n\nWooff Kids Choco Toothpaste is a sugar-free, fluoride-free chocolate toothpaste for children above 2 years. Its carton lists 2% nano-hydroxyapatite and 2% theobromine, and the formula also contains calcium gluconate, inulin, vitamin C, lactoferrin and coenzyme Q10.",
    stock: 100,
    sku: "WOOFF-KIDS-CHOCO-50G-P1",
    estimated_delivery: "2-4 business days",
    rating_avg: "4.90",
    review_count: 8,
    is_active: true,
    is_bestseller: false,
    bundle_type: "single",
    category_name: "Toothpaste",
    category_slug: "toothpaste",
    ingredients: [],
    faqs: [],
    reviews: []
  }
];

export function normalizeProduct(product) {
  if (!product) return product;
  const isSingle = product.slug === 'choco-toothpaste' || String(product.id) === '9';
  const isPack2 = product.slug === 'choco-toothpaste-pack-of-2' || String(product.id) === '10';

  return {
    ...product,
    title: isSingle
      ? 'Wooff Kids Choco Toothpaste 50g (Above 2 Years)'
      : isPack2
        ? 'Wooff Kids Chocolate Flavour Toothpaste, Pack of 2 (50 g each)'
        : (product.title || product.name),
  };
}

const CACHE_KEY_PRODUCTS = 'wooff_cached_products_v3';
const CACHE_KEY_PRODUCT_PREFIX = 'wooff_cached_prod_v3_';

export function getCachedProducts() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(CACHE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProduct);
        }
      }
    }
  } catch (err) {
    console.warn('Could not read cached products:', err);
  }
  return STATIC_PRODUCTS.map(normalizeProduct);
}

export function setCachedProducts(products) {
  try {
    if (typeof window !== 'undefined' && window.localStorage && Array.isArray(products) && products.length > 0) {
      const normalized = products.map(normalizeProduct);
      localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(normalized));
      // Also cache individual items
      normalized.forEach((p) => {
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
  if (!slugOrId) return normalizeProduct(STATIC_PRODUCTS[0]);
  const query = String(slugOrId).trim().toLowerCase();

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(`${CACHE_KEY_PRODUCT_PREFIX}${query}`);
      if (stored) {
        return normalizeProduct(JSON.parse(stored));
      }
    }
  } catch (err) {
    // ignore localstorage errors
  }

  // Check all in-memory / static products
  const pool = getCachedProducts();

  // 1. Direct slug match
  let found = pool.find((p) => p.slug && p.slug.toLowerCase() === query);
  if (found) return normalizeProduct(found);

  // 2. Direct ID match
  found = pool.find((p) => String(p.id) === query);
  if (found) return normalizeProduct(found);

  // 3. Fuzzy matches
  if (query.includes('pack-of-2') || query.includes('bundle') || query.includes('p2')) {
    const p2 = pool.find((p) => p.bundle_type === 'bundle-2') || STATIC_PRODUCTS[1];
    return normalizeProduct(p2);
  }
  if (query.includes('choco') || query.includes('toothpaste')) {
    const single = pool.find((p) => p.bundle_type === 'single') || STATIC_PRODUCTS[0];
    return normalizeProduct(single);
  }

  return normalizeProduct(STATIC_PRODUCTS[0]);
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

let onPrefetchCallback = null;
export function registerPrefetchCallback(cb) {
  onPrefetchCallback = cb;
}

export async function prefetchProducts() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setCachedProducts(data.products);
        if (typeof onPrefetchCallback === 'function') {
          onPrefetchCallback(data.products);
        }
      }
    }
  } catch (err) {
    // Non-blocking prefetch failure
  }
}

/**
 * Invalidate product cache so fresh real-time stock is retrieved after purchase
 */
export function invalidateProductCache(slugOrId) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(CACHE_KEY_PRODUCTS);
      if (slugOrId) {
        localStorage.removeItem(`${CACHE_KEY_PRODUCT_PREFIX}${String(slugOrId).toLowerCase()}`);
      } else {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith(CACHE_KEY_PRODUCT_PREFIX) || key === CACHE_KEY_PRODUCTS)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    }
  } catch (err) {
    console.warn('Could not invalidate product cache:', err);
  }
}
