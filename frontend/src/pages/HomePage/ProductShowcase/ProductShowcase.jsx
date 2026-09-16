import React from 'react';
import tooth_paste from '../../../assets/tooth_paste.png';
import jungleBg from '../../../assets/jungle-bg.png';
import './ProductShowcase.css';

export default function ProductShowcase() {
  return (
    <section
      className="product-showcase-section"
      style={{ backgroundImage: `url(${jungleBg})` }}
    >
      <div className="container showcase-container">

        {/* Top Text */}
        <div className="showcase-header">
          <h2>Meet Their Daily Obsession</h2>

          <p>
            Wooff Kids takes toothpaste out of the boring aisle & into the
            world of bold flavor, solid science, and designs so good you can't
            help but want us on your counter.
          </p>
        </div>

        {/* Center Product Display */}
        <div className="showcase-center">

          <div className="floating-ingredient ingredient-1">
            🍫
          </div>

          <div className="floating-ingredient ingredient-2">
            🍫
          </div>

          <div className="floating-ingredient ingredient-3">
            🍃
          </div>

          <img
            src={tooth_paste}
            alt="Wooff Choco Flavour Toothpaste"
            className="main-product-tube"
          />

        </div>

        {/* Bottom Text */}
        <div className="showcase-footer">
          <h3>The Choco Obsession</h3>

          <p>
            Dessert for breakfast, dentist-approved. We swapped the artificial
            junk for real cocoa, then supercharged it with 2%
            Nano-hydroxyapatite to actively rebuild enamel while they brush.
          </p>
        </div>

      </div>
    </section>
  );
}