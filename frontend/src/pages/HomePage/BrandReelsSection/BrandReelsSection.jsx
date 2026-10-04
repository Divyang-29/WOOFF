import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../../context/CartContext';
import './BrandReelsSection.css';

// Default asset for video playback fallback
import jungleLoopVideo from '../../../assets/jungle-loop.mp4';
import toothPasteImg from '../../../assets/tooth_paste.png';

// Fallback video reels if API is empty or offline
const FALLBACK_REELS = [
  {
    id: 1,
    product_id: 1,
    video_url: jungleLoopVideo,
    caption: 'No more morning brushing battles with real cocoa! 🍫✨',
    author: '@wooffkids',
    product_name: 'Wooff Choco Toothpaste',
    product_photo: toothPasteImg,
    price: 349,
    rating: '5.0 ★',
    reviews_count: '2.4k',
    product_slug: 'wooff-choco-toothpaste',
  },
  {
    id: 2,
    product_id: 2,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-little-girl-brushing-her-teeth-in-the-bathroom-43956-large.mp4',
    caption: 'Powered by 2% Nano-HAp to remineralize enamel daily 🦷🛡️',
    author: '@dr_sarah_pediatric',
    product_name: 'Nano-HAp Kids Formula',
    product_photo: toothPasteImg,
    price: 399,
    rating: '4.9 ★',
    reviews_count: '1.8k',
    product_slug: 'nano-hap-kids-formula',
  },
  {
    id: 3,
    product_id: 3,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-mother-and-daughter-brushing-their-teeth-41584-large.mp4',
    caption: 'Safe if swallowed & 100% toxin-free ingredients 🍃',
    author: '@natural_mom_life',
    product_name: 'Microbiome Friendly Gel',
    product_photo: toothPasteImg,
    price: 349,
    rating: '5.0 ★',
    reviews_count: '950',
    product_slug: 'microbiome-friendly-gel',
  },
  {
    id: 4,
    product_id: 1,
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-happy-boy-brushing-his-teeth-at-home-43957-large.mp4',
    caption: 'Dessert for breakfast, dentist approved every time! 🚀',
    author: '@happy_brushers_club',
    product_name: 'Wooff Morning Choco Set',
    product_photo: toothPasteImg,
    price: 649,
    rating: '5.0 ★',
    reviews_count: '3.1k',
    product_slug: 'wooff-morning-choco-set',
  },
];

export default function BrandReelsSection() {
  const { addToCart } = useCart();
  const [reels, setReels] = useState(FALLBACK_REELS);
  const [loading, setLoading] = useState(true);
  const [mutedStates, setMutedStates] = useState({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);
  const videoRefs = useRef({});

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
            product_id: item.product_id || item.id || idx + 1,
            video_url: item.video_url || jungleLoopVideo,
            caption: item.caption || item.product_name || 'Brush with Wooff!',
            author: item.author || '@wooffkids',
            product_name: item.product_name || 'Wooff Toothpaste',
            product_photo: item.product_photo || toothPasteImg,
            price: item.price !== undefined ? item.price : 349,
            rating: item.rating || '5.0 ★',
            reviews_count: item.reviews_count || '1k+',
            product_slug: item.product_slug || 'wooff-toothpaste',
          }));
          setReels(formatted);
        } else if (isMounted) {
          setReels(FALLBACK_REELS);
        }
      } catch (error) {
        console.error('Error fetching reels from /api/videos:', error);
        if (isMounted) {
          setReels(FALLBACK_REELS);
        }
      } finally {
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

  // Sync muted property directly on HTML5 video elements whenever mutedStates updates
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((id) => {
      const videoEl = videoRefs.current[id];
      if (videoEl) {
        const isMuted = mutedStates[id] !== false; // default true
        videoEl.muted = isMuted;
      }
    });
  }, [mutedStates]);

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

  const toggleMute = (reelId, e) => {
    if (e) {
      e.stopPropagation();
    }

    const videoEl = videoRefs.current[reelId];
    const isCurrentlyMuted = mutedStates[reelId] !== false; // default is true (muted)
    const nextMuted = !isCurrentlyMuted;

    if (videoEl) {
      videoEl.muted = nextMuted;
      if (!nextMuted) {
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log('Video play error on unmute:', err);
          });
        }
      }
    }

    setMutedStates((prev) => ({
      ...prev,
      [reelId]: nextMuted,
    }));
  };

  const handleAddToCart = (reel, e) => {
    if (e) {
      e.stopPropagation();
    }
    const productPayload = {
      id: reel.product_id || reel.id,
      product_id: reel.product_id || reel.id,
      title: reel.product_name,
      price: reel.price,
      final_price: reel.price,
      primary_image: reel.product_photo,
      slug: reel.product_slug,
    };
    addToCart(productPayload, 1);
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
                <div 
                  key={reel.id} 
                  className="reel-card"
                  onClick={(e) => toggleMute(reel.id, e)}
                >
                  
                  {/* Background Looping Video */}
                  <video
                    ref={(el) => (videoRefs.current[reel.id] = el)}
                    src={reel.video_url}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="reel-video"
                    onError={(e) => {
                      if (!e.target.src.includes('jungle-loop')) {
                        e.target.src = jungleLoopVideo;
                        e.target.load();
                      }
                    }}
                  />

                  {/* Top Card Badges */}
                  <div className="reel-top-bar d-flex justify-content-between align-items-center">
                    <span className="reel-author-tag">{reel.author}</span>
                    <button
                      type="button"
                      className="reel-sound-btn"
                      onClick={(e) => toggleMute(reel.id, e)}
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                      title={isMuted ? 'Click to Unmute Sound' : 'Click to Mute Sound'}
                    >
                      {isMuted ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <line x1="23" y1="9" x2="17" y2="15"></line>
                          <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Bottom Overlay Info & Product Badge */}
                  <div className="reel-overlay-content">
                    
                    {/* Caption */}
                    <p className="reel-caption">{reel.caption}</p>

                    {/* Floating Product Card */}
                    <div 
                      className="reel-product-card"
                      onClick={(e) => e.stopPropagation()}
                    >
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

                      <button 
                        type="button"
                        className="reel-product-action-btn" 
                        title="Add to Cart" 
                        aria-label="Add product to cart"
                        onClick={(e) => handleAddToCart(reel, e)}
                      >
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
