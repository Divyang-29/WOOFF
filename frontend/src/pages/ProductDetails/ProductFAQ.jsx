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

export const SINGLE_PACK_CHOCO_FAQS = [
  {
    id: 'sugar-cavities',
    question: 'Does chocolate toothpaste contain sugar or cause cavities?',
    answer: 'Wooff Kids Choco Toothpaste contains no sugar and no chocolate; its taste comes from cocoa extract. Cavities form when plaque bacteria turn sugars from food and drinks into acid, so a sugar-free toothpaste doesn\'t feed them. The flavour doesn\'t protect teeth either: brushing twice a day and cutting down on sugary snacks do.'
  },
  {
    id: 'fda-approved',
    question: 'Is Wooff Kids Choco Toothpaste FDA approved?',
    answer: 'In India, toothpaste is regulated as a cosmetic, so it isn\'t "approved" the way a medicine is. Wooff Kids is made under a cosmetic manufacturing licence issued by a State Food & Drug Control Administration, at a plant certified for Good Manufacturing Practices. These show the factory meets the rules. They aren\'t an approval of health claims, which is why we don\'t make any.'
  },
  {
    id: 'toddler-2yo',
    question: 'Can a 2-year-old use Wooff Kids Choco Toothpaste?',
    answer: 'Yes. It is labelled for children above 2 years. Use a pea-sized amount, put it on the brush yourself, and brush your child\'s teeth for them until they are about 3. For children under 2, ask your dentist which toothpaste to use and how much.'
  },
  {
    id: 'swallow-toothpaste',
    question: 'What should I do if my child swallows the toothpaste?',
    answer: 'Don\'t worry about the small amount children often swallow while learning to brush. Wooff Kids is sugar-free and fluoride-free, and a pea-sized amount contains only a tiny quantity of each ingredient. Toothpaste is still made to be spat out, so keep using a small amount and supervise brushing. If your child eats a large amount, such as much of the tube, speak to your doctor and keep the carton with you.'
  },
  {
    id: 'fluoride-free-kids',
    question: 'Is fluoride-free toothpaste good for kids?',
    answer: 'It can suit some children, but it isn\'t automatically safer or more effective. Fluoride toothpaste has the strongest evidence for preventing tooth decay and remains the standard recommendation. If your child has had cavities or is at higher risk, ask your dentist before choosing a fluoride-free paste.'
  },
  {
    id: 'theobromine-toothpaste',
    question: 'What does theobromine do in toothpaste?',
    answer: 'Theobromine is a natural compound found in cocoa. Laboratory studies have tested whether it helps tooth enamel take up minerals, with mixed results, and human studies so far are small and short. It hasn\'t been shown to prevent cavities, so treat it as an ingredient still under research rather than a proven one. Wooff Kids contains 2% theobromine.'
  },
  {
    id: 'nhap-safety-kids',
    question: 'Is nano-hydroxyapatite safe for children?',
    answer: 'Hydroxyapatite is a calcium-phosphate mineral, the same type that makes up most of tooth enamel; "nano" means the particles are very small. In the European Union, nano-hydroxyapatite is permitted in toothpaste at up to 10%, provided the particles meet strict size and shape criteria. Wooff Kids contains 2%. As with any toothpaste, use the amount on the pack and teach your child to spit out the excess.'
  },
  {
    id: 'adults-choco-toothpaste',
    question: 'Can adults use chocolate toothpaste?',
    answer: 'Yes. Wooff Kids is designed for children, but the pack says "above 2 years", so older children and adults who find mint too strong can use it too. Adults with sensitive teeth, gum problems or a history of decay should ask their dentist which toothpaste suits them.'
  },
  {
    id: 'dogs-pets-safety',
    question: 'Is Wooff toothpaste for dogs?',
    answer: 'No. Despite the name, Wooff Kids is toothpaste for children. Never use it to brush a pet\'s teeth: it contains theobromine, which is toxic to dogs, and human toothpastes can contain other ingredients that are unsafe for pets, such as xylitol. Keep the tube out of your pet\'s reach.'
  },
  {
    id: 'returns-opened-tube',
    question: 'Can I return an opened tube?',
    answer: 'For hygiene reasons, opened or used tubes can\'t be returned. If your order arrives damaged, leaking or incorrect, contact us within 48 hours of delivery and share an unedited video of the sealed parcel being opened. Full details are in our <a href="/refund-policy" class="faq-inline-link"><strong>refund and cancellation policy</strong></a>.'
  },
  {
    id: 'where-to-buy-choco',
    question: 'Where can I buy Wooff Kids Choco Toothpaste?',
    answer: 'On wooff.care, as a single 50 g tube or a <a href="/product/choco-toothpaste-pack-of-2" class="faq-inline-link"><strong>pack of two 50 g tubes</strong></a>. You can pay by UPI, card, net banking or cash on delivery.'
  },
  {
    id: 'delivery-timeline',
    question: 'How long does delivery take?',
    answer: 'Orders usually arrive in 2–4 business days. Enter your pincode on this page to check the delivery time for your area.'
  }
];

export default function ProductFAQ({ faqs, isSinglePack = false }) {
  let faqList = [];

  if (isSinglePack) {
    faqList = SINGLE_PACK_CHOCO_FAQS;
  } else {
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

    faqList = [...priorityFaqs, ...filteredRest];
  }

  const [openId, setOpenId] = useState(isSinglePack ? 'sugar-cavities' : 'toddlers-suitable');


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
                      {typeof item.answer === 'string' && item.answer.includes('<') ? (
                        <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                      ) : (
                        <p>{item.answer}</p>
                      )}
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
            <Link to="/blog/chocolate-flavoured-toothpaste" className="faq-guide-link">
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
