import React, { useState } from 'react';
import './ProductReviews.css';

export default function ProductReviews({ productId, productSlug, initialRatingAvg, initialReviewCount, initialReviews, onReviewAdded }) {
  // Use real backend reviews from the database
  const [reviews, setReviews] = useState(() => {
    return Array.isArray(initialReviews) ? initialReviews : [];
  });

  const [ratingAvg, setRatingAvg] = useState(parseFloat(initialRatingAvg || 0));
  const [reviewCount, setReviewCount] = useState(parseInt(initialReviewCount !== undefined && initialReviewCount !== null ? initialReviewCount : (initialReviews?.length || 0), 10));

  // Sync state whenever async backend product data finishes loading
  React.useEffect(() => {
    if (Array.isArray(initialReviews)) {
      setReviews(initialReviews);
    }
    if (initialRatingAvg !== undefined && initialRatingAvg !== null) {
      const avg = parseFloat(initialRatingAvg);
      if (!isNaN(avg)) setRatingAvg(avg);
    }
    if (initialReviewCount !== undefined && initialReviewCount !== null) {
      const cnt = parseInt(initialReviewCount, 10);
      if (!isNaN(cnt)) setReviewCount(cnt);
    }
  }, [initialReviews, initialRatingAvg, initialReviewCount]);

  // Controls for Inline Form & Pagination
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [sortOption, setSortOption] = useState('highest');
  const [visibleCount, setVisibleCount] = useState(6);
  
  // Form input states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  // Helper to calculate star breakdown count and percentages dynamically
  const getStarCount = (starRating) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.filter((r) => Math.round(Number(r.rating)) === starRating).length;
  };

  const getStarPercentage = (starRating) => {
    if (!reviews || reviews.length === 0) return 0;
    const matchCount = getStarCount(starRating);
    return Math.round((matchCount / reviews.length) * 100);
  };

  const getStarsIcons = (starRating) => {
    return '★'.repeat(starRating) + '☆'.repeat(5 - starRating);
  };

  // Handle Review Submission to Backend
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) {
      setFormError('Please fill in your name and review message.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const targetId = productId || productSlug;
      if (!targetId) {
        throw new Error('Product context missing. Cannot submit review.');
      }

      const response = await fetch(`/api/products/${targetId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formName.trim(),
          rating: formRating,
          review_text: formTitle ? `${formTitle.trim()} - ${formText.trim()}` : formText.trim()
        })
      });

      const resData = await response.json();
      if (!resData.success || !resData.review) {
        throw new Error(resData.message || 'Failed to submit review.');
      }

      const newReviewObj = {
        id: resData.review.id || Date.now(),
        customer_name: resData.review.customer_name,
        rating: parseFloat(resData.review.rating),
        title: formTitle || '',
        review_text: resData.review.review_text || formText,
        created_at: resData.review.created_at || new Date().toISOString(),
        verified: true
      };

      // Update state dynamically with saved backend review
      setReviews((prev) => [newReviewObj, ...prev.filter(r => r.id !== newReviewObj.id)]);

      const newAvg = resData.rating_avg ? parseFloat(resData.rating_avg) : parseFloat(((ratingAvg * reviewCount + formRating) / (reviewCount + 1)).toFixed(1));
      const newCount = resData.review_count ? parseInt(resData.review_count, 10) : reviewCount + 1;

      setRatingAvg(newAvg);
      setReviewCount(newCount);

      if (onReviewAdded) {
        onReviewAdded({ newAvg, newCount, newReview: newReviewObj });
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsWritingReview(false);
        setFormName('');
        setFormEmail('');
        setFormTitle('');
        setFormText('');
        setFormRating(5);
        const el = document.getElementById('customer-reviews-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 900);

    } catch (err) {
      console.error('Submit Review Error:', err);
      setFormError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Sort Reviews Logic
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === 'highest') return b.rating - a.rating;
    if (sortOption === 'lowest') return a.rating - b.rating;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const visibleReviews = sortedReviews.slice(0, visibleCount);

  const isAdmin = typeof window !== 'undefined' && (
    localStorage.getItem('admin_unlocked') === 'true' || 
    localStorage.getItem('wooff_admin_passcode') === 'admin123'
  );

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      const response = await fetch(`/api/products/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'x-admin-passcode': 'admin123' }
      });
      const resData = await response.json();
      if (resData.success) {
        setReviews((prev) => prev.filter(r => r.id !== reviewId));
        if (resData.rating_avg) setRatingAvg(parseFloat(resData.rating_avg));
        if (resData.review_count !== undefined) setReviewCount(resData.review_count);
        if (onReviewAdded) {
          onReviewAdded({ newAvg: parseFloat(resData.rating_avg), newCount: resData.review_count });
        }
      } else {
        alert(resData.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Delete review error:', err);
      alert('Failed to delete review.');
    }
  };

  return (
    <section className="product-reviews-section text-center" id="customer-reviews-section">
      <div className="revitin-reviews-container">

        {isWritingReview ? (
          /* Inline "Write a review" View (Exact Revitin style) */
          <div className="revitin-write-form-container">
            <h2 className="revitin-write-heading">Write a review</h2>

            {submitSuccess ? (
              <div className="review-success-banner my-4">
                <i className="fa-solid fa-circle-check text-success me-2"></i>
                <span>Thank you! Your review has been submitted successfully.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="revitin-form text-start">
                {formError && <div className="form-error-alert mb-3">{formError}</div>}

                {/* 1. Rating */}
                <div className="revitin-form-group text-center">
                  <label className="revitin-form-label text-center">Rating</label>
                  <div className="revitin-star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`star-pick ${star <= formRating ? 'filled' : ''}`}
                        onClick={() => setFormRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Review Title */}
                <div className="revitin-form-group">
                  <label className="revitin-form-label">Review Title</label>
                  <input 
                    type="text" 
                    className="revitin-input"
                    placeholder="Give your review a title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                {/* 3. Review Content */}
                <div className="revitin-form-group">
                  <label className="revitin-form-label">Review content</label>
                  <textarea 
                    className="revitin-textarea"
                    placeholder="Start writing here..."
                    rows={4}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    required
                  />
                </div>

                {/* 4. Picture/Video (optional) */}
                <div className="revitin-form-group">
                  <label className="revitin-form-label">Picture/Video (optional)</label>
                  <div className="revitin-upload-box">
                    <i className="fa-solid fa-arrow-up-from-bracket revitin-upload-icon"></i>
                    <span>Click or drag to upload</span>
                  </div>
                </div>

                {/* 5. Display name (displayed publicly) */}
                <div className="revitin-form-group">
                  <label className="revitin-form-label">Display name (displayed publicly)</label>
                  <input 
                    type="text" 
                    className="revitin-input"
                    placeholder="Display name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                {/* 6. Email address */}
                <div className="revitin-form-group">
                  <label className="revitin-form-label">Email address</label>
                  <input 
                    type="email" 
                    className="revitin-input"
                    placeholder="Your email address"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                  <p className="revitin-form-note mt-2">
                    How we use your data: We'll only contact you about the review you left, and only if necessary.
                  </p>
                </div>

                {/* 7. Action buttons (Cancel & Submit) */}
                <div className="revitin-form-actions">
                  <button 
                    type="button" 
                    className="revitin-btn-cancel"
                    onClick={() => {
                      setIsWritingReview(false);
                      setFormError(null);
                    }}
                  >
                    Cancel review
                  </button>
                  <button 
                    type="submit" 
                    className="revitin-btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Normal Customer Reviews Dashboard */
          <>
            {/* 1. Main Heading */}
            <h2 className="revitin-heading">Customer Reviews</h2>

            {/* 2. Top Score & Stars Header */}
            <div className="revitin-score-header">
              <div className="revitin-score-row">
                <span className="revitin-score-num">
                  {reviewCount > 0 ? ratingAvg.toFixed(1) : '5.0'}
                </span>
                <span className="revitin-score-stars">
                  {reviewCount > 0 
                    ? ('★'.repeat(Math.round(ratingAvg)) + '☆'.repeat(5 - Math.round(ratingAvg)))
                    : '★★★★★'}
                </span>
              </div>
              <div className="revitin-reviews-pill">
                {reviewCount > 0 
                  ? `${reviewCount.toLocaleString()} ${reviewCount === 1 ? 'Review' : 'Reviews'}` 
                  : '0 Reviews'}
              </div>
            </div>

            {/* 3. 5-Star Breakdown Progress Bars (Exact Revitin style) */}
            <div className="revitin-bars-container">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = getStarCount(star);
                const pct = getStarPercentage(star);
                return (
                  <div key={star} className="revitin-bar-row">
                    <span className="revitin-star-icons">{getStarsIcons(star)}</span>
                    <div className="revitin-track">
                      <div className="revitin-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="revitin-count">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* 4. Reviews Summary with Sparkle & Write Review Button */}
            <div className="revitin-summary-section">
              <h3 className="revitin-summary-title">
                Reviews Summary <i className="fa-solid fa-wand-magic-sparkles revitin-sparkle"></i>
              </h3>
              <p className="revitin-summary-text">
                Most customers find Wooff toothpaste to be a refreshing, gentle alternative to conventional formulas, praising its clean, natural taste and the way their dogs look forward to brushing. Many report cleaner teeth, healthy gums, improved breath, and peace of mind from the non-toxic, bio-identical enamel protection.
              </p>
              <button 
                type="button" 
                className="revitin-write-btn"
                onClick={() => setIsWritingReview(true)}
              >
                Write a Review
              </button>
            </div>
          </>
        )}

        {/* 5. Sort Bar - Only show when there are reviews */}
        {visibleReviews.length > 0 && !isWritingReview && (
          <div className="revitin-sort-bar">
            <select 
              id="sort-select" 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="revitin-sort-select"
            >
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="newest">Most Recent</option>
            </select>
          </div>
        )}

        {/* 6. Reviews Cards Grid (Only show when not in writing mode or below) */}
        {!isWritingReview && (
          <div className="reviews-cards-grid text-start">
            {visibleReviews.length === 0 ? (
              <div className="no-reviews-note text-center py-3 w-100" style={{ gridColumn: '1 / -1' }}>
                <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>No reviews yet for this product. Be the first to review!</p>
              </div>
            ) : (
              visibleReviews.map((rev) => (
                <div key={rev.id} className="review-item-card" style={{ position: 'relative' }}>
                  
                  {isAdmin && rev.id && (
                    <button 
                      className="btn-delete-review-admin"
                      onClick={() => handleDeleteReview(rev.id)}
                      title="Delete review (Admin)"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        zIndex: 2
                      }}
                    >
                      <i className="fa-solid fa-trash me-1"></i> Delete
                    </button>
                  )}

                  <div className="review-card-stars">
                    {'★'.repeat(Math.min(5, Math.max(1, Math.round(rev.rating))))}
                  </div>

                  <div className="review-meta-row">
                    <span className="reviewer-name">{rev.customer_name || 'Verified Customer'}</span>
                    {rev.verified !== false && (
                      <span className="verified-badge">
                        <i className="fa-solid fa-circle-check me-1"></i>Verified Buyer
                      </span>
                    )}
                    <span className="review-date">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {rev.title && <h4 className="review-item-title">{rev.title}</h4>}
                  
                  <p className="review-item-body">{rev.review_text || rev.text}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 7. See More Reviews Button (Amazon / E-Commerce Style) */}
        {!isWritingReview && sortedReviews.length > 6 && (
          <div className="see-more-reviews-container text-center mt-4 pt-2">
            {visibleCount < sortedReviews.length ? (
              <button 
                type="button"
                className="btn-see-more-reviews" 
                onClick={() => setVisibleCount((prev) => prev + 6)}
              >
                <span>See More Reviews ({sortedReviews.length - visibleCount} remaining)</span>
                <i className="fa-solid fa-chevron-down ms-2"></i>
              </button>
            ) : (
              <button 
                type="button"
                className="btn-see-more-reviews btn-show-less" 
                onClick={() => setVisibleCount(6)}
              >
                <span>Show Less Reviews</span>
                <i className="fa-solid fa-chevron-up ms-2"></i>
              </button>
            )}
          </div>
        )}

      </div>

    </section>
  );
}
