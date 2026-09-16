import React, { useState } from 'react';
import Banner from '../../components/Banner/Banner';
import './Ingredients.css';

const INGREDIENTS_DATA = [
  {
    id: 'theobromine',
    name: "Theobromine",
    category: "Enamel Mineralization",
    desc: "The magic of cocoa! It is a naturally occurring compound found in chocolate that has been shown to support enamel mineralization. Paired with nHAp, it helps strengthen tiny teeth while making brushing actually taste delicious.",
    icon: "/images/ingredients/cacao.jpg"
  },
  {
    id: 'nhap',
    name: "Nano-Hydroxyapatite (nHAp)",
    category: "Remineralizing Superhero",
    desc: "The superhero ingredient. nHAp is a non-toxic mineral that naturally makes up 97% of your tooth enamel. It binds directly to teeth to rebuild, protect, and remineralize safely, without the toxicity concerns of traditional fluoride.",
    icon: "/images/ingredients/nhap.jpg"
  },
  {
    id: 'calcium-gluconate',
    name: "Calcium Gluconate",
    category: "Mineral Availability",
    desc: "The foundational building block. This provides a highly bioavailable source of calcium, ensuring your child's teeth have the essential minerals they need to stay strong, hard, and healthy as they grow.",
    icon: "/images/ingredients/calcium.jpg"
  },
  {
    id: 'inulin',
    name: "Inulin",
    category: "Prebiotic Microbiome Support",
    desc: "A happy mouth means happy teeth. Inulin is a natural prebiotic that feeds the beneficial bacteria in the mouth. This promotes a balanced, healthy oral microbiome to naturally crowd out the bad, cavity-causing bugs.",
    icon: "/images/ingredients/inulin.jpg"
  },
  {
    id: 'vitamin-c',
    name: "Ascorbic Acid / Vitamin C",
    category: "Antioxidant & Tissue Care",
    desc: "Not just for immune support! Ascorbic Acid (Vitamin C) is a vital antioxidant that supports healthy, resilient gums and oral tissues, keeping the soft-tissue foundation of your child's smile strong.",
    icon: "/images/ingredients/vitaminc.jpg"
  },
  {
    id: 'lactoferrin',
    name: "Lactoferrin",
    category: "Antimicrobial Protein",
    desc: "The gentle protector. This naturally occurring antimicrobial protein works around the clock to help maintain excellent oral hygiene by keeping the microbial balance of the mouth perfectly in check.",
    icon: "/images/ingredients/lactoferrin.jpg"
  },
  {
    id: 'coq10',
    name: "Coenzyme Q10 (CoQ10)",
    category: "Gum Health Antioxidant",
    desc: "A powerful antioxidant that works behind the scenes. CoQ10 is widely used and studied for supporting overall gum health, ensuring the delicate soft tissues in the mouth stay just as healthy as the enamel.",
    icon: "/images/ingredients/coq10.jpg"
  }
];

export default function Ingredients() {
  const [showAll, setShowAll] = useState(false);
  const [openItem, setOpenItem] = useState(null);

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

        {/* Flavors Summary Cards - Distinct Visual Themes */}
        <div className="flavors-summary-row">
          
          <div className="flavor-summary-card flavor-citrus">
            <div className="flavor-card-badge">Zesty Sunshine</div>
            <div className="flavor-card-header">
              <div className="flavor-info">
                <h3>Meet Citrus</h3>
                <span className="flavor-tagline">Bright, refreshing & packed with Vitamin C</span>
              </div>
              <div className="flavor-icon-wrap">
                <img src="/images/ingredients/vitaminc.jpg" alt="Citrus Slice" className="flavor-icon-img" />
              </div>
            </div>
            <p className="flavor-ingredients-text">
              <strong>Key Formula:</strong> Theobromine, Nano-Hydroxyapatite, Calcium Gluconate, Ascorbic Acid (Vitamin C), Inulin Prebiotic, Lactoferrin, CoQ10 Pure.
            </p>
            <div className="flavor-chips">
              <span className="flavor-chip"><i className="fa-solid fa-lemon me-1"></i> Tangy Citrus</span>
              <span className="flavor-chip"><i className="fa-solid fa-shield-halved me-1"></i> Enamel Shield</span>
              <span className="flavor-chip"><i className="fa-solid fa-heart-pulse me-1"></i> Gum Antioxidant</span>
            </div>
          </div>

          <div className="flavor-summary-card flavor-cacao">
            <div className="flavor-card-badge cacao-badge">Decadent Cacao</div>
            <div className="flavor-card-header">
              <div className="flavor-info">
                <h3>Meet Cacao</h3>
                <span className="flavor-tagline">Rich, creamy chocolate enamel remineralizer</span>
              </div>
              <div className="flavor-icon-wrap">
                <img src="/images/ingredients/cacao.jpg" alt="Cacao Beans" className="flavor-icon-img" />
              </div>
            </div>
            <p className="flavor-ingredients-text">
              <strong>Key Formula:</strong> Natural Cocoa Extract, Theobromine, Nano-Hydroxyapatite, Calcium Gluconate, Vitamin C, Inulin Prebiotic, Lactoferrin, CoQ10.
            </p>
            <div className="flavor-chips">
              <span className="flavor-chip cacao-chip"><i className="fa-solid fa-cookie-bite me-1"></i> Real Cocoa</span>
              <span className="flavor-chip cacao-chip"><i className="fa-solid fa-tooth me-1"></i> Enamel Power</span>
              <span className="flavor-chip cacao-chip"><i className="fa-solid fa-leaf me-1"></i> Prebiotic Care</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Interactive Ingredients Section Container */}
      <div className="ingredients-showcase-container">
        <div className="ingredients-showcase-card">
          
          {/* Ingredients Accordion List Column */}
          <div className="ingredients-list-column">
            {INGREDIENTS_DATA.map((item) => {
              const isOpen = showAll || openItem === item.id;
              return (
                <div 
                  key={item.id} 
                  className={`ingredient-accordion-item ${isOpen ? 'is-open' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="ingredient-item-header">
                    <div className="ingredient-title-meta">
                      <h3 className="ingredient-item-name">{item.name}</h3>
                      <span className="ingredient-item-category">{item.category}</span>
                    </div>

                    <div className="ingredient-item-right">
                      {item.icon && (
                        <img src={item.icon} alt={item.name} className="ingredient-item-icon" />
                      )}
                      <button className="accordion-toggle-btn" aria-label="Toggle details">
                        {isOpen ? '−' : '+'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="ingredient-item-body">
                      <p>{item.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Clinical Research Card (Sits under accordion on mobile, sticky left on desktop) */}
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
