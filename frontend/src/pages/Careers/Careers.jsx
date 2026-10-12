import React, { useState, useRef } from 'react';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import './Careers.css';

const JOB_OPENINGS = [
  {
    id: 'rd-formulation',
    title: 'Pediatric Formulation & R&D Scientist',
    department: 'Product & R&D',
    location: 'Mumbai, India (Hybrid)',
    type: 'Full-time',
    experience: '3-6 years',
    summary: 'Lead ongoing formulation innovation for nano-hydroxyapatite and prebiotic pediatric oral care products with zero toxic compromises.',
    responsibilities: [
      'Design, test, and optimize natural pediatric oral care formulations compliant with FDA & CDSCO standards.',
      'Research and validate emerging biocompatible enamel remineralization and microbiome-supporting ingredients (nHAp, theobromine, inulin, lactoferrin).',
      'Oversee clinical stability testing, preservative-efficacy tests, and pilot batch scale-up with manufacturing partners.',
      'Collaborate with pediatric biological dentists and advisors to substantiate clinical and safety claims.'
    ],
    requirements: [
      'Master’s degree or PhD in Pharmaceutical Sciences, Cosmetic Chemistry, or related field.',
      '3+ years hands-on experience in personal care, oral care, or food-grade topical formulations.',
      'Deep understanding of clean formulation philosophies (SLS-free, fluoride-free, natural flavor systems).',
      'Strong analytical rigor and enthusiasm for consumer product innovation.'
    ]
  },
  {
    id: 'growth-lead',
    title: 'D2C Performance & Growth Marketing Lead',
    department: 'Growth & Marketing',
    location: 'Remote / Mumbai (Hybrid)',
    type: 'Full-time',
    experience: '4-7 years',
    summary: 'Scale Wooff from thousands of smiling kids to millions across India through data-driven paid acquisition, retention, and funnel optimization.',
    responsibilities: [
      'Own end-to-end paid acquisition strategy across Meta Ads, Google Performance Max, and Quick Commerce channels.',
      'Build creative testing frameworks with our design team, iterating rapidly on hooks, video reels, and parent testimonials.',
      'Optimize retention loops, email/WhatsApp CRM flows, subscription models, and lifetime customer value (LTV).',
      'Analyze customer unit economics (CAC, ROAS, blended payback periods) and report actionable insights directly to founders.'
    ],
    requirements: [
      'Proven track record scaling a D2C, mom-and-baby, or consumer health brand from early traction to ₹5Cr+ annual run rate.',
      'Deep expertise in Meta Ads Manager, Google Ads, GA4, Shopify/custom analytics, and Klaviyo/WhatsApp CRM.',
      'Numbers-obsessed mindset combined with intuitive consumer psychology understanding.',
      'High-energy, proactive, and resilient startup operator.'
    ]
  },
  {
    id: 'brand-designer',
    title: 'Lead Brand & Packaging Designer',
    department: 'Design & Creative',
    location: 'Remote / Mumbai (Hybrid)',
    type: 'Full-time',
    experience: '3-5 years',
    summary: 'Bring the playful universe of Wooff to life across sustainable packaging, unboxing experiences, mascot animations, and digital design systems.',
    responsibilities: [
      'Elevate Wooff’s visual identity across packaging cartons, tube artwork, retail displays, and PR unboxing kits.',
      'Direct character storytelling and playful micro-animations featuring our beloved monkey mascot.',
      'Create high-converting landing page layouts, web assets, and dynamic interactive storefront visuals.',
      'Partner closely with creative copywriters to craft charming, warm, and delightful brand moments.'
    ],
    requirements: [
      'A jaw-dropping portfolio demonstrating mastery in consumer packaging design, typography, and digital art.',
      'Proficiency in Adobe Illustrator, Photoshop, Figma, and 3D mockups (Blender or Cinema4D is a big plus).',
      'Passion for children’s books, playful illustration, and premium minimalist aesthetics.',
      'Thorough knowledge of prepress production, CMYK printing substrates, and eco-friendly packaging materials.'
    ]
  },
  {
    id: 'social-creator',
    title: 'Social Storyteller & Community Creator',
    department: 'Growth & Marketing',
    location: 'Remote / Mumbai',
    type: 'Full-time',
    experience: '2-4 years',
    summary: 'Be the authentic voice of Wooff on Instagram, YouTube, and LinkedIn — creating engaging reels, parent education content, and dentist interviews.',
    responsibilities: [
      'Conceptualize, shoot, and edit engaging short-form video content (Reels, TikToks, Shorts) debunking oral health myths.',
      'Build relationships with pediatric dentists, biological wellness advocates, and mindful parent creators.',
      'Engage authentically in comments, DMs, and parenting forums to foster an active, loyal brand community.',
      'Monitor viral parenting trends and turn customer questions into educational video moments.'
    ],
    requirements: [
      'Natural camera presence and exceptional mobile video editing skills (CapCut, Premiere, After Effects).',
      'Deep familiarity with Instagram culture, mom-influencer communities, and educational storytelling.',
      'Witty, empathetic, and relatable communication style with zero corporate jargon.',
      'Ability to move fast, test ideas rapidly, and learn from audience engagement data.'
    ]
  },
  {
    id: 'operations-fulfillment',
    title: 'Operations & Supply Chain Associate',
    department: 'Operations',
    location: 'Mumbai, India',
    type: 'Full-time',
    experience: '2-4 years',
    summary: 'Ensure every tube of Wooff reaches families on time, managing 3PL fulfillment, inventory levels, and logistics partners.',
    responsibilities: [
      'Manage day-to-day warehouse operations, order fulfillment workflows, and courier partner dispatch with Shiprocket/Delhivery.',
      'Maintain real-time inventory tracking, raw material procurement forecasting, and packaging buffer stocks.',
      'Resolve logistics exceptions, tracking escalations, and deliver delight to customers experiencing shipping delays.',
      'Work with manufacturing facilities to schedule batch runs and streamline batch release certificates.'
    ],
    requirements: [
      'Experience in Indian e-commerce fulfillment, logistics aggregators (Shiprocket, Bluedart, Delhivery), and inventory management.',
      'Meticulous attention to detail and strong spreadsheet / ERP skills.',
      'Resourceful problem solver with customer-first mindset.'
    ]
  }
];

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
  const [selectedDept, setSelectedDept] = useState('All');
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [applicationRole, setApplicationRole] = useState(null);

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

  const departments = ['All', 'Product & R&D', 'Growth & Marketing', 'Design & Creative', 'Operations'];

  const filteredJobs = selectedDept === 'All'
    ? JOB_OPENINGS
    : JOB_OPENINGS.filter((job) => job.department === selectedDept);

  const toggleJob = (id) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

  const handleApplyClick = (job) => {
    setApplicationRole(job.title);
    setSubmitSuccess(false);
    setSubmitError(null);
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

    const targetPosition = applicationRole || 'General Application / Open Pitch';
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
            <i className="fa-solid fa-sparkles me-1"></i> WE'RE HIRING • GROW WITH US
          </span>
          <h2 className="careers-hero-title">
            Help Us Turn Brushing Battles <br className="d-none d-md-block" />
            Into Daily Moments of Joy
          </h2>
          <p className="careers-hero-lead">
            We are reinventing kids’ daily oral care with clean science, biocompatible nano-hydroxyapatite,
            and irresistible chocolate taste. We are looking for curious minds, passionate creators, and empathetic
            builders who want to build India's most beloved pediatric oral care brand.
          </p>
          <div className="careers-hero-actions">
            <a href="#open-roles" className="btn-wooff-primary">
              Explore Open Positions <i className="fa-solid fa-arrow-down ms-2"></i>
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
            <span className="section-sub-badge">CURRENT OPPORTUNITIES</span>
            <h3 className="section-main-heading">Find Your Place in the Pack</h3>
            <p className="section-lead-text">
              We are actively expanding across product R&D, brand storytelling, performance marketing, and operations.
            </p>
          </div>

          {/* Department Filter Tabs */}
          <div className="job-filters-wrap">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                className={`filter-pill-btn ${selectedDept === dept ? 'active' : ''}`}
                onClick={() => setSelectedDept(dept)}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Jobs List */}
          <div className="job-openings-list">
            {filteredJobs.length === 0 ? (
              <div className="no-jobs-card text-center">
                <i className="fa-solid fa-mug-hot no-jobs-icon"></i>
                <h4>No open roles in this department right now</h4>
                <p>Don't let that stop you! Send us an open pitch using the application form below.</p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isExpanded = expandedJobId === job.id;
                return (
                  <div className={`job-listing-card ${isExpanded ? 'is-open' : ''}`} key={job.id}>
                    <div className="job-card-header" onClick={() => toggleJob(job.id)}>
                      <div className="job-header-info">
                        <div className="job-meta-tags">
                          <span className="job-dept-tag">{job.department}</span>
                          <span className="job-type-tag">{job.type}</span>
                          <span className="job-loc-tag">
                            <i className="fa-solid fa-location-dot me-1"></i>
                            {job.location}
                          </span>
                        </div>
                        <h4 className="job-title">{job.title}</h4>
                        <p className="job-summary">{job.summary}</p>
                      </div>

                      <div className="job-header-action">
                        <button
                          type="button"
                          className="btn-toggle-job"
                          aria-label={isExpanded ? 'Collapse job details' : 'Expand job details'}
                        >
                          <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="job-details-drawer">
                        <hr className="job-drawer-divider" />
                        
                        <div className="job-spec-grid">
                          <div className="job-spec-col">
                            <h5 className="job-spec-title">
                              <i className="fa-solid fa-list-check me-2"></i> What You'll Do
                            </h5>
                            <ul className="job-spec-list">
                              {job.responsibilities.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="job-spec-col">
                            <h5 className="job-spec-title">
                              <i className="fa-solid fa-star me-2"></i> What We're Looking For
                            </h5>
                            <ul className="job-spec-list">
                              {job.requirements.map((req, i) => (
                                <li key={i}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="job-apply-footer">
                          <button
                            type="button"
                            className="btn-apply-role"
                            onClick={() => handleApplyClick(job)}
                          >
                            Apply for {job.title} <i className="fa-solid fa-paper-plane ms-2"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 5. Interactive Application Form */}
      <section ref={formSectionRef} className="careers-apply-section">
        <div className="careers-container">
          <div className="apply-card-wrapper">
            <div className="apply-head text-center">
              <span className="apply-pill">EASY APPLICATION</span>
              <h3 className="apply-title">
                {applicationRole ? `Apply for: ${applicationRole}` : 'Submit Your Application / Dream Role'}
              </h3>
              <p className="apply-subtitle">
                Fill out the form below or email your resume to{' '}
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
