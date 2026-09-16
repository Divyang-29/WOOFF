import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './DiscoverySection.css';

gsap.registerPlugin(ScrollTrigger);

export default function DiscoverySection() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgRef.current,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className="discovery-section" ref={sectionRef}>
      {/* The moving background layer */}
      <div className="discovery-parallax-bg" ref={bgRef}></div>

      <div className="container position-relative z-1">
        <div className="discovery-card row align-items-center">
          <div className="col-md-6 order-2 order-md-1 discovery-text p-4 p-md-5">
            <h2>No More Brushing Battles</h2>
            <p>
              Who knew healthy teeth could taste like dessert? Our signature Chocolate flavor makes brushing feel like a daily treat, without any of the sugar or toxic junk. Finally, a toothpaste your kids will actually ask to use.
            </p>
            <button className="btn-wooff-primary">Grab a Tube</button>
          </div>
          <div className="col-md-6 order-1 order-md-2 discovery-image p-4 text-center pb-0 pb-md-4">
            {/* Placeholder for the product image */}
            <img
              src="https://placehold.co/600x400/F7EFE6/4B2E1E?text=Choco+Tube+Mockup"
              alt="Wooff Chocolate Toothpaste"
              className="img-fluid"
/>
          </div>
        </div>
      </div>
    </section>
  );
}
