import React, { useState, useEffect } from 'react';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import './Ingredients.css';

// Map ingredient slugs/names to the botanical clean illustrations used in homescreen CleanIngredientsSection
const INGREDIENT_CLEAN_MAP = {
  'nano-hydroxyapatite': '/images/ingredients/nhap_clean.png',
  'theobromine': '/images/ingredients/theobromine_clean.png',
  'prebiotics-inulin': '/images/ingredients/inulin_clean.png',
  'inulin': '/images/ingredients/inulin_clean.png',
  'vitamin-c': '/images/ingredients/vitaminc_clean.png',
  'coenzyme-q10': '/images/ingredients/coq10_clean.png',
  'coq10': '/images/ingredients/coq10_clean.png',
  'lactoferrin': '/images/ingredients/lactoferrin_clean.png',
  'calcium-gluconate': '/images/ingredients/calcium_clean.png',
  'calcium': '/images/ingredients/calcium_clean.png',
};

const resolveIngredientIcon = (item) => {
  if (!item) return '/images/ingredients/nhap_clean.png';
  if (item.icon_url && item.icon_url.includes('/images/ingredients/') && item.icon_url.endsWith('_clean.png')) {
    return item.icon_url;
  }
  const slug = (item.slug || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  if (slug.includes('hydroxyapatite') || name.includes('hydroxyapatite') || name.includes('nhap')) {
    return '/images/ingredients/nhap_clean.png';
  }
  if (slug.includes('theobromine') || name.includes('theobromine') || name.includes('cacao') || name.includes('cocoa')) {
    return '/images/ingredients/theobromine_clean.png';
  }
  if (slug.includes('inulin') || name.includes('inulin') || name.includes('prebiotic')) {
    return '/images/ingredients/inulin_clean.png';
  }
  if (slug.includes('vitamin-c') || name.includes('vitamin c') || name.includes('ascorbic')) {
    return '/images/ingredients/vitaminc_clean.png';
  }
  if (slug.includes('lactoferrin') || name.includes('lactoferrin')) {
    return '/images/ingredients/lactoferrin_clean.png';
  }
  if (slug.includes('coq10') || slug.includes('coenzyme') || name.includes('coq10') || name.includes('coenzyme')) {
    return '/images/ingredients/coq10_clean.png';
  }
  if (slug.includes('calcium') || name.includes('calcium')) {
    return '/images/ingredients/calcium_clean.png';
  }
  return item.icon_url || '/images/ingredients/nhap_clean.png';
};

const DEFAULT_INGREDIENTS = [
  {
    id: 1,
    name: 'Nano-Hydroxyapatite',
    slug: 'nano-hydroxyapatite',
    sub_title: 'Enamel Mineral Support',
    tag: 'Rebuilds Enamel',
    description: 'A biomimetic mineral that closely resembles the mineral naturally found in teeth. It helps support enamel remineralization safely without harsh chemicals or warning labels.',
    benefits: ['Deposits calcium and phosphate ions into micro-porosities', 'Rebuilds and protects tooth enamel', '100% biocompatible and safe if swallowed'],
    badge_text: 'Enamel Protector',
    icon_url: '/images/ingredients/nhap_clean.png',
  },
  {
    id: 2,
    name: 'Theobromine',
    slug: 'theobromine',
    sub_title: 'Enamel Strength Support',
    tag: 'Natural Cacao Extract',
    description: 'Derived from natural cacao, theobromine has been studied for its potential to support enamel remineralization and crystal growth alongside Nano-hydroxyapatite.',
    benefits: ['Strengthens crystalline enamel structure', 'Non-toxic natural cacao component', 'Synergizes with Nano-Hydroxyapatite'],
    badge_text: 'Clinically Studied',
    icon_url: '/images/ingredients/theobromine_clean.png',
  },
  {
    id: 3,
    name: 'Inulin',
    slug: 'prebiotics-inulin',
    sub_title: 'Prebiotic Oral Care',
    tag: 'Microbiome Balance',
    description: 'A naturally derived prebiotic included to nourish beneficial oral bacteria and support a healthy, balanced oral environment.',
    benefits: ['Nourishes protective oral flora', 'Suppresses harmful acid-producing bacteria', 'Supports whole-mouth wellness'],
    badge_text: 'Prebiotic Care',
    icon_url: '/images/ingredients/inulin_clean.png',
  },
  {
    id: 4,
    name: 'Vitamin C',
    slug: 'vitamin-c',
    sub_title: 'Antioxidant & Gum Support',
    tag: 'Collagen Support',
    description: 'Vitamin C is a vital antioxidant that contributes to the health of oral tissues and supports a strong, healthy gum environment.',
    benefits: ['Supports healthy collagen production in gums', 'Potent antioxidant defence against inflammation', 'Nourishes delicate oral tissues'],
    badge_text: 'Gum Support',
    icon_url: '/images/ingredients/vitaminc_clean.png',
  },
  {
    id: 5,
    name: 'Lactoferrin',
    slug: 'lactoferrin',
    sub_title: 'Natural Oral Defence',
    tag: 'Salivary Protein',
    description: 'A naturally occurring protein found in saliva and mother’s milk, lactoferrin provides natural antimicrobial defence against unwanted mouth bacteria.',
    benefits: ['Bio-mimetic salivary protection', 'Maintains oral microbiome equilibrium', 'Gentle on developing gums'],
    badge_text: 'Natural Defence',
    icon_url: '/images/ingredients/lactoferrin_clean.png',
  },
  {
    id: 6,
    name: 'Coenzyme Q10',
    slug: 'coenzyme-q10',
    sub_title: 'Antioxidant Gum Care',
    tag: 'Cellular Energy',
    description: 'A naturally occurring cellular antioxidant widely studied in periodontal and gum tissue care for cellular vitality.',
    benefits: ['Enhances periodontal cellular vitality', 'Fights oxidative stress in gum pockets', 'Promotes gum healing and resilience'],
    badge_text: 'Periodontal Care',
    icon_url: '/images/ingredients/coq10_clean.png',
  },
  {
    id: 7,
    name: 'Calcium Gluconate',
    slug: 'calcium-gluconate',
    sub_title: 'Tooth Enamel Support',
    tag: 'Mineral Building Block',
    description: 'Calcium is an essential building block of tooth enamel, working synergistically with nHAp to keep growing teeth mineral-dense and resilient.',
    benefits: ['Provides essential bio-available calcium ions', 'Enhances remineralization synergy', 'Gentle and non-abrasive'],
    badge_text: 'Essential Mineral',
    icon_url: '/images/ingredients/calcium_clean.png',
  },
];

export default function Ingredients() {
  const [ingredients, setIngredients] = useState(DEFAULT_INGREDIENTS);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    async function fetchIngredients() {
      try {
        const res = await fetch(API_ENDPOINTS.INGREDIENTS);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.ingredients) && data.ingredients.length > 0) {
            setIngredients(data.ingredients.filter((item) => item.is_active !== false));
          } else if (Array.isArray(data) && data.length > 0) {
            setIngredients(data.filter((item) => item.is_active !== false));
          }
        }
      } catch (err) {
        console.warn('Using default ingredients:', err);
      }
    }
    fetchIngredients();
  }, []);

  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="ingredients-page-wrapper">
      <Banner breadcrumb="HOME / INSIDE THE TUBE" title="Inside the Tube" />

      {/* Top Header Section */}
      <div className="ingredients-header-container">
        <span className="formula-pill-badge">OUR FORMULA</span>
        <h1 className="ingredients-main-heading">Wooff Ingredients</h1>
        <p className="ingredients-sub-heading">
          Wooff is made with naturally sourced ingredients that serve a purpose. No toxic chemicals, nothing unnecessary, and 100% safe if swallowed.
        </p>
      </div>

      {/* Main Interactive Ingredients Section Container */}
      <div className="ingredients-showcase-container">
        <div className="ingredients-showcase-card">
          
          {/* Ingredients Accordion List Column */}
          <div className="ingredients-list-column">
            {loading ? (
              <div className="p-4 text-center text-muted">
                <i className="fa-solid fa-circle-notch fa-spin fs-3 mb-2 d-block"></i>
                <span>Loading active bio-active ingredients...</span>
              </div>
            ) : ingredients.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="fa-solid fa-flask-vial fs-3 mb-2 d-block text-secondary"></i>
                <p className="fw-bold mb-0">No active formulation ingredients configured.</p>
              </div>
            ) : (
              ingredients.map((item) => {
                const isOpen = showAll || openItem === item.id;
                const iconSrc = resolveIngredientIcon(item);
                return (
                  <div 
                    key={item.id} 
                    className={`ingredient-accordion-item ${isOpen ? 'is-open' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="ingredient-item-header">
                      <div className="ingredient-title-meta">
                        <h3 className="ingredient-item-name">{item.name}</h3>
                        <span className="ingredient-item-category">{item.tag || item.sub_title || 'Hero Formulation'}</span>
                      </div>

                      <div className="ingredient-item-right">
                        {item.badge_text && (
                          <span className="badge bg-light text-dark border me-2 small px-2 py-1">
                            {item.badge_text}
                          </span>
                        )}
                        <img 
                          src={iconSrc} 
                          alt={item.name} 
                          className="ingredient-item-icon" 
                          onError={(e) => { e.target.src = '/images/ingredients/nhap_clean.png'; }}
                        />
                        <button className="accordion-toggle-btn" aria-label="Toggle details">
                          {isOpen ? '−' : '+'}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="ingredient-item-body">
                        <p>{item.description}</p>
                        {Array.isArray(item.benefits) && item.benefits.length > 0 && (
                          <ul className="mb-0 mt-2 ps-3 small text-muted">
                            {item.benefits.map((benefit, bIdx) => (
                              <li key={bIdx}>{benefit}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Clinical Research Card */}
          <div className="research-sticky-card">
            <div className="research-card-content">
              <h2>Science-Backed Pediatric Formulation</h2>
              <p>
                "Children's oral health requires a gentle yet effective approach. By combining nano-hydroxyapatite for enamel remineralization with prebiotic nutrients to balance the oral microbiome, we protect young smiles safely without harsh chemicals."
              </p>
              
              <div className="research-quote-badge">
                <div className="dentist-avatar"><i className="fa-solid fa-user-doctor"></i></div>
                <div className="dentist-info">
                  <strong>Dr. Shrushti Bhankhariya</strong>
                  <span>Pediatric Science Board Member</span>
                </div>
              </div>

              {/* Show All Descriptions Toggle Switch */}
              <div className="toggle-descriptions-control">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={showAll} 
                    onChange={(e) => setShowAll(e.target.checked)} 
                  />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label-text">Show all descriptions</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Banner CTA */}
      <div className="ingredients-footer-cta">
        <h2>The world's first prebiotic, fluoride-free kids toothpaste. Try it today!</h2>
      </div>
    </div>
  );
}
