import React from 'react';
import { Link } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import './About.css';

export default function About() {
  const timelineData = [
    {
      year: '2022',
      badge: 'THE BEGINNING',
      title: 'Where the morning battle began',
      text: 'As a pediatric dental specialist, moms kept asking me the same two questions every day: "Which toothpaste is actually safe if my child swallows it?" and "Why does brushing have to end in tears and tantrums every single morning?" Traditional kids toothpastes were filled with artificial dyes, harsh foaming agents, and toxic fluoride warning labels. I knew there had to be a better, kinder way.',
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      caption: 'The pediatric oral care struggle'
    },
    {
      year: '2023',
      badge: 'THE SPARK',
      title: '“What if toothpaste tasted like chocolate?”',
      text: 'One evening over coffee, my partner casually remarked: "Kids love chocolate. What if toothpaste tasted like real cacao? Maybe they would actually look forward to brushing." We laughed at first, but the idea stuck. Researching cocoa beans led to a massive revelation: Theobromine, a natural extract from cocoa, is clinically proven to support enamel remineralization!',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
      caption: 'Discovering Theobromine & Natural Cocoa Extract'
    },
    {
      year: '2024',
      badge: 'THE FORMULATION',
      title: 'Designing a 100% prebiotic, fluoride-free formula',
      text: 'We set out to create a holistic oral-care formula for young mouths. We combined Nano-Hydroxyapatite (nHAp) — the bio-identical mineral that makes up 97% of natural tooth enamel — with prebiotic Inulin to nurture good bacteria and Vitamin C to protect delicate gum tissues. Every single ingredient was chosen with purpose.',
      image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
      caption: 'Formulating with nHAp & Prebiotic Nutrients'
    },
    {
      year: '2025',
      badge: 'PEDIATRIC SCIENCE',
      title: 'Backed by pediatric dental research',
      text: '"Children\'s oral health requires a gentle yet effective approach. By combining nano-hydroxyapatite for enamel remineralization with prebiotic nutrients to balance the oral microbiome, we protect young smiles safely without harsh chemicals."',
      author: 'Dr. Shrushti Bhankhariya — Pediatric Science Board Member',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
      caption: 'Pediatric Dental Board & Clinical Testing'
    },
    {
      year: '2026',
      badge: 'WOOFF LAUNCH',
      title: 'Brushing just got delicious!',
      text: 'After months of formulation, testing, and refining, Wooff Kids was officially born. A dentist-created kids toothpaste designed around one simple belief: brushing shouldn\'t be a battle — it should be a fun, delicious moment kids look forward to and parents feel 100% confident about!',
      image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80',
      caption: 'Official Launch — 100% Prebiotic Oral Care'
    }
  ];

  const philosophyPromises = [
    {
      icon: 'fa-vial-circle-check',
      title: 'Science First',
      description: 'Clinically backed ingredients like nHAp & Theobromine that strengthen enamel naturally.'
    },
    {
      icon: 'fa-shield-heart',
      title: 'Safe to Swallow',
      description: '100% fluoride-free, sulphate-free, and SLS-free formula crafted safely for growing kids.'
    },
    {
      icon: 'fa-bacteria',
      title: 'Microbiome Balance',
      description: 'Infused with prebiotic Inulin to nourish beneficial oral bacteria and protect gums.'
    },
    {
      icon: 'fa-face-laugh-beam',
      title: 'Tantrum Free',
      description: 'Indulgent, naturally delicious chocolate & citrus flavors kids genuinely beg to brush with.'
    }
  ];

  return (
    <div className="about-page-wrapper">
      <Banner breadcrumb="HOME / OUR STORY" title="Our Story" />

      <div className="about-content-container">

        {/* 1. Brewskin Editorial Hero Header */}
        <section className="about-hero-section text-center">
          <span className="about-eyebrow-tag">O U R &nbsp; S T O R Y</span>
          <h1 className="about-hero-headline mt-3">
            Crafted with <em>purpose</em>, born over time.
          </h1>
          <p className="about-hero-lead mx-auto">
            Wooff lives in those quiet morning and bedtime moments where learning good habits turns into a fun, delicious daily ritual.
          </p>
        </section>

        {/* 2. Brewskin Timeline Container with Central Spine */}
        <section className="timeline-journey-wrapper">
          <div className="timeline-central-spine"></div>

          <div className="timeline-items-list">
            {timelineData.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={item.year} className={`timeline-row ${isEven ? 'row-left' : 'row-right'}`}>
                  
                  {/* Left Column Content */}
                  <div className="timeline-col col-content-left">
                    {isEven ? (
                      <div className="story-img-card-wrap">
                        <img src={item.image} alt={item.title} className="story-timeline-img" />
                        <span className="story-img-caption">{item.caption}</span>
                      </div>
                    ) : (
                      <div className="story-text-card">
                        <span className="timeline-section-badge">{item.badge}</span>
                        <h2>{item.title}</h2>
                        <p>{item.text}</p>
                        {item.author && <span className="story-author-tag"><i className="fa-solid fa-user-doctor me-2"></i>{item.author}</span>}
                      </div>
                    )}
                  </div>

                  {/* Center Node / Year Badge */}
                  <div className="timeline-center-node">
                    <div className="year-pill-badge">{item.year}</div>
                    <div className="pit-stop-badge">
                      <i className="fa-solid fa-car-side me-1"></i> PIT STOP!
                    </div>
                  </div>

                  {/* Right Column Content */}
                  <div className="timeline-col col-content-right">
                    {isEven ? (
                      <div className="story-text-card">
                        <span className="timeline-section-badge">{item.badge}</span>
                        <h2>{item.title}</h2>
                        <p>{item.text}</p>
                        {item.author && <span className="story-author-tag"><i className="fa-solid fa-user-doctor me-2"></i>{item.author}</span>}
                      </div>
                    ) : (
                      <div className="story-img-card-wrap">
                        <img src={item.image} alt={item.title} className="story-timeline-img" />
                        <span className="story-img-caption">{item.caption}</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Philosophy 4-Grid Promises */}
        <section className="about-philosophy-section">
          <div className="text-center mb-5">
            <span className="about-eyebrow-tag mb-2">P H I L O S O P H Y</span>
            <h2 className="philosophy-section-title">The 4 Wooff Guiding Principles</h2>
          </div>
          <div className="philosophy-grid">
            {philosophyPromises.map((item, idx) => (
              <div key={idx} className="philosophy-card">
                <div className="philosophy-icon">
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Founder's Note Section */}
        <section className="about-founder-section">
          <div className="founder-card-inner">
            <span className="story-section-badge">FROM THE FOUNDER</span>
            <blockquote className="founder-statement">
              "We built Wooff so parents never have to choose between clinical safety and a happy, tantrum-free morning."
            </blockquote>
            <div className="founder-signature-block">
              <div className="founder-avatar-circle">
                <i className="fa-solid fa-user-doctor"></i>
              </div>
              <div className="founder-details">
                <h3>Dr. Shrushti Bhankhariya</h3>
                <p>Pediatric Dental Specialist & Founder</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Bottom CTA Banner */}
        <section className="about-cta-section text-center">
          <h2>Ready to transform your child's brushing routine?</h2>
          <p>Explore our 100% prebiotic, fluoride-free oral care formulas today.</p>
          <Link to="/products" className="btn-wooff-cta mt-3">
            Explore Products <i className="fa-solid fa-arrow-right ms-2"></i>
          </Link>
        </section>

      </div>
    </div>
  );
}
