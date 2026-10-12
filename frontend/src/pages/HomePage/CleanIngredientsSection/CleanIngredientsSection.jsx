import React from 'react';
import { Link } from 'react-router-dom';
import './CleanIngredientsSection.css';

const INGREDIENTS = [
  {
    id: 'nhap',
    name: 'Nano-Hydroxyapatite',
    category: 'Enamel Mineral Support',
    desc: 'A biomimetic mineral that closely resembles the mineral naturally found in teeth. It helps support enamel remineralization.',
    image: '/images/ingredients/nhap_clean.webp',
  },
  {
    id: 'theobromine',
    name: 'Theobromine',
    category: 'Enamel Strength Support',
    desc: 'Derived from cocoa, theobromine has been studied for its potential to support enamel remineralization',
    image: '/images/ingredients/theobromine_clean.webp',
  },
  {
    id: 'inulin',
    name: 'Inulin',
    category: 'Prebiotic Oral Care',
    desc: 'A naturally derived prebiotic included to support a balanced oral environment and complement the oral microbiome.',
    image: '/images/ingredients/inulin_clean.webp',
  },
  {
    id: 'vitaminc',
    name: 'Vitamin C',
    category: 'Antioxidant & Gum Support',
    desc: 'Vitamin C is an antioxidant that contributes to the health of oral tissues and supports a healthy gum environment.',
    image: '/images/ingredients/vitaminc_clean.webp',
  },
  {
    id: 'lactoferrin',
    name: 'Lactoferrin',
    category: 'Natural Oral Defence',
    desc: 'A naturally occurring protein found in saliva, lactoferrin has antimicrobial properties.',
    image: '/images/ingredients/lactoferrin_clean.webp',
  },
  {
    id: 'coq10',
    name: 'Coenzyme Q10',
    category: 'Antioxidant Gum Care',
    desc: 'A naturally occurring antioxidant that has been studied in periodontal care.',
    image: '/images/ingredients/coq10_clean.webp',
  },
  {
    id: 'calcium',
    name: 'Calcium Gluconate',
    category: 'Tooth Enamel Support',
    desc: 'Calcium is an essential building block of tooth enamel.',
    image: '/images/ingredients/calcium_clean.webp',
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
              <span className="clean-ingredient-category">{item.category}</span>
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
                <span className="clean-ingredient-category">{item.category}</span>
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
