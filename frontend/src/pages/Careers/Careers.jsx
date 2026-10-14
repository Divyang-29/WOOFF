import React, { useState, useRef } from 'react';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import './Careers.css';

const JOB_OPENINGS = [];


const PERKS = [
  {
    icon: 'fa-solid fa-tooth',
    title: 'Dentist-Led Science',
    desc: 'Work on products with genuine pediatric health impact. No marketing gimmicks, just honest biological innovation.'
  },
  {
    icon: 'fa-solid fa-laptop-house',
    title: 'Flexible & Hybrid',
    desc: 'We focus on creative output and ownership, not clock-watching. Flexible hours with hybrid and remote options.'
  },
  {
    icon: 'fa-solid fa-heart-pulse',
    title: 'Health & Dental Care',
    desc: 'Comprehensive health coverage and complimentary premium dental care for you and your loved ones.'
  },
  {
    icon: 'fa-solid fa-gift',
    title: 'Lifetime Wooff Care',
    desc: 'Unlimited free Wooff oral care packs and early access to every new formulation and product drop.'
  },
  {
    icon: 'fa-solid fa-graduation-cap',
    title: 'Learning Stipend',
    desc: 'Annual education budget for courses, conferences, workshops, and books to accelerate your professional growth.'
  },
  {
    icon: 'fa-solid fa-rocket',
    title: 'Founding Equity',
    desc: 'Generous ESOP / performance bonuses for high performers. Grow as the company scales across India.'
  }
];

