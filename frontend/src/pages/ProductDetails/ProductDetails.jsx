import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { loadShiprocketScript } from '../../utils/shiprocket';
import KeyIngredients from './KeyIngredients';
import ProductBrandShowcase from './ProductBrandShowcase';
import ProductFAQ from './ProductFAQ';
import ProductReviews from './ProductReviews';
import './ProductDetails.css';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Payment States
  const [paymentError, setPaymentError] = useState(null);

  // Shiprocket Checkout States
  const [isProcessingShiprocket, setIsProcessingShiprocket] = useState(false);

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

  const handleShiprocketCheckout = async (e) => {
    e.preventDefault();
    if (!data || data.stock <= 0) return;

    try {
      setPaymentError(null);
      setIsProcessingShiprocket(true);

      // STEP 1: Ensure Shiprocket script and hidden sellerDomain are ready
      await loadShiprocketScript();

      // STEP 2: Request Shiprocket Access Token from backend
      const response = await fetch('/api/shiprocket/checkout/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              variant_id: String(data.id),
              quantity: quantity,
            },
          ],
          redirect_url: `${window.location.origin}/order-success`,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.token) {
        if (
          result.isPendingChannelSync ||
          result.message?.includes('pending') ||
          result.message?.includes('Something went wrong')
        ) {
          throw new Error(
            'Shiprocket Checkout channel is pending activation from Shiprocket team. In the meantime, please click "PAY VIA RAZORPAY" below.'
          );
        }
        throw new Error(
          result.message || 'Shiprocket checkout initiation pending catalog sync configuration.'
        );
      }

      // STEP 3: Open Shiprocket Checkout Modal via HeadlessCheckout
      if (window.HeadlessCheckout && typeof window.HeadlessCheckout.addToCart === 'function') {
        window.HeadlessCheckout.addToCart(e, result.token, {
          fallbackUrl: `${window.location.origin}/product/${data.slug || data.id}`,
        });
      } else {
        throw new Error('Shiprocket HeadlessCheckout library not loaded in browser.');
      }
    } catch (err) {
      console.error('Shiprocket checkout error:', err);
      setPaymentError(err.message || 'Unable to open Shiprocket Checkout.');
    } finally {
      setIsProcessingShiprocket(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.product);
        } else {
          setError(result.message || 'Product not found');
        }
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };

    setSelectedImageIndex(0);
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="status-message">Loading product...</div>;
  if (error || !data) return <div className="status-message error">{error || 'Product not found'}</div>;

  const heroImg = data.hero_image || data.primary_image;
  const rawGallery = data.gallery_images || data.images || [];
  const galleryImagesRaw = typeof rawGallery === 'string' ? JSON.parse(rawGallery) : (rawGallery || []);
  const galleryList = Array.isArray(galleryImagesRaw) ? galleryImagesRaw : [];

  // Deduplicate all images starting with hero_image
  const allImages = [];
  if (heroImg) {
    allImages.push(heroImg);
  }
  galleryList.forEach((img) => {
    if (img && !allImages.includes(img) && !img.includes('citrus_detail') && !img.includes('brush_detail')) {
      allImages.push(img);
    }
  });

  // Ensure at least one fallback image exists if product has no images
  if (allImages.length === 0) {
    allImages.push('/assets/tooth_paste.webp');
  }

  return (
    <div className="product-page-wrapper">
      <div className="product-container">
        
        {/* Top Section: Image Gallery & Sticky Info */}
        <div className="product-hero-section">
          
          {/* Gallery Section - 1 Big Image + Bottom Thumbnails Row */}
          <div className="product-gallery-container">
            {/* Big Main Image Preview */}
            <div 
              className="gallery-main-card"
              onClick={() => setLightboxImage(allImages[selectedImageIndex] || allImages[0])}
            >
              <img 
                src={allImages[selectedImageIndex] || allImages[0]} 
                alt={`${data.title} preview`} 
                className="gallery-main-img" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/tooth_paste.webp';
                }}
              />
              <div className="zoom-hint" title="Click to enlarge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
            </div>

            {/* Bottom Thumbnails - Single Row */}
            {allImages.length > 1 && (
              <div className="gallery-thumbnails-row">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    className={`gallery-thumb-card ${idx === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    onMouseEnter={() => setSelectedImageIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img 
                      src={img} 
                      alt={`${data.title} thumbnail ${idx + 1}`} 
                      className="gallery-thumb-img" 
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
            
            <h1 className="product-title">{data.title}</h1>

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
                <span className="reviews-count no-reviews">
                  No reviews yet • <span style={{ textDecoration: 'underline', color: 'var(--primary-brown, #4B2E1E)', fontWeight: 600 }}>Be the first to review</span>
                </span>
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

            <p className="product-description">{data.description}</p>

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
                      <li>Dentist formulated & pediatric board approved</li>
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

        {/* Product Brand Showcase (Large Banner & 2-Column Founder/Mission Cards) */}
        <ProductBrandShowcase flavor={data.title} />

        {/* Revitin-Style 2-Column Product FAQ Component */}
        <ProductFAQ faqs={data.faqs} />

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
