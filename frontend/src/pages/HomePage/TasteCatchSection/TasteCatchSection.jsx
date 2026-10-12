import React from 'react';
import './TasteCatchSection.css';
import chocolateImg from '../../../assets/chocolate_clean.webp';
import mintImg from '../../../assets/mint_clean.webp';

export default function TasteCatchSection() {
  return (
    <section className="taste-catch-section" aria-label="Why kids won't eat chocolate toothpaste">
      <div className="taste-catch-container">
        
        {/* Left Side: Chocolate Illustration */}
        <div className="taste-catch-side taste-catch-side--left">
          <div className="taste-catch-img-wrap">
            <img 
              src={chocolateImg} 
              alt="Rich chocolate pieces" 
              className="taste-catch-img"
              loading="lazy"
            />
          </div>
          <div className="taste-catch-pill taste-catch-pill--choco">
            <span className="pill-emoji">🍫</span> Tastes Like Chocolate
          </div>
        </div>

        {/* Center: The Core Paradox & Solution */}
        <div className="taste-catch-center">
          <h2 className="taste-catch-question">
            &ldquo;If it tastes like chocolate, won&rsquo;t my child just eat it?&rdquo;
          </h2>

          <div className="taste-catch-answer-wrap">
            <span className="taste-catch-deco-quote taste-catch-deco-quote--open">&ldquo;</span>
            <p className="taste-catch-answer">
              You might think kids will want to eat the toothpaste, but{' '}
              <span className="highlight-catch">here&rsquo;s the catch:</span> the{' '}
              <span className="highlight-mint">minty taste</span> makes it less appealing to eat and more enjoyable to brush with! 🪥🌿
            </p>
            <span className="taste-catch-deco-quote taste-catch-deco-quote--close">&rdquo;</span>
          </div>
        </div>

        {/* Right Side: Fresh Mint Illustration */}
        <div className="taste-catch-side taste-catch-side--right">
          <div className="taste-catch-img-wrap">
            <img 
              src={mintImg} 
              alt="Fresh natural mint leaves" 
              className="taste-catch-img"
              loading="lazy"
            />
          </div>
          <div className="taste-catch-pill taste-catch-pill--mint">
            <span className="pill-emoji">🌿</span> Fresh Like Mint
          </div>
        </div>

      </div>
    </section>
  );
}
