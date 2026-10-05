import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { loadRazorpayScript } from '../../utils/razorpay';
import { loadShiprocketScript } from '../../utils/shiprocket';
import KeyIngredients from './KeyIngredients';
import ProductBrandShowcase from './ProductBrandShowcase';
import ProductFAQ from './ProductFAQ';
import ProductReviews from './ProductReviews';
import './ProductDetails.css';

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Razorpay Checkout States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Shiprocket Checkout States
  const [isProcessingShiprocket, setIsProcessingShiprocket] = useState(false);

  // Perfora-style states
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({
    benefits: true,
    howToUse: false,
    keyFeatures: false
  });

  const triggerPopAnim = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 250);
  };

  const handleCheckPincode = () => {
    if (!pincode || pincode.trim().length < 5) return;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);
    const dateStr = estDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setDeliveryStatus({ date: dateStr });
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

  const handleRazorpayCheckout = async () => {
    if (!data || data.stock <= 0) return;

    try {
      setPaymentError(null);
      setIsProcessingPayment(true);

      // STEP 1: Ensure Razorpay standard checkout script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setPaymentError('Razorpay payment gateway failed to load. Please check your internet connection.');
        setIsProcessingPayment(false);
        return;
      }

      // Calculate total amount in paise (minimum 100 paise = ₹1.00)
      const totalInr = Number(data.final_price) * Number(quantity);
      const amountInPaise = Math.round(totalInr * 100);

      if (amountInPaise < 100) {
        setPaymentError('Minimum checkout amount must be at least ₹1.00 (100 paise).');
        setIsProcessingPayment(false);
        return;
      }

      // STEP 2: Call backend create-order endpoint (POST /api/create-order)
      const createOrderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_prod_${data.id}_${Date.now()}`,
          notes: {
            product_id: data.id,
            product_name: data.title,
            quantity: quantity,
          },
        }),
      });

      const orderPayload = await createOrderRes.json();

      if (!createOrderRes.ok || !orderPayload.success) {
        throw new Error(orderPayload.message || 'Failed to create order on server.');
      }

      // STEP 3: Open Razorpay modal with order_id
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderPayload.key_id,
        amount: orderPayload.amount,
        currency: orderPayload.currency || 'INR',
        name: 'Wooff Pet Care',
        description: `${data.title} (Qty: ${quantity})`,
        image: (data.images && data.images.length > 0) ? data.images[0] : undefined,
        order_id: orderPayload.order_id,
        handler: async function (response) {
          // On success: receive razorpay_payment_id, razorpay_order_id, razorpay_signature
          // Send all three to verify endpoint (POST /api/verify-payment)
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setPaymentSuccessData({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: (amountInPaise / 100).toFixed(2),
                productTitle: data.title,
                quantity: quantity,
              });
            } else {
              setPaymentError(verifyData.message || 'Payment signature verification failed.');
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setPaymentError('Network error while verifying payment signature.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#4B2E1E',
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (failResponse) {
        console.error('Razorpay payment failed:', failResponse.error);
        setPaymentError(
          `Payment Failed: ${failResponse.error?.description || failResponse.error?.reason || 'Transaction could not be processed.'}`
        );
        setIsProcessingPayment(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Razorpay checkout error:', err);
      setPaymentError(err.message || 'Unable to open checkout modal. Please try again.');
      setIsProcessingPayment(false);
    }
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

    fetchProduct();
  }, [slug]);

  if (loading) return <div className="status-message">Loading product...</div>;
  if (error || !data) return <div className="status-message error">{error || 'Product not found'}</div>;

  const galleryImagesRaw = typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || []);
  const galleryList = Array.isArray(galleryImagesRaw) ? galleryImagesRaw : [];

  // Deduplicate all images starting with primary_image
  const allImages = [];
  if (data.primary_image) {
    allImages.push(data.primary_image);
  }
  galleryList.forEach((img) => {
    if (img && !allImages.includes(img) && !img.includes('citrus_detail') && !img.includes('brush_detail')) {
      allImages.push(img);
    }
  });

  // Guarantee 3-card layout using clean, unbranded Wooff detail shots
  if (allImages.length === 1) {
    allImages.push('https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80');
  } else if (allImages.length === 2) {
    allImages.push('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80');
  } else if (allImages.length === 0) {
    allImages.push('https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80');
  }

  return (
    <div className="product-page-wrapper">
      <div className="product-container">
        
        {/* Top Section: Image Gallery & Sticky Info */}
        <div className="product-hero-section">
          
          {/* Gallery Section - Stacked / Grid Layout */}
          <div className="product-gallery-container">
            <div className="product-gallery-grid">
              {allImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`gallery-card ${idx === 0 ? 'hero-card' : 'grid-card'}`}
                  onClick={() => setLightboxImage(img)}
                >
                  <img 
                    src={img} 
                    alt={`${data.title} view ${idx + 1}`} 
                    className="gallery-img" 
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
              ))}
            </div>
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

            {/* Shiprocket 1-Click Fast Checkout Button */}
            <button 
              type="button"
              id="shiprocketCheckoutBtn"
              className="shiprocket-checkout-btn" 
              disabled={data.stock <= 0 || isProcessingShiprocket}
              onClick={handleShiprocketCheckout}
            >
              {isProcessingShiprocket ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Connecting to Shiprocket...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-bolt-lightning me-2"></i>
                  {data.stock > 0 ? `1-CLICK FAST CHECKOUT • ₹${(data.final_price * quantity).toFixed(2)}` : 'OUT OF STOCK'}
                </>
              )}
            </button>

            {/* Razorpay Standard Checkout Buy Now Button */}
            <button 
              type="button"
              className="buy-now-btn" 
              disabled={data.stock <= 0 || isProcessingPayment}
              onClick={handleRazorpayCheckout}
            >
              {isProcessingPayment ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Connecting to Razorpay...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-credit-card me-2"></i>
                  {data.stock > 0 ? `PAY VIA RAZORPAY • ₹${(data.final_price * quantity).toFixed(2)}` : 'OUT OF STOCK'}
                </>
              )}
            </button>

            <div className="razorpay-trust-indicator">
              <i className="fa-solid fa-shield-halved"></i>
              <span>100% Secure Checkout • Shiprocket Fastrr & Razorpay (UPI, Cards, COD)</span>
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
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckPincode()}
                />
                <button className="btn-pincode-check" onClick={handleCheckPincode}>
                  Check Now
                </button>
              </div>

              {deliveryStatus && (
                <div className="delivery-results-box mt-3">
                  <div className="del-res-item">
                    <i className="fa-solid fa-truck-fast text-success me-2"></i>
                    <span>Get it by <strong>{deliveryStatus.date}</strong></span>
                  </div>
                  <div className="del-res-item">
                    <i className="fa-solid fa-hand-holding-dollar me-2"></i>
                    <span>Pay on delivery available</span>
                  </div>
                  <div className="del-res-item">
                    <i className="fa-solid fa-rotate-left me-2"></i>
                    <span>Hassle Free Customer Service</span>
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
              
              {/* Benefits */}
              <div className="accordion-block">
                <button 
                  className={`accordion-header-btn ${openAccordions.benefits ? 'active' : ''}`}
                  onClick={() => toggleAccordion('benefits')}
                >
                  <span>Benefits</span>
                  <span className="accordion-toggle-icon">{openAccordions.benefits ? '−' : '+'}</span>
                </button>
                {openAccordions.benefits && (
                  <div className="accordion-body-content">
                    <ul className="benefits-bullet-list">
                      <li>100% Prebiotic & Fluoride-free formulation</li>
                      <li>Strengthens tooth enamel with Bio-identical nHAp</li>
                      <li>100% safe if swallowed by toddlers and growing kids</li>
                      <li>Naturally delicious cacao & citrus flavor kids love</li>
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
                    <p className="usage-instruction-p">
                      Apply a pea-sized amount onto a soft toothbrush. Brush gently in circular motions for 2 minutes, twice daily (morning & bedtime). Safe if swallowed!
                    </p>
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

      {/* Razorpay Payment Success Modal */}
      {paymentSuccessData && (
        <div className="payment-success-overlay" onClick={() => setPaymentSuccessData(null)}>
          <div className="payment-success-card" onClick={(e) => e.stopPropagation()}>
            <div className="success-check-icon">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3>Payment Successful!</h3>
            <p className="success-subtitle">Your order has been placed and payment is verified via Razorpay.</p>

            <div className="payment-receipt-box">
              <div className="receipt-row">
                <span className="receipt-label">Product:</span>
                <span className="receipt-val">{paymentSuccessData.productTitle} × {paymentSuccessData.quantity}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Payment ID:</span>
                <span className="receipt-val">{paymentSuccessData.paymentId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Razorpay Order ID:</span>
                <span className="receipt-val">{paymentSuccessData.orderId}</span>
              </div>
              <div className="receipt-row total-row">
                <span>Amount Paid:</span>
                <span>₹{paymentSuccessData.amount}</span>
              </div>
            </div>

            <button 
              type="button" 
              className="btn-success-done"
              onClick={() => setPaymentSuccessData(null)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
