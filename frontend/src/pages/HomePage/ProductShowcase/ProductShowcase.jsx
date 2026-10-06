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
          <h2>  The Toothpaste Kids Want.
            <br />
            The Science Moms Trust.</h2>

        
        </div>

        {/* Center Product Display */}
        <div className="showcase-center">

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
            Unique flavour. Thoughtful ingredients.
            <br />
            Dentist-made oral care designed to turn brushing from a daily battle into a routine kids actually enjoy
          </p>
        </div>

      </div>
    </section>
  );
}