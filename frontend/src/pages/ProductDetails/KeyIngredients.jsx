import React from 'react';
import { Link } from 'react-router-dom';
import './ProductDetails.css';

export const defaultKeyIngredients = [
  {
    id: 'theobromine',
    title: 'Theobromine',
    subtitle: 'Enamel Mineralization',
    description: 'Supports enamel mineralization and may help strengthen tooth structure along with nHAp.',
    image_url: '/images/ingredients/cacao.jpg'
  },
  {
    id: 'nhap',
    title: 'Nano-Hydroxyapatite',
    subtitle: 'Remineralizing Agent',
    description: 'Remineralizing ingredient; helps replenish minerals and support enamel.',
    image_url: '/images/ingredients/nhap.jpg'
  },
  {
    id: 'calcium-gluconate',
    title: 'Calcium Gluconate',
    subtitle: 'Mineral Availability',
    description: 'Calcium source; supports mineral availability for teeth.',
    image_url: '/images/ingredients/calcium.jpg'
  },
  {
    id: 'inulin',
    title: 'Inulin',
    subtitle: 'Prebiotic Support',
    description: 'Prebiotic; supports a healthier oral microbial environment.',
    image_url: '/images/ingredients/inulin.jpg'
  },
  {
    id: 'ascorbic-acid',
    title: 'Ascorbic Acid / Vitamin C',
    subtitle: 'Antioxidant Care',
    description: 'Antioxidant; supports healthy gums and oral tissues.',
    image_url: '/images/ingredients/vitaminc.jpg'
  },
  {
    id: 'lactoferrin',
    title: 'Lactoferrin',
    subtitle: 'Antimicrobial Protein',
    description: 'Antimicrobial protein; helps support oral hygiene and microbial balance.',
    image_url: '/images/ingredients/lactoferrin.jpg'
  },
  {
    id: 'coq10',
    title: 'Coenzyme Q10',
    subtitle: 'Gum Health Support',
    description: 'Antioxidant; commonly used to support gum health.',
    image_url: '/images/ingredients/coq10.jpg'
  }
];

export default function KeyIngredients({ 
  ingredients, 
  maxDisplay = 6, 
  showViewAll = true,
  title = "Our first-of-its-kind formula is backed by clinical research. Here’s what goes into it:",
  badgeText = "Key Ingredients"
}) {
  const items = (ingredients && ingredients.length > 0) ? ingredients : defaultKeyIngredients;
  const displayItems = maxDisplay ? items.slice(0, maxDisplay) : items;

  return (
    <div className="ingredients-wooff-section">
      <div className="ingredients-wooff-header">
        {badgeText && <span className="ingredients-pill-badge">{badgeText}</span>}
        {title && <h2 className="ingredients-main-title">{title}</h2>}
      </div>

      <div className="ingredients-wooff-grid">
        {displayItems.map((ing) => (
          <div key={ing.id || ing.title} className="ingredient-wooff-card">
            <div className="ingredient-card-text">
              <h3 className="ingredient-card-title">{ing.title}</h3>
              <div className="ingredient-card-subtitle">{ing.subtitle || ing.sub_title}</div>
              <p className="ingredient-card-description">{ing.description}</p>
            </div>
            {(ing.image_url || ing.icon) && (
              <div className="ingredient-card-image-wrap">
                <img src={ing.image_url || ing.icon} alt={ing.title} className="ingredient-card-icon" />
              </div>
            )}
          </div>
        ))}
      </div>

      {showViewAll && (
        <div className="view-more-ingredients-wrapper">
          <Link to="/ingredients" className="view-more-ingredients-btn">
            VIEW ALL INGREDIENTS
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
