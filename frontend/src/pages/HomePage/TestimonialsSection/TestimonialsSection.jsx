import React, { useState, useEffect, useCallback } from 'react';
import './TestimonialsSection.css';

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    rating: 5,
    text: "Wooff has completely eliminated the morning brushing drama with my 4-year-old. The natural chocolate taste is incredible!",
    author: "Sarah Jenkins",
  },
  {
    id: 2,
    rating: 5,
    text: "As a pediatric biological dentist, finding a 100% toxin-free toothpaste with 2% Nano-hydroxyapatite and prebiotic microbiome support is extraordinary. Wooff sets a new benchmark for kids oral care.",
    author: "Dr. Julian Vance, DDS",
  },
  {
    id: 3,
    rating: 5,
    text: "Finally a toothpaste that is safe if swallowed and actually keeps their teeth cavity-free. My kids ask to brush their teeth now!",
    author: "Maya Patel",
  },
  {
    id: 4,
    rating: 5,
    text: "No harsh chemicals, SLS, or artificial dyes. My twins love the cocoa flavor and their dentist gave them 5 stars at our last checkup.",
    author: "David Miller",
  },
  {
    id: 5,
    rating: 5,
    text: "The prebiotic formula is a game changer for fresh breath and natural oral flora protection.",
    author: "Priya Sharma",
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Fetch dynamic testimonials directly from backend endpoint /api/testimonials
  useEffect(() => {
    let isMounted = true;

    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const rawList = Array.isArray(data)
          ? data
          : data?.testimonials || data?.data || [];

        if (isMounted && rawList.length > 0) {
          const formatted = rawList.map((item, idx) => ({
            id: item.id || idx + 1,
            rating: Number(item.rating) || 5,
            text:
              item.text ||
              item.testimonial ||
              item.review ||
              item.quote ||
              item.content ||
              '',
            author:
              item.author ||
              item.author_name ||
              item.name ||
              'Wooff Community Member',
          }));
          setTestimonials(formatted);
        } else if (isMounted) {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      } catch (error) {
        console.error('Error fetching testimonials from /api/testimonials:', error);
        if (isMounted) {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  // Automatic carousel timer so reviews cycle on their own
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const autoPlayTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(autoPlayTimer);
  }, [testimonials.length]);

  const totalReviews = testimonials.length;
  const safeIndex = totalReviews > 0 ? currentIndex % totalReviews : 0;
  const current = testimonials[safeIndex] || {
    id: 1,
    rating: 5,
    text: '',
    author: 'Wooff Community Member',
  };
  const currentReview = current;

  // Cycling navigation controls
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalReviews - 1 : prev - 1));
  }, [totalReviews]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalReviews - 1 ? 0 : prev + 1));
  }, [totalReviews]);

  // Touch swipe support for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Keyboard navigation support
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Generate initial avatar from author name
  const authorInitial = current.author
    ? current.author.trim().charAt(0).toUpperCase()
    : 'W';

  const ratingCount = Math.min(5, Math.max(1, Math.round(Number(current.rating) || 5)));

  return (
    <section
      className="testimonials-section"
      aria-label="Customer Testimonials"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="container">
        {/* Section Heading */}
        <div className="testimonials-header text-center">
          <div className="testimonials-badge">
            <i className="fas fa-heart"></i>
            <span>Real Smiles & Stories</span>
          </div>
          <h2 className="testimonials-title">Hear it From Parents, Dentists & Kids.</h2>
          <p className="testimonials-subtitle">
            What parents, pediatric dentists, and happy little brushers have to say about Wooff.
          </p>
        </div>

        {/* Carousel / Navigation Controls & Brutalist Card */}
        <div
          className="testimonials-carousel-wrapper"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Left Circular Arrow Button */}
          <button
            type="button"
            className="testimonial-nav-btn testimonial-prev-btn"
            onClick={handlePrev}
            aria-label="Previous testimonial"
            disabled={totalReviews <= 1}
          >
            <i className="fas fa-arrow-left"></i>
          </button>

          {/* Brutalist Style Card */}
          <article className="testimonial-card testimonial-brutalist-card">
            {loading && totalReviews === 0 ? (
              <div className="testimonial-content text-center py-5">
                <p>Loading testimonials...</p>
              </div>
            ) : (
              <div key={current.id || safeIndex} className="testimonial-content">
                {/* Card Top Row: Rating stars & verified status */}
                <div className="testimonial-card-top">
                  <div
                    className="testimonial-stars"
                    aria-label={`Rating: ${ratingCount} out of 5 stars`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className="fas fa-star"
                        style={{
                          color: i < ratingCount ? '#e58b57' : '#D9C8B8',
                        }}
                      ></i>
                    ))}
                  </div>

                  <span className="testimonial-verified-badge verified-badge review-badge">
                    <i className="fas fa-check-circle"></i>
                    <span>Verified Review</span>
                  </span>
                </div>

                {/* Italicized Quote */}
                <p className="testimonial-quote">&ldquo;{current.text}&rdquo;</p>

                {/* Author's Name & Details */}
                <div className="testimonial-author-row">
                  <div className="testimonial-author-info">
                    <div className="testimonial-author-avatar" aria-hidden="true">
                      {authorInitial}
                    </div>
                    <div>
                      <h3 className="testimonial-author-name">
                        {currentReview.author}
                      </h3>
                      <p className="testimonial-author-tag">
                        Wooff Verified Customer
                      </p>
                    </div>
                  </div>

                  <div className="testimonial-counter-pill" aria-label={`Review ${safeIndex + 1} of ${totalReviews}`}>
                    {String(safeIndex + 1).padStart(2, '0')} / {String(totalReviews).padStart(2, '0')}
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Right Circular Arrow Button */}
          <button
            type="button"
            className="testimonial-nav-btn testimonial-next-btn"
            onClick={handleNext}
            aria-label="Next testimonial"
            disabled={totalReviews <= 1}
          >
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        {/* Indicator dots for direct navigation */}
        {totalReviews > 1 && (
          <div
            className="testimonials-dots-container"
            role="tablist"
            aria-label="Testimonial pagination"
          >
            {testimonials.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                role="tab"
                aria-selected={idx === safeIndex}
                aria-label={`Go to review ${idx + 1}`}
                className={`testimonial-dot ${idx === safeIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
