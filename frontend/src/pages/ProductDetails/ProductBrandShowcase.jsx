import React from 'react';
import './ProductBrandShowcase.css';

export default function ProductBrandShowcase() {
  return (
    <section className="product-brand-showcase-section">
      
      {/* 1. Top Large Full-Width Visual Media Banner - Hidden for right now as requested */}

      {/* 2. Bottom 2-Column Founder & Mission Cards */}
      <div className="showcase-story-grid">
        
        {/* Left Card: Our Founder */}
        <div className="story-card founder-card">
          <span className="story-eyebrow">Meet Dr. Shrushti</span>
          <h3 className="story-card-title">Our Founder</h3>
          <p className="story-card-desc">
            &ldquo;As a dentist, I saw how something as essential as brushing became a daily struggle for parents and kids. I created Wooff Kids to turn brushing battles into joyful moments with flavours kids love and thoughtfully formulated oral care that parents can trust.&rdquo;
          </p>
          <div className="founder-card-author">
            <div className="founder-avatar-wrap">
              <img 
                src="/images/dr-shrushti-avatar.webp" 
                alt="Dr. Shrushti Bhankhariya" 
                className="founder-avatar-img" 
                loading="lazy"
              />
            </div>
            <div className="founder-author-text">
              <h4 className="founder-author-name">Dr. Shrushti Bhankhariya</h4>
              <span className="founder-author-role">Dentist &amp; Founder</span>
            </div>
          </div>
          <div className="story-icon-footer">
            <div className="icon-circle">
              <i className="fa-solid fa-tooth"></i>
            </div>
          </div>
        </div>

        {/* Right Card: Our Mission */}
        <div className="story-card mission-card">
          <span className="story-eyebrow">Backed by research</span>
          <h3 className="story-card-title">Our Mission</h3>
          <p className="story-card-desc">
            Create brighter smiles, stronger teeth, and happier mornings with all-natural, non-toxic ingredients. Your child’s oral microbiome is a critical piece of overall health, and the right toothpaste makes all the difference.
          </p>
          <div className="story-icon-footer">
            <div className="icon-circle">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
