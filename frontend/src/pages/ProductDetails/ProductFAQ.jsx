import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductFAQ.css';

const DEFAULT_WOOFF_FAQS = [
  {
    id: 'toddlers-suitable',
    question: 'Is it suitable for toddlers?',
    answer: 'Follow the age guidance on the pack and consult a dentist for very young children.',
  },
  {
    id: 'chocolate-taste',
    question: 'Does it taste like real chocolate?',
    answer: 'It has a cocoa-style flavour, made to be mild and kid-friendly.',
  },
  {
    id: 'diff-toothpaste',
    question: 'How is Wooff different from traditional kids toothpastes?',
    answer: 'Traditional kids toothpastes rely on harsh foaming agents (SLS), artificial dyes, and toxic fluoride warning labels. Wooff is 100% fluoride-free, dentist-formulated with Nano-Hydroxyapatite (nHAp) to rebuild enamel naturally and prebiotic Inulin to balance the oral microbiome. Plus, it actually tastes delicious!'
  },
  {
    id: 'swallow-safe',
    question: 'What should I do if my child accidentally swallows Wooff?',
    answer: 'Absolutely nothing! Wooff is 100% safe to swallow. Every single ingredient — from natural cocoa extract and nHAp to Vitamin C and calcium — is non-toxic, biocompatible, and food-grade. No panic, no toxic warning labels!'
  },
  {
    id: 'fluoride-sls-free',
    question: 'Is Wooff 100% fluoride-free and SLS-free?',
    answer: 'Yes! Wooff is completely free of fluoride, sodium lauryl sulfate (SLS), parabens, phthalates, artificial dyes, microplastics, and titanium dioxide.'
  },
  {
    id: 'nhap-science',
    question: 'How does Nano-Hydroxyapatite (nHAp) work to rebuild enamel?',
    answer: 'Nano-hydroxyapatite is the exact bio-identical mineral that makes up 97% of natural tooth enamel. It binds directly to teeth, fills microscopic enamel grooves, remineralizes weak spots, and protects against sensitivity safely.'
  },
  {
    id: 'age-range',
    question: 'What age range is Wooff suitable for?',
    answer: 'Wooff is formulated for kids of all ages — from toddlers taking their very first brush strokes to older children and even adults who love natural, delicious oral care!'
  },
  {
    id: 'vegan-cruelty-free',
    question: 'Is Wooff vegan and cruelty-free?',
    answer: '100% yes! We never test on animals and all our ingredients are 100% vegan, cruelty-free, and ethically sourced.'
  },
  {
    id: 'prebiotic-support',
    question: 'Does Wooff contain prebiotic nutrients for oral microbiome health?',
    answer: 'Yes! We infuse organic Inulin prebiotics to nourish beneficial oral bacteria, crowding out bad cavity-causing microbes for long-lasting fresh breath and healthy gums.'
  }
];

export default function ProductFAQ({ faqs }) {
  const baseList = (Array.isArray(faqs) && faqs.length > 0) ? faqs : DEFAULT_WOOFF_FAQS;

  // Ensure user-specified toddler and chocolate taste FAQs are always present at top
  const priorityFaqs = [
    {
      id: 'toddlers-suitable',
      question: 'Is it suitable for toddlers?',
      answer: 'Follow the age guidance on the pack and consult a dentist for very young children.',
    },
    {
      id: 'chocolate-taste',
      question: 'Does it taste like real chocolate?',
      answer: 'It has a cocoa-style flavour, made to be mild and kid-friendly.',
    },
  ];

  const filteredRest = baseList.filter(
    (item) =>
      item.question !== 'Is it suitable for toddlers?' &&
      item.question !== 'Does it taste like real chocolate?'
  );

  const faqList = [...priorityFaqs, ...filteredRest];
  const [openId, setOpenId] = useState('toddlers-suitable');

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="product-faq-cooler-section">
      <div className="faq-split-container">
        
        {/* Left Editorial Header Column */}
        <div className="faq-left-column">
          <h2 className="faq-main-title">
            Frequently Asked Questions
          </h2>
          <p className="faq-sub-lead">
            Got questions about kids' oral health, bio-identical minerals, or swallow-safe ingredients? We've got dentist-backed answers.
          </p>
          <div className="faq-help-box">
            <i className="fa-solid fa-circle-question help-icon"></i>
            <div>
              <strong>Have another question?</strong>
              <p>Our pediatric care team is here to help mom & dad.</p>
            </div>
          </div>
        </div>

        {/* Right Accordions List Column */}
        <div className="faq-right-column">
          <div className="faq-accordions-list">
            {faqList.map((item, idx) => {
              const currentId = item.id || `faq-${idx}`;
              const isOpen = openId === currentId;
              return (
                <div 
                  key={currentId} 
                  className={`faq-accordion-item ${isOpen ? 'is-expanded' : ''}`}
                >
                  <button 
                    className="faq-question-btn"
                    onClick={() => toggleFaq(currentId)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question-text">{item.question}</span>
                    <span className="faq-icon-toggle">{isOpen ? '−' : '+'}</span>
                  </button>
                  
                  {isOpen && (
                    <div className="faq-answer-content">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Editorial Note & Disclaimer below FAQ */}
      <div className="faq-editorial-footer">
        <div className="faq-editorial-range-card">
          <div className="faq-range-icon">
            <i className="fa-solid fa-tooth"></i>
          </div>
          <div className="faq-range-text">
            <span>Part of our kids toothpaste range. </span>
            <Link to="/blog/science-of-theobromine" className="faq-guide-link">
              Read the chocolate toothpaste guide &rarr;
            </Link>
          </div>
        </div>

        <div className="faq-medical-disclaimer">
          <p>
            Written by the Wooff team. Reviewed for accuracy; check with your child&apos;s dentist for personal advice. Toothpaste is not a substitute for regular dental visits.
          </p>
        </div>
      </div>
    </section>
  );
}
