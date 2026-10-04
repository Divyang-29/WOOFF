import React from 'react';
import { Link } from 'react-router-dom';
import './CleanIngredientsSection.css';

const INGREDIENTS = [
  {
    id: 'theobromine',
    name: 'Theobromine',
    desc: 'Naturally occurring cocoa compound supporting enamel mineralization and delicious flavor',
    image: '/images/ingredients/theobromine_clean.png',
  },
  {
    id: 'nhap',
    name: 'Nano-Hydroxyapatite (nHAp)',
    desc: 'Non-toxic mineral rebuilding and remineralizing 97% of tooth enamel safely without fluoride',
    image: '/images/ingredients/nhap_clean.png',
  },
  {
    id: 'calcium',
    name: 'Calcium Gluconate',
    desc: 'Bioavailable calcium building block ensuring teeth stay strong and resilient',
    image: '/images/ingredients/calcium_clean.png',
  },
  {
    id: 'inulin',
    name: 'Inulin',
    desc: 'Natural prebiotic feeding beneficial bacteria to maintain a balanced oral microbiome',
    image: '/images/ingredients/inulin_clean.png',
  },
  {
    id: 'vitaminc',
    name: 'Ascorbic Acid / Vitamin C',
    desc: 'Vital antioxidant supporting healthy, resilient gums and delicate oral tissues',
    image: '/images/ingredients/vitaminc_clean.png',
  },
  {
    id: 'lactoferrin',
    name: 'Lactoferrin',
    desc: 'Gentle antimicrobial protein maintaining oral hygiene balance around the clock',
    image: '/images/ingredients/lactoferrin_clean.png',
  },
  {
    id: 'coq10',
    name: 'Coenzyme Q10 (CoQ10)',
    desc: 'Cellular antioxidant supporting delicate gum health and soft-tissue vitality',
    image: '/images/ingredients/coq10_clean.png',
  },
];

export default function CleanIngredientsSection() {
  return (
    <section className="clean-ingredients-section">
      <div className="clean-ingredients-container">
        {/* Eyebrow Tag */}
        <div className="text-center mb-3">
          <span className="clean-ingredients-eyebrow">Clean ingredients</span>
        </div>

        {/* Headline */}
        <h2 className="clean-ingredients-headline">
          Nourish your smile the natural way
        </h2>

        {/* Desktop Botanical Grid (Hidden on mobile) */}
        <div className="clean-ingredients-grid desktop-only">
          {INGREDIENTS.map((item) => (
            <div key={item.name} className="clean-ingredient-card">
              <div className="clean-ingredient-img-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  className="clean-ingredient-img"
                  loading="lazy"
                />
              </div>
              <h3 className="clean-ingredient-title">{item.name}</h3>
              <p className="clean-ingredient-desc">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile Rotating Belt (Visible on mobile/tablet) */}
        <div className="clean-ingredients-belt-container mobile-only">
          <div className="clean-ingredients-belt-track">
            {[...INGREDIENTS, ...INGREDIENTS].map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="clean-ingredient-card belt-card">
                <div className="clean-ingredient-img-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="clean-ingredient-img"
                    loading="lazy"
                  />
                </div>
                <h3 className="clean-ingredient-title">{item.name}</h3>
                <p className="clean-ingredient-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* View Ingredients Redirect CTA */}
        <div className="clean-ingredients-cta-wrap">
          <Link to="/Ingredients" className="btn-view-ingredients">
            VIEW INGREDIENTS
          </Link>
        </div>
      </div>
    </section>
  );
}
