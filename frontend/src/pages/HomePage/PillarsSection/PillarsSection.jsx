import React, { useState, useEffect } from 'react';
import './PillarsSection.css';

export default function PillarsSection() {
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPillars = async () => {
      try {
        const response = await fetch('/api/pillars');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : data?.pillars || data?.data || [];

        if (isMounted) {
          setPillars(list);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching pillars from /api/pillars:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPillars();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && pillars.length === 0) {
    return null;
  }

  return (
    <section className="pillars-section py-5">
      <div className="container">
        <div className="text-center max-w-700 mx-auto mb-4 mb-md-5">
          <span className="section-mini-tag">OUR FORMULATION PILLARS</span>
          <h2 className="section-title mt-2">10 Principles of Biological Oral Care</h2>
          <p className="section-subtitle">
            Every single drop in our formula is intentionally chosen to work with the body’s natural physiology.
          </p>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="d-flex d-md-none justify-content-center align-items-center gap-2 mb-3 mobile-swipe-hint">
          <span>Swipe to explore principles</span>
          <span className="swipe-arrow">→</span>
        </div>

        <div className="row g-4 justify-content-center pillars-grid-container">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="col-md-6 col-lg-4 col-xl-2-4 pillar-col">
              <div className="pillar-card h-100">
                <div className="pillar-icon-box">
                  <i className={pillar.icon}></i>
                </div>
                <h4 className="pillar-title">{pillar.title}</h4>
                <p className="pillar-desc">{pillar.desc || pillar.desc_text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

