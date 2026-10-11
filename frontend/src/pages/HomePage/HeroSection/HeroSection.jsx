import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;

// UPDATED: Now accepts an isMobile boolean to switch folders
const getFramePath = (index, isMobile) => {
  const paddedIndex = String(index + 1).padStart(4, '0');
  const folder = isMobile ? 'frames-mobile' : 'frames';
  return `/${folder}/frame_${paddedIndex}.png`;
};

export default function HeroSection() {
  const containerRef = useRef(null);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const renderFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Use requested frame, or fallback to closest loaded frame
    let img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let j = index - 1; j >= 0; j--) {
        if (imagesRef.current[j]?.complete && imagesRef.current[j]?.naturalWidth > 0) {
          img = imagesRef.current[j];
          break;
        }
      }
      if (!img || !img.complete || img.naturalWidth === 0) {
        img = imagesRef.current[0];
      }
    }

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.clearRect(0, 0, width, height);
      const hRatio = width / img.naturalWidth;
      const vRatio = height / img.naturalHeight;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (width - img.naturalWidth * ratio) / 2;
      const centerShiftY = (height - img.naturalHeight * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        img.naturalWidth,
        img.naturalHeight,
        centerShiftX,
        centerShiftY,
        img.naturalWidth * ratio,
        img.naturalHeight * ratio
      );
    }
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const preloadedImages = new Array(TOTAL_FRAMES);

    // 1. Load the first frame immediately so the user sees the hero image instantly
    const firstFrame = new Image();
    firstFrame.src = getFramePath(0, isMobile);

    firstFrame.onload = () => {
      preloadedImages[0] = firstFrame;
      imagesRef.current = preloadedImages;
      setIsLoaded(true);
      setLoadingProgress(100);
      renderFrame(0);

      // 2. Start fetching the other 239 frames AFTER the first one is ready
      // Using requestIdleCallback ensures this doesn't freeze the main thread
      const scheduleIdle =
        typeof window !== 'undefined' && window.requestIdleCallback
          ? window.requestIdleCallback.bind(window)
          : (cb) => setTimeout(cb, 50);

      scheduleIdle(() => {
        for (let i = 1; i < TOTAL_FRAMES; i++) {
          const img = new Image();
          img.src = getFramePath(i, isMobile);
          preloadedImages[i] = img;
        }
        imagesRef.current = preloadedImages;
      });
    };

    firstFrame.onerror = () => {
      setIsLoaded(true);
    };
  }, [renderFrame]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !canvasRef.current || !viewportRef.current) return;

    handleResize();
    renderFrame(0);

    const ctx = gsap.context(() => {
      const frameObj = { frame: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: viewportRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      });

      tl.to(
        frameObj,
        {
          frame: TOTAL_FRAMES - 1,
          ease: 'none',
          onUpdate: () => {
            const frameIndex = Math.min(
              TOTAL_FRAMES - 1,
              Math.max(0, Math.round(frameObj.frame))
            );
            currentFrameRef.current = frameIndex;
            renderFrame(frameIndex);
          },
          duration: 1,
        },
        0
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [isLoaded, handleResize, renderFrame]);

  return (
    <div
      ref={containerRef}
      className="position-relative w-100"
      style={{
        height: '400vh',
        backgroundColor: '#F7EFE6',
        color: '#2A1C13',
      }}
    >
      {!isLoaded && (
        <div
          className="position-fixed top-0 start-0 w-100 vh-100 z-3 d-flex flex-column align-items-center justify-content-center"
          style={{
            backgroundColor: '#F7EFE6',
            transition: 'opacity 0.5s ease',
          }}
        >
          <div className="text-center" style={{ width: '260px' }}>
            <h2
              className="fs-2 fw-bold text-uppercase mb-3"
              style={{
                color: '#4B2E1E',
                letterSpacing: '0.2em',
              }}
            >
              Wooff
            </h2>
            <div
              className="progress w-100 mb-2"
              role="progressbar"
              aria-label="Loading Experience"
              aria-valuenow={loadingProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ height: '6px', backgroundColor: '#F2E4D6' }}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${loadingProgress}%`,
                  backgroundImage: 'linear-gradient(to right, #e58b57, #F7C8A5)',
                  backgroundColor: '#e58b57',
                  transition: 'width 0.15s ease-out',
                }}
              />
            </div>
            <p
              className="small font-monospace mb-0"
              style={{ color: '#8C7B6A', fontSize: '0.75rem' }}
            >
              Loading Experience {loadingProgress}%
            </p>
          </div>
        </div>
      )}

      <div
        ref={viewportRef}
        className="top-0 vh-100 w-100 overflow-hidden d-flex align-items-center justify-content-center"
      >
        <canvas
          ref={canvasRef}
          className="position-absolute top-0 start-0 w-100 h-100 d-block pe-none"
        />

        {/* Scroll Indicator */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 text-center pe-none opacity-75">
          <span
            className="d-block text-uppercase fw-semibold mb-1"
            style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              color: '#5C4D40',
            }}
          >
            Scroll to discover
          </span>
          <div
            className="d-inline-flex justify-content-center p-1"
            style={{
              width: '18px',
              height: '32px',
              borderRadius: '16px',
              border: '2px solid rgba(122, 78, 45, 0.4)',
            }}
          >
            <div
              className="hero-scroll-dot"
              style={{
                width: '5px',
                height: '7px',
                backgroundColor: '#4B2E1E',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}