export default function Careers() {
  // Application form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    portfolio: '',
    coverNote: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const formSectionRef = useRef(null);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.coverNote) {
      setSubmitError('Please fill in your name, email, and a brief note about yourself.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const targetPosition = 'General Application / Open Pitch';
    const messagePayload = `
CAREER APPLICATION DETAILS:
---------------------------
Position: ${targetPosition}
Applicant Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'N/A'}
Portfolio / LinkedIn: ${formData.portfolio || 'N/A'}

ABOUT THE CANDIDATE & WHY WOOFF:
${formData.coverNote}
    `.trim();

    try {
      const response = await fetch(API_ENDPOINTS.CONTACT || '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `Career Application: ${targetPosition}`,
          phone: formData.phone,
          message: messagePayload
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          portfolio: '',
          coverNote: ''
        });
      } else {
        setSubmitError(result.message || 'Submission failed. Please email careers@wooffkids.com directly.');
      }
    } catch (err) {
      setSubmitError('Unable to submit right now. Please email careers@wooffkids.com directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="careers-page-wrapper">
      <Banner breadcrumb="HOME / CAREERS" title="Join the Wooff Pack" />

      {/* 1. Hero / Mission Statement */}
      <section className="careers-hero-section">
        <div className="careers-container text-center">
          <span className="careers-pill-badge">
            <i className="fa-solid fa-sparkles me-1"></i> GROW WITH US • TALENT COMMUNITY
          </span>
          <h2 className="careers-hero-title">
            Help Us Turn Brushing Battles <br className="d-none d-md-block" />
            Into Daily Moments of Joy
          </h2>
          <p className="careers-hero-lead">
            We are reinventing kids’ daily oral care with clean science, biocompatible nano-hydroxyapatite,
            and irresistible chocolate taste. We are always looking for curious minds, passionate creators, and empathetic
            builders who want to build India's most beloved pediatric oral care brand.
          </p>
          <div className="careers-hero-actions">
            <a href="#open-roles" className="btn-wooff-primary">
              View Openings <i className="fa-solid fa-arrow-down ms-2"></i>
            </a>
            <a href="#culture" className="btn-wooff-secondary">
              Life at Wooff
            </a>
          </div>
        </div>
      </section>

      {/* 2. Values & Culture Section */}
      <section id="culture" className="careers-culture-section">
        <div className="careers-container">
          <div className="section-head text-center">
            <span className="section-sub-badge">OUR CORE VALUES</span>
            <h3 className="section-main-heading">How We Work & Grow Together</h3>
            <p className="section-lead-text">
              We operate like a close-knit pack: high trust, zero bureaucracy, deep scientific integrity, and room to take bold creative swings.
            </p>
          </div>

          <div className="culture-cards-grid">
            <div className="culture-card">
              <div className="culture-card-icon">
                <i className="fa-solid fa-flask-vial"></i>
              </div>
              <h4 className="culture-card-title">Clean Science First</h4>
              <p className="culture-card-desc">
                We never launch a product just to chase trends. Every ingredient is biocompatible, safe if swallowed, and vetted by pediatric biologic dentists.
              </p>
            </div>

            <div className="culture-card">
              <div className="culture-card-icon">
                <i className="fa-solid fa-face-laugh-beam"></i>
              </div>
              <h4 className="culture-card-title">Playful by Design</h4>
              <p className="culture-card-desc">
                Health shouldn't feel like a chore. From our friendly monkey mascot to our unboxing experience, we infuse warmth and pure joy into every detail.
              </p>
            </div>

            <div className="culture-card">
              <div className="culture-card-icon">
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <h4 className="culture-card-title">Uncompromising Ownership</h4>
              <p className="culture-card-desc">
                We hire builders who take pride in craftsmanship. You won't be micro-managed — you'll be empowered to run projects and make decisions.
              </p>
            </div>

            <div className="culture-card">
              <div className="culture-card-icon">
                <i className="fa-solid fa-hands-holding-heart"></i>
              </div>
              <h4 className="culture-card-title">Empathy for Parents</h4>
              <p className="culture-card-desc">
                Every parent's morning is already hectic. We exist to make parenting just a little easier, calmer, and happier every single day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Perks & Benefits Grid */}
      <section className="careers-perks-section">
        <div className="careers-container">
          <div className="section-head text-center">
            <span className="section-sub-badge">BENEFITS & PERKS</span>
            <h3 className="section-main-heading">Taking Care of Our People</h3>
            <p className="section-lead-text">
              When our team feels rested, inspired, and valued, extraordinary work naturally follows.
            </p>
          </div>

          <div className="perks-grid">
            {PERKS.map((perk, idx) => (
              <div className="perk-box" key={idx}>
                <div className="perk-icon-wrap">
                  <i className={perk.icon}></i>
                </div>
                <div className="perk-body">
                  <h4 className="perk-title">{perk.title}</h4>
                  <p className="perk-desc">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Open Positions Section */}
      <section id="open-roles" className="careers-jobs-section">
        <div className="careers-container">
          <div className="section-head text-center">
            <span className="section-sub-badge">CAREER OPPORTUNITIES</span>
            <h3 className="section-main-heading">Current Openings</h3>
            <p className="section-lead-text">
              We do not have any active openings at this moment.
            </p>
          </div>

          <div className="no-jobs-card text-center">
            <i className="fa-solid fa-mug-hot no-jobs-icon"></i>
            <h4 style={{ color: '#4B2E1E', fontWeight: 800, marginBottom: '0.75rem', fontSize: '1.4rem' }}>
              No Open Roles Right Now
            </h4>
            <p style={{ color: '#6C5547', maxWidth: '580px', margin: '0 auto 1.75rem', lineHeight: '1.6', fontSize: '1.02rem' }}>
              We're currently fully staffed across our core team. However, our pack is always growing!
              If you believe you can bring something truly special to Wooff, we'd love to read your open pitch.
            </p>
            <a href="#apply-section" className="btn-wooff-primary">
              Send an Open Pitch / General Application <i className="fa-solid fa-arrow-down ms-2"></i>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Interactive Application Form */}
      <section ref={formSectionRef} id="apply-section" className="careers-apply-section">
        <div className="careers-container">
          <div className="apply-card-wrapper">
            <div className="apply-head text-center">
              <span className="apply-pill">GENERAL APPLICATION</span>
              <h3 className="apply-title">
                Submit an Open Pitch / Application
              </h3>
              <p className="apply-subtitle">
                Don’t see an open role that fits? Tell us about yourself below or email your resume to{' '}
                <a href="mailto:careers@wooffkids.com" className="apply-email-link">
                  careers@wooffkids.com
                </a>
              </p>
            </div>

            {submitSuccess ? (
              <div className="apply-success-box text-center">
                <div className="success-icon-bounce">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h4>Application Received!</h4>
                <p>
                  Thank you for applying to join the Wooff pack. Our founding team reviews every application
                  personally and will get back to you within 3–5 business days.
                </p>
                <button
                  type="button"
                  className="btn-wooff-secondary mt-3"
                  onClick={() => setSubmitSuccess(false)}
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="apply-form">
                {submitError && (
                  <div className="apply-error-banner">
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    {submitError}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="applicant-name">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      id="applicant-name"
                      type="text"
                      name="name"
                      className="form-control wooff-input"
                      placeholder="e.g. Ananya Sharma"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="applicant-email">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      id="applicant-email"
                      type="email"
                      name="email"
                      className="form-control wooff-input"
                      placeholder="e.g. ananya@example.com"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="applicant-phone">
                      Phone Number
                    </label>
                    <input
                      id="applicant-phone"
                      type="tel"
                      name="phone"
                      className="form-control wooff-input"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="applicant-portfolio">
                      LinkedIn / Portfolio / Resume Link
                    </label>
                    <input
                      id="applicant-portfolio"
                      type="url"
                      name="portfolio"
                      className="form-control wooff-input"
                      placeholder="e.g. https://linkedin.com/in/..."
                      value={formData.portfolio}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="applicant-cover">
                      Why Wooff? Tell us about your superpower <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="applicant-cover"
                      name="coverNote"
                      rows="4"
                      className="form-control wooff-input"
                      placeholder="Share a project you're proud of, why kids' wellness excites you, or what you'd love to build with us..."
                      value={formData.coverNote}
                      onChange={handleFormChange}
                      required
                    ></textarea>
                  </div>

                  <div className="col-12 text-center mt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-wooff-submit-app"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          Submit Application <i className="fa-solid fa-arrow-right ms-2"></i>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 6. Direct Outreach Callout */}
      <section className="careers-outreach-banner">
        <div className="careers-container text-center">
          <h4 className="outreach-title">Have Questions Before Applying?</h4>
          <p className="outreach-text">
            Drop a line to our founding team at{' '}
            <a href="mailto:careers@wooffkids.com" className="outreach-link">
              careers@wooffkids.com
            </a>{' '}
            or connect with us on social media. We'd love to chat!
          </p>
        </div>
      </section>
    </div>
  );
}
