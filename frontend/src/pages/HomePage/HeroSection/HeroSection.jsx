import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;

/**
 * Generates frame file path with 4-digit zero-padding.
 * Matches assets in /frames/frame_0001.png to /frames/frame_0240.png
 */
const getFramePath = (index) => {
  const paddedIndex = String(index + 1).padStart(4, '0');
  return `/frames/frame_${paddedIndex}.png`;
};

export default function HeroSection() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Render frame onto the canvas using object-fit: cover logic
   */
  const renderFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const img = imagesRef.current[index];
    if (img && img.complete && img.naturalWidth > 0) {
      // Simulate CSS object-fit: cover
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

  /**
   * Resize canvas to viewport with High-DPI support
   */
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

  // 1. Asynchronously preload ALL 150 frames into memory before starting animation
  useEffect(() => {
    let loadedCount = 0;
    const preloadedImages = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();

      const onImageFinished = () => {
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));

        // When all 150 frames are fully preloaded, enable the experience
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = preloadedImages;
          setIsLoaded(true);
        }
      };

      img.onload = onImageFinished;
      img.onerror = onImageFinished;
      img.src = getFramePath(i);
      preloadedImages.push(img);
    }
    imagesRef.current = preloadedImages;
  }, []);

  // 2. Window resize listener
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // 3. GSAP ScrollTrigger Scrub Timeline
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !canvasRef.current) return;

    handleResize();
    renderFrame(0);

    const ctx = gsap.context(() => {
      const frameObj = { frame: 0 };

      // Master Timeline tied to 400vh container scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      });

      // Canvas Frame Scrub Animation (0 -> 149)
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
      {/* Preloader Overlay */}
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

      {/* Sticky Canvas Viewport (100% clear with zero overlays or blurs) */}
      <div className="position-sticky top-0 vh-100 w-100 overflow-hidden d-flex align-items-center justify-content-center">
        {/* The 3D Scroll Canvas */}
        <canvas
          ref={canvasRef}
          className="position-absolute top-0 start-0 w-100 h-100 d-block pe-none"
        />

        {/* Scroll Down Prompt */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 z-2 d-flex flex-column align-items-center pe-none opacity-75">
          <span
            className="text-uppercase fw-medium mb-2"
            style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              color: '#8C7B6A',
            }}
          >
            Scroll to discover
          </span>
          <div
            className="d-flex justify-content-center p-1"
            style={{
              width: '20px',
              height: '36px',
              borderRadius: '20px',
              border: '2px solid rgba(122, 78, 45, 0.4)',
            }}
          >
            <div
              className="hero-scroll-dot"
              style={{
                width: '6px',
                height: '8px',
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
