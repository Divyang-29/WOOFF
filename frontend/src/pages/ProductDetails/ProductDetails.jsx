import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
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

            <div className="product-rating-row">
              <div className="stars">★★★★★</div>
              <span className="rating-score">{data.rating_avg ? parseFloat(data.rating_avg).toFixed(1) : '4.9'}</span>
              <span className="reviews-count">• {data.review_count || 128} Reviews</span>
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

            {/* 1. Check Delivery Timeline Fieldset */}
            <div className="delivery-pincode-wrapper mt-4">
              <div className="pincode-single-line-box">
                <span className="pincode-inline-label">Check Delivery Timeline</span>
                <input 
                  type="text" 
                  className="pincode-input" 
                  placeholder="Enter your Pincode"
                  value={pincode}
                  maxLength={6}
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
