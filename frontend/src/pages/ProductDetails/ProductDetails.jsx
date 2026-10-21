import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  getCachedProductBySlug,
  setCachedProduct,
  getOptimizedImageUrl,
} from '../../utils/productData';
import { preloadImages } from '../../utils/imagePreloader';
import KeyIngredients from './KeyIngredients';
import ProductBrandShowcase from './ProductBrandShowcase';
import ProductFAQ from './ProductFAQ';
import ProductReviews from './ProductReviews';
import SinglePackEditorial from './SinglePackEditorial';
import './ProductDetails.css';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const initialData = getCachedProductBySlug(slug);
  const [data, setData] = useState(initialData);
  const isSinglePack = slug === 'choco-toothpaste' || data?.slug === 'choco-toothpaste';
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Gallery Swipe & Drag States
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isSwipingHorizontally = useRef(null);
  const dragOffsetRef = useRef(0);
  const isMouseDownRef = useRef(false);
  const thumbRefs = useRef([]);

  // Payment States
  const [paymentError, setPaymentError] = useState(null);

  // Perfora-style states
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({
    benefits: true,
    howToUse: false,
    keyFeatures: false
  });

  const triggerPopAnim = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 250);
  };

  const handleCheckPincode = async () => {
    const cleanPin = (pincode || '').trim().replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      setPincodeError('Please enter a valid 6-digit postal pincode.');
      setDeliveryStatus(null);
      return;
    }

    setIsCheckingPincode(true);
    setPincodeError(null);
    setDeliveryStatus(null);

    try {
      const response = await fetch(`/api/shipping/estimate/${cleanPin}`);
      const data = await response.json();

      if (data.success && data.serviceable && data.etd) {
        setDeliveryStatus({
          etd: data.etd,
          days: data.estimated_delivery_days,
          courier: data.courier_name,
          city: data.city,
          state: data.state,
          message: data.message || `Expected delivery by ${data.etd}`,
        });
        setPincodeError(null);
      } else {
        setDeliveryStatus(null);
        setPincodeError(
          data.message || 'Delivery is currently not available for this pincode.'
        );
      }
    } catch (err) {
      console.error('Pincode check error:', err);
      setDeliveryStatus(null);
      setPincodeError('Unable to check delivery estimate right now. Please try again.');
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
    triggerPopAnim();
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      triggerPopAnim();
    }
  };

  const renderStars = (rating) => {
    const validRating = Number(rating) || 0;
    const fullStars = Math.round(validRating);
    const emptyStars = 5 - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  };

  const handleProceedToCheckout = () => {
    if (!data || data.stock <= 0) return;
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', { currency: 'INR' });
    }
    navigate('/checkout', {
      state: {
        directItem: {
          id: data.id,
          product_id: data.id,
          title: data.title,
          final_price: parseFloat(data.final_price || data.price),
          price: parseFloat(data.price),
          quantity: quantity,
          primary_image: (data.images && data.images.length > 0) ? data.images[0] : '/images/hero_tubes.webp',
        },
      },
    });
  };


  useEffect(() => {
    let isMounted = true;
    const initial = getCachedProductBySlug(slug);
    if (initial) {
      setData(initial);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}?_t=${Date.now()}`);
        const result = await response.json();

        if (result.success && isMounted) {
          setData(result.product);
          setCachedProduct(slug, result.product);
          setError(null);
        } else if (isMounted && !data && !initial) {
          setError(result.message || 'Product not found');
        }
      } catch (err) {
        if (isMounted && !data && !initial) {
          setError('Failed to fetch product details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setSelectedImageIndex(0);
    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (slug === 'choco-toothpaste' || data?.slug === 'choco-toothpaste') {
      document.title = 'Choco Toothpaste for Kids 2+ | Sugar-Free & Fluoride-Free';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Turn daily brushing into a treat with Wooff Choco Toothpaste for kids aged 2+. sugar-free and fluoride-free formula today!'
        );
      }
    } else if (slug === 'choco-toothpaste-pack-of-2' || data?.slug === 'choco-toothpaste-pack-of-2') {
      document.title = 'Wooff Kids Chocolate Toothpaste Pack of 2 | Wooff Care';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Save with Wooff Kids Chocolate Flavour Toothpaste Pack of 2 (50 g each). Natural, fluoride-free, dentist-formulated nHAp toothpaste for kids above 2 years.'
        );
      }
    } else if (data?.title) {
      document.title = `${data.title} | Wooff Care`;
    }
  }, [slug, data]);

  // Meta Pixel ViewContent event
  useEffect(() => {
    if (data && (data.name || data.title)) {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_name: data.name || data.title,
          value: parseFloat(data.final_price || data.price || 0),
          currency: 'INR',
        });
      }
    }
  }, [data?.id, data?.slug]);

  // Deduplicate all images starting with hero_image
  const heroImg = data?.hero_image || data?.primary_image;
  const rawGallery = data?.gallery_images || data?.images || [];
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

  const allImages = [];
  if (heroImg) {
    allImages.push(heroImg);
  }
  galleryList.forEach((img) => {
    if (img && !allImages.includes(img) && !img.includes('citrus_detail') && !img.includes('brush_detail')) {
      allImages.push(img);
    }
  });
  if (allImages.length === 0) {
    allImages.push('/assets/tooth_paste.webp');
  }

  // Preload all gallery image sizes in background immediately
  useEffect(() => {
    if (allImages && allImages.length > 0) {
      const fullUrls = allImages.map((img) => getOptimizedImageUrl(img, { width: 850 }));
      const thumbUrls = allImages.map((img) => getOptimizedImageUrl(img, { width: 160 }));
      preloadImages([...fullUrls, ...thumbUrls]);
    }
  }, [data?.id, data?.slug]);

  const startDrag = (clientX, clientY) => {
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    isSwipingHorizontally.current = null;
    dragOffsetRef.current = 0;
  };

  const moveDrag = (clientX, clientY) => {
    if (!touchStartRef.current.time) return;
    const deltaX = clientX - touchStartRef.current.x;
    const deltaY = clientY - touchStartRef.current.y;

    if (isSwipingHorizontally.current === null) {
      if (Math.abs(deltaX) > 7 || Math.abs(deltaY) > 7) {
        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
          isSwipingHorizontally.current = true;
          setIsDragging(true);
        } else {
          isSwipingHorizontally.current = false;
          return;
        }
      } else {
        return;
      }
    }

    if (isSwipingHorizontally.current) {
      const isAtFirst = selectedImageIndex === 0 && deltaX > 0;
      const isAtLast = selectedImageIndex === allImages.length - 1 && deltaX < 0;
      const applied = (isAtFirst || isAtLast) ? deltaX * 0.3 : deltaX;
      dragOffsetRef.current = applied;
      setDragOffset(applied);
    }
  };

  const endDrag = () => {
    if (!touchStartRef.current.time) return;
    const deltaX = dragOffsetRef.current;
    const wasHorizontal = isSwipingHorizontally.current;

    touchStartRef.current = { x: 0, y: 0, time: 0 };
    isSwipingHorizontally.current = null;
    dragOffsetRef.current = 0;
    setIsDragging(false);
    setDragOffset(0);

    if (wasHorizontal) {
      const threshold = 35; // 35px threshold for quick, responsive swipe
      if (deltaX < -threshold && selectedImageIndex < allImages.length - 1) {
        setSelectedImageIndex((prev) => prev + 1);
      } else if (deltaX > threshold && selectedImageIndex > 0) {
        setSelectedImageIndex((prev) => prev - 1);
      }
    }
  };

  // Touch Event Handlers
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    endDrag();
  };

  // Mouse Drag Handlers (for DevTools & desktop click-and-drag)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isMouseDownRef.current = true;
    startDrag(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    moveDrag(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    endDrag();
  };

  const handleMouseLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      endDrag();
    }
  };

  const handleCardClick = () => {
    if (isSwipingHorizontally.current) return;
    setLightboxImage(allImages[selectedImageIndex] || allImages[0]);
  };

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (thumbRefs.current[selectedImageIndex]) {
      thumbRefs.current[selectedImageIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedImageIndex]);

  if (loading && !data) return <div className="status-message">Loading product...</div>;
  if ((error || !data) && !loading) return <div className="status-message error">{error || 'Product not found'}</div>;

  return (
    <div className="product-page-wrapper">
      <div className="product-container">

        {/* Top Section: Image Gallery & Sticky Info */}
        <div className="product-hero-section">

          {/* Gallery Section - Swipeable Main Image + Bottom Thumbnails Row */}
          <div className="product-gallery-container">
            {/* Big Main Image Preview with Mobile Swipe & Desktop Nav */}
            <div
              className={`gallery-main-card ${isDragging ? 'is-dragging' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onClick={handleCardClick}
            >
              <div
                className="gallery-slider-track"
                style={{
                  transform: `translateX(calc(-${selectedImageIndex * 100}% + ${dragOffset}px))`,
                  transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              >
                {allImages.map((img, idx) => (
                  <div key={idx} className="gallery-slide-item">
                    <img
                      src={getOptimizedImageUrl(img, { width: 850 })}
                      alt={`${data.title} preview ${idx + 1}`}
                      className="gallery-main-img"
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/tooth_paste.webp';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Mobile Counter Pill */}
              {allImages.length > 1 && (
                <div className="gallery-counter-pill" aria-live="polite">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              )}

              {/* Desktop Zoom Hint Badge */}
              <div
                className="zoom-hint"
                title="Click to enlarge"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImage(allImages[selectedImageIndex] || allImages[0]);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>

              {/* Desktop Nav Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-nav-arrow gallery-nav-prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={selectedImageIndex === 0}
                    aria-label="Previous image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="gallery-nav-arrow gallery-nav-next"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => Math.min(allImages.length - 1, prev + 1));
                    }}
                    disabled={selectedImageIndex === allImages.length - 1}
                    aria-label="Next image"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnails - Single Row */}
            {allImages.length > 1 && (
              <div className="gallery-thumbnails-row">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    ref={(el) => (thumbRefs.current[idx] = el)}
                    type="button"
                    className={`gallery-thumb-card ${idx === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    onMouseEnter={() => setSelectedImageIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={getOptimizedImageUrl(img, { width: 160 })}
                      alt={`${data.title} thumbnail ${idx + 1}`}
                      className="gallery-thumb-img"
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/tooth_paste.webp';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Product Details */}
          <div className="product-info-sticky">
            {data.category_name && (
              <Link to={`/category/${data.category_slug}`} className="category-badge">
                {data.category_name}
              </Link>
            )}

            <h1 className="product-title">
              {slug === 'choco-toothpaste' || data.slug === 'choco-toothpaste'
                ? 'Choco Toothpaste'
                : (slug === 'choco-toothpaste-pack-of-2' || data.slug === 'choco-toothpaste-pack-of-2'
                  ? 'Wooff Kids Chocolate Flavour Toothpaste, Pack of 2 (50 g each)'
                  : data.title)}
            </h1>

            <div
              className="product-rating-row"
              onClick={() => {
                const el = document.getElementById('customer-reviews-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ cursor: 'pointer' }}
              title={Number(data.review_count) > 0 ? 'Click to view customer reviews' : 'Click to write the first review'}
            >
              {Number(data.review_count) > 0 ? (
                <>
                  <div className="stars">{renderStars(data.rating_avg)}</div>
                  <span className="rating-score">
                    {parseFloat(data.rating_avg).toFixed(1)}
                  </span>
                  <span className="reviews-count">
                    • {data.review_count} {parseInt(data.review_count, 10) === 1 ? 'Review' : 'Reviews'}
                  </span>
                </>
              ) : (
                <>
                  <div className="stars">☆☆☆☆☆</div>
                  <span className="rating-score">0.0</span>
                  <span className="reviews-count">
                    • 0 Reviews • <span style={{ textDecoration: 'underline', color: 'var(--primary-brown, #4B2E1E)', fontWeight: 600 }}>Be the first to review</span>
                  </span>
                </>
              )}
            </div>

            <div className="product-pricing">
              <span className="final-price">₹{data.final_price}</span>
              {data.price > data.final_price && (
                <>
                  <span className="original-price">₹{data.price}</span>
                  <span className="save-badge">Save {Math.round(((data.price - data.final_price) / data.price) * 100)}%</span>
                </>
              )}
            </div>

            {/* Real-time Inventory & Stock Status Badge */}
            <div className="product-stock-badge-row">
              {Number(data.stock) > 20 ? (
                <span className="stock-pill stock-pill--in">
                  <span className="stock-dot stock-dot--green"></span> In Stock ({data.stock} units available)
                </span>
              ) : Number(data.stock) > 0 ? (
                <span className="stock-pill stock-pill--low">
                  <span className="stock-dot stock-dot--amber"></span> Only {data.stock} units left in stock - order soon!
                </span>
              ) : (
                <span className="stock-pill stock-pill--out">
                  <span className="stock-dot stock-dot--red"></span> Currently Out of Stock
                </span>
              )}
            </div>

            <div className="product-description">
              {isSinglePack ? (
                <>
                  <p>
                    Choco toothpaste is toothpaste with a chocolate flavour in place of mint. It cleans teeth the way any toothpaste does; the chocolate taste is there to make twice-daily brushing easier for children who find mint too strong.
                  </p>
                  <p className="mt-2 mb-0">
                    Wooff Kids Choco Toothpaste is a sugar-free, fluoride-free chocolate toothpaste for children above 2 years. Its carton lists 2% nano-hydroxyapatite and 2% theobromine, and the formula also contains calcium gluconate, inulin, vitamin C, lactoferrin and coenzyme Q10.
                  </p>
                </>
              ) : (
                <p>{data.description}</p>
              )}
            </div>

            <div className="quantity-and-cart-row">
              <div className="quantity-selector">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="qty-btn"
                  aria-label="Decrease quantity"
                >-</button>
                <span className="qty-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="qty-btn"
                  aria-label="Increase quantity"
                >+</button>
              </div>

              <button
                className="add-to-cart-btn"
                disabled={data.stock <= 0}
                onClick={() => addToCart(data, quantity)}
              >
                {data.stock > 0 ? `ADD TO CART • ₹${(data.final_price * quantity).toFixed(2)}` : 'OUT OF STOCK'}
              </button>
            </div>

            {/* Direct Checkout Form Button */}
            <button
              type="button"
              id="proceedToCheckoutBtn"
              className="buy-now-btn"
              disabled={data.stock <= 0}
              onClick={handleProceedToCheckout}
            >
              <i className="fa-solid fa-truck-fast me-2"></i>
              {data.stock > 0 ? `PROCEED TO CHECKOUT • ₹${(data.final_price * quantity).toFixed(2)}` : 'OUT OF STOCK'}
            </button>

            <div className="razorpay-trust-indicator">
              <i className="fa-solid fa-shield-halved"></i>
              <span>100% Secure Checkout • Razorpay (UPI, Cards, NetBanking, COD)</span>
            </div>

            {/* Payment Error Feedback */}
            {paymentError && (
              <div className="razorpay-error-banner" role="alert">
                <div>
                  <i className="fa-solid fa-circle-exclamation me-2"></i>
                  {paymentError}
                </div>
                <button type="button" onClick={() => setPaymentError(null)} aria-label="Close error alert">×</button>
              </div>
            )}

            {/* 1. Check Delivery Timeline Fieldset */}
            <div className="delivery-pincode-wrapper mt-4">
              <div className="pincode-single-line-box">
                <span className="pincode-inline-label">Check Delivery Timeline</span>
                <input
                  type="text"
                  className="pincode-input"
                  placeholder="Enter Pincode"
                  value={pincode}
                  maxLength={6}
                  size={6}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ''));
                    if (pincodeError) setPincodeError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !isCheckingPincode && handleCheckPincode()}
                />
                <button
                  type="button"
                  className="btn-pincode-check"
                  onClick={handleCheckPincode}
                  disabled={isCheckingPincode}
                >
                  {isCheckingPincode ? 'Checking...' : 'Check Now'}
                </button>
              </div>

              {/* Error Message for Invalid / Unserviceable Pincode */}
              {pincodeError && (
                <div className="pincode-error-message mt-2" role="alert">
                  <i className="fa-solid fa-circle-exclamation text-danger me-1"></i>
                  <span>{pincodeError}</span>
                </div>
              )}

              {/* Success Message Displaying Estimated Delivery Date */}
              {deliveryStatus && (
                <div className="delivery-results-box mt-3">
                  <div className="del-res-item">
                    <i className="fa-solid fa-truck-fast text-success me-2"></i>
                    <span>
                      Expected delivery: <strong>{deliveryStatus.etd}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Trust Icons Strip */}
            <div className="product-trust-strip mt-3">
              <div className="trust-strip-item">
                <i className="fa-solid fa-box-open me-2"></i> Ships within 48h
              </div>
              <div className="trust-strip-item">
                <i className="fa-solid fa-arrows-rotate me-2"></i> COD Available
              </div>
              <div className="trust-strip-item">
                <i className="fa-solid fa-truck-fast me-2"></i> Free Shipping
              </div>
            </div>

            {/* 4. Collapsible Product Details Accordions */}
            <div className="product-info-accordions mt-4">

              {/* Key Benefits */}
              <div className="accordion-block">
                <button
                  className={`accordion-header-btn ${openAccordions.benefits ? 'active' : ''}`}
                  onClick={() => toggleAccordion('benefits')}
                >
                  <span>Key Benefits</span>
                  <span className="accordion-toggle-icon">{openAccordions.benefits ? '−' : '+'}</span>
                </button>
                {openAccordions.benefits && (
                  <div className="accordion-body-content">
                    <ul className="benefits-bullet-list">
                      <li>Chocolate taste kids enjoy</li>
                      <li>Enamel-friendly mineral ingredients</li>
                      <li>Gum-care and antioxidant support</li>
                      <li>Made for children&apos;s daily routine</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* How To Use */}
              <div className="accordion-block">
                <button
                  className={`accordion-header-btn ${openAccordions.howToUse ? 'active' : ''}`}
                  onClick={() => toggleAccordion('howToUse')}
                >
                  <span>How To Use</span>
                  <span className="accordion-toggle-icon">{openAccordions.howToUse ? '−' : '+'}</span>
                </button>
                {openAccordions.howToUse && (
                  <div className="accordion-body-content">
                    <ul className="usage-steps-list">
                      <li>Wet the brush and add a pea-sized amount.</li>
                      <li>Brush all surfaces for two minutes.</li>
                      <li>Spit out and rinse. Do this twice daily with adult supervision.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Key Features */}
              <div className="accordion-block">
                <button
                  className={`accordion-header-btn ${openAccordions.keyFeatures ? 'active' : ''}`}
                  onClick={() => toggleAccordion('keyFeatures')}
                >
                  <span>Key Features</span>
                  <span className="accordion-toggle-icon">{openAccordions.keyFeatures ? '−' : '+'}</span>
                </button>
                {openAccordions.keyFeatures && (
                  <div className="accordion-body-content">
                    <ul className="features-bullet-list">
                      <li>Dentist formulated</li>
                      <li>SLS-Free, Paraben-Free, Artificial Dye Free</li>
                      <li>Cruelty-Free & 100% Vegan ingredients</li>
                      <li>Nurtures good oral bacteria & balances microbiome</li>
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Reusable Key Ingredients Component */}
        <KeyIngredients ingredients={data.ingredients} maxDisplay={6} showViewAll={true} />

        {/* Single Pack Editorial Content from choco-toothpaste.html - only rendered for single pack */}
        {isSinglePack && <SinglePackEditorial />}

        {/* Product Brand Showcase (Large Banner & 2-Column Founder/Mission Cards) */}
        <ProductBrandShowcase flavor={data.title} />

        {/* Revitin-Style 2-Column Product FAQ Component */}
        <ProductFAQ faqs={data.faqs} isSinglePack={isSinglePack} />

        {/* Dynamic Customer Reviews Dashboard & Grid */}
        <ProductReviews
          productId={data.id}
          productSlug={data.slug}
          initialRatingAvg={data.rating_avg}
          initialReviewCount={data.review_count}
          initialReviews={data.reviews}
          onReviewAdded={({ newAvg, newCount }) => {
            setData((prev) => ({
              ...prev,
              rating_avg: newAvg,
              review_count: newCount
            }));
          }}
        />

      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>✕</button>
            <img src={lightboxImage} alt="Enlarged view" className="lightbox-img" />
          </div>
        </div>
      )}

    </div>
  );
}
