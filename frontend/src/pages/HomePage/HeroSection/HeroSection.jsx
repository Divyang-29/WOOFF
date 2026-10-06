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

    ctx.clearRect(0, 0, width, height);

    const img = imagesRef.current[index];
    if (img && img.complete && img.naturalWidth > 0) {
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
    // UPDATED: Check device width once on initial load
    const isMobile = window.innerWidth <= 768;
    let loadedCount = 0;
    const preloadedImages = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();

      const onImageFinished = () => {
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));

        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = preloadedImages;
          setIsLoaded(true);
        }
      };

      img.onload = onImageFinished;
      img.onerror = onImageFinished;

      // UPDATED: Pass the isMobile flag to fetch from the correct folder
      img.src = getFramePath(i, isMobile);
      preloadedImages.push(img);
    }
    imagesRef.current = preloadedImages;
  }, []); // Empty dependency array ensures this heavy fetch only runs once on mount

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