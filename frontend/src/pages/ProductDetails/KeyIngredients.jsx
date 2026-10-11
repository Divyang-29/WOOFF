import React from 'react';
import { Link } from 'react-router-dom';
import './ProductDetails.css';

export const defaultKeyIngredients = [
  {
    id: 'nhap',
    title: 'Nano-Hydroxyapatite',
    subtitle: 'Enamel Mineral Support',
    description: 'A biomimetic mineral that closely resembles the mineral naturally found in teeth. It helps support enamel remineralization and maintain strong, healthy-looking teeth.',
    image_url: '/images/ingredients/nhap_clean.png'
  },
  {
    id: 'theobromine',
    title: 'Theobromine',
    subtitle: 'Enamel Strength Support',
    description: 'Derived from cocoa, theobromine has been studied for its potential to support enamel remineralization and increase enamel microhardness.',
    image_url: '/images/ingredients/theobromine_clean.png'
  },
  {
    id: 'inulin',
    title: 'Inulin',
    subtitle: 'Prebiotic Oral Care',
    description: 'A naturally derived prebiotic included to support a balanced oral environment and complement the oral microbiome.',
    image_url: '/images/ingredients/inulin_clean.png'
  },
  {
    id: 'vitaminc',
    title: 'Vitamin C',
    subtitle: 'Antioxidant & Gum Support',
    description: 'Vitamin C is an antioxidant that contributes to the health of oral tissues and supports a healthy gum environment.',
    image_url: '/images/ingredients/vitaminc_clean.png'
  },
  {
    id: 'lactoferrin',
    title: 'Lactoferrin',
    subtitle: 'Natural Oral Defence',
    description: 'A naturally occurring protein found in saliva, lactoferrin has antimicrobial properties and has been studied for its role in maintaining a healthy oral microbial environment.',
    image_url: '/images/ingredients/lactoferrin_clean.png'
  },
  {
    id: 'coq10',
    title: 'Coenzyme Q10',
    subtitle: 'Antioxidant Gum Care',
    description: 'A naturally occurring antioxidant that has been studied in periodontal care and is included to complement the formulation’s focus on healthy gums.',
    image_url: '/images/ingredients/coq10_clean.png'
  },
  {
    id: 'calcium-gluconate',
    title: 'Calcium Gluconate',
    subtitle: 'Tooth Enamel Support',
    description: 'Calcium is an essential building block of tooth enamel.',
    image_url: '/images/ingredients/calcium_clean.png'
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
