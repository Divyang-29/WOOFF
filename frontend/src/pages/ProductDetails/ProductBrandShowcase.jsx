import React from 'react';
import './ProductBrandShowcase.css';

export default function ProductBrandShowcase({ flavor }) {
  const isCacao = flavor?.toLowerCase().includes('choco') || flavor?.toLowerCase().includes('cacao');

  const bannerImage = isCacao
    ? 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1400&q=80'
    : 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1400&q=80';

  return (
    <section className="product-brand-showcase-section">
      
      {/* 1. Top Large Full-Width Visual Media Banner */}
      <div className="showcase-banner-card">
        <img 
          src={bannerImage} 
          alt="Wooff Natural Oral Care Ingredients" 
          className="showcase-banner-img"
        />
        <div className="showcase-banner-overlay">
          <span className="banner-tagline">100% PREBIOTIC & ENAMEL SAFE</span>
        </div>
      </div>

      {/* 2. Bottom 2-Column Founder & Mission Cards */}
      <div className="showcase-story-grid">
        
        {/* Left Card: Our Founder */}
        <div className="story-card founder-card">
          <span className="story-eyebrow">Meet Dr. Shrushti</span>
          <h3 className="story-card-title">Our Founder</h3>
          <p className="story-card-desc">
            Wooff founder Dr. Shrushti Bhankhariya is a pediatric dental specialist. She created Wooff because she knew there was a better, safer way to give kids healthy smiles without tantrums and tears.
          </p>
          <div className="story-icon-footer">
            <div className="icon-circle">
              <i className="fa-solid fa-user-doctor"></i>
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
