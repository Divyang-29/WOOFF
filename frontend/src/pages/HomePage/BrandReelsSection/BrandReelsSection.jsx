import React, { useState, useEffect, useRef } from 'react';
import './BrandReelsSection.css';

// Default asset for video playback fallback
import jungleLoopVideo from '../../../assets/jungle-loop.mp4';
import toothPasteImg from '../../../assets/tooth_paste.png';

export default function BrandReelsSection() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutedStates, setMutedStates] = useState({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);

  // Fetch live video reels directly from backend endpoint /api/videos
  useEffect(() => {
    let isMounted = true;

    const fetchReels = async () => {
      try {
        const res = await fetch('/api/videos');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const rawList = data?.videos || (Array.isArray(data) ? data : []);

        if (isMounted && rawList.length > 0) {
          const formatted = rawList.map((item, idx) => ({
            id: item.id || idx + 1,
            video_url: item.video_url || jungleLoopVideo,
            caption: item.caption || item.product_name || 'Brush with Wooff!',
            author: item.author || '@wooffkids',
            product_name: item.product_name || 'Wooff Toothpaste',
            product_photo: item.product_photo || toothPasteImg,
            price: item.price || 349,
            rating: item.rating || '5.0 ★',
            reviews_count: item.reviews_count || '1k+',
            product_slug: item.product_slug || 'wooff-toothpaste',
          }));
          setReels(formatted);
          setLoading(false);
        } else if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching reels from /api/videos:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReels();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update scroll arrow active states
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => el.removeEventListener('scroll', checkScrollPosition);
    }
  }, [reels]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const toggleMute = (reelId) => {
    setMutedStates((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }));
  };

  return (
    <section className="brand-reels-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="brand-reels-header d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
          <div className="header-text-group">
            <span className="reels-pill-badge">✦ THIS IS WOOFF</span>
            <h2 className="reels-title mt-2">See It In Action</h2>
            <p className="reels-subtitle mb-0">
              Watch real parents and happy brushers ditch the morning drama for dentist-approved cocoa science.
            </p>
          </div>

          {/* Slider Arrow Controls */}
          <div className="reels-nav-controls d-none d-md-flex align-items-center gap-2">
            <button
              className={`reels-arrow-btn ${!canScrollLeft ? 'disabled' : ''}`}
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous reels"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className={`reels-arrow-btn ${!canScrollRight ? 'disabled' : ''}`}
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Next reels"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Multi-Card Video Reels Slider */}
        <div className="reels-slider-track reels-container" ref={scrollContainerRef}>
          {loading && reels.length === 0 ? (
            <div className="text-center py-5 w-100">
              <p>Loading brand reels...</p>
            </div>
          ) : (
            reels.map((reel) => {
              const isMuted = mutedStates[reel.id] !== false; // default true (muted)

              return (
                <div key={reel.id} className="reel-card">
                  
                  {/* Background Looping Video */}
                  <video
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="reel-video"
                    onError={(e) => {
                      if (e.target.src !== jungleLoopVideo) {
                        e.target.src = jungleLoopVideo;
                      }
                    }}
                  >
                    <source src={reel.video_url} type="video/mp4" />
                  </video>

                  {/* Top Card Badges */}
                  <div className="reel-top-bar d-flex justify-content-between align-items-center">
                    <span className="reel-author-tag">{reel.author}</span>
                    <button
                      className="reel-sound-btn"
                      onClick={() => toggleMute(reel.id)}
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                          <line x1="12" y1="19" x2="12" y2="23"></line>
                          <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Bottom Overlay Info & Product Badge */}
                  <div className="reel-overlay-content">
                    
                    {/* Caption */}
                    <p className="reel-caption">{reel.caption}</p>

                    {/* Floating Product Card */}
                    <div className="reel-product-card">
                      <div className="reel-product-thumb">
                        <img src={reel.product_photo} alt={reel.product_name} />
                      </div>
                      
                      <div className="reel-product-details">
                        <div className="reel-product-title">{reel.product_name}</div>
                        <div className="reel-product-meta">
                          <span className="reel-product-price">₹{reel.price}</span>
                          <span className="reel-product-rating">{reel.rating}</span>
                        </div>
                      </div>

                      <button className="reel-product-action-btn" title="View Product" aria-label="View product">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
