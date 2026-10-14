import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Banner from '../../components/Banner/Banner';
import './About.css';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export default function About() {
  const wrapperRef = useRef(null);
  const pathRef = useRef(null);
  const carRef = useRef(null);
  const animTimeline = useRef(null);

  const [pathD, setPathD] = useState('');
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });
  const [svgLoaded, setSvgLoaded] = useState(false);

  const timelineData = [
    {
      year: '',
      badge: '',
      title: 'Where the morning battle began',
      text: 'As a dentist, one question I was constantly asked by parents was, "Which toothpaste is best for my child?" But behind that question was a bigger problem. Kids didn\'t want to brush their teeth. Mornings were full of tantrums, negotiations, and the daily struggle of getting children to brush. I wanted to find a way to make brushing something kids would actually look forward to. Funny enough, paediatric dentistry was the department I used to struggle with the most in college. Seeing children in pain was something I never liked. And perhaps that was one of the reasons I wanted to create something that could make their oral-care journey a little happier.',
      image: '/images/founders-car.webp',
      caption: 'The pediatric oral care struggle'
    },
    {
      year: 'February 2026',
      badge: '',
      title: 'New era of oral care',
      text: 'But the more I researched, the more I realised I didn\'t just want to make toothpaste that tasted good. I wanted to create better oral care for Indian kids. As a dentist, I knew oral health wasn\'t just about teeth. The gums, soft tissues, and the oral microbiome matter too. So I began exploring ingredients beyond conventional toothpaste formulations, including nano-hydroxyapatite, prebiotics, vitamins, lactoferrin, and antioxidants. I wanted to bring together a delicious brushing experience and a thoughtfully developed formula that considered children\'s overall oral health. And that\'s how we began building our hero formulation for Woof Kids.',
      image: '/images/research-notes.webp',
      caption: 'Discovering Theobromine & Natural Cocoa Extract'
    },
    {
      year: 'May - July 2026',
      badge: '',
      title: 'Making a brand out of our idea',
      text: 'Then came the real work: speaking to manufacturers, researching ingredients, testing formulations, reviewing sample after sample, and refining everything until we found the right combination. At the same time, we were creating a design that children would connect with. That\'s where our little monkey came in. Monkeys are known for imitation, and we loved the idea that children might see our monkey brushing its teeth and want to imitate it.',
      image: '/images/packaging-samples.webp',
      caption: 'Formulating with nHAp & Prebiotic Nutrients'
    },
    {
      year: 'September 2026',
      badge: '',
      title: 'Brushing just got delicious!',
      text: 'After months of formulation, testing, and refining, Wooff Kids was officially born. A dentist-created kids toothpaste designed around one simple belief: brushing shouldn\'t be a battle — it should be a fun, delicious moment kids look forward to and parents feel 100% confident about!',
      image: '/assets/IMG_5916.webp',
      caption: 'Official Launch — 100% Prebiotic Oral Care'
    }
  ];

  const updateTimelinePath = () => {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    const wrapperRect = wrapper.getBoundingClientRect();
    const nodeEls = wrapper.querySelectorAll('.timeline-node-dot');
    if (!nodeEls || nodeEls.length === 0) return;

    const points = [];
    nodeEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      points.push({
        x: rect.left + rect.width / 2 - wrapperRect.left,
        y: rect.top + rect.height / 2 - wrapperRect.top
      });
    });

    if (points.length < 2) return;

    const isMobile = window.innerWidth <= 868;
    // Desktop: generous organic 44px wave; Mobile: subtle 12px wave through center column
    const swing = isMobile ? 12 : 44;

    // Start directly at the first milestone dot (starting point)
    const startX = points[0].x;
    const startY = points[0].y;

    let path = `M ${startX.toFixed(1)} ${startY.toFixed(1)}`;

    // Alternating curve directions: +1 (right), -1 (left), +1 (right), -1 (left)
    const directions = [1, -1, 1, -1];

    for (let i = 0; i < points.length - 1; i++) {
      const pA = points[i];
      const pB = points[i + 1];
      const dir = directions[i % directions.length];
      const dy = pB.y - pA.y;
      const midY = (pA.y + pB.y) / 2;
      const midX = (pA.x + pB.x) / 2 + dir * swing;

      // Spline from pA to (midX, midY)
      path += ` C ${pA.x.toFixed(1)} ${(pA.y + dy * 0.22).toFixed(1)}, ${midX.toFixed(1)} ${(midY - dy * 0.22).toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;

      // Spline from (midX, midY) to pB
      path += ` C ${midX.toFixed(1)} ${(midY + dy * 0.22).toFixed(1)}, ${pB.x.toFixed(1)} ${(pB.y - dy * 0.22).toFixed(1)}, ${pB.x.toFixed(1)} ${pB.y.toFixed(1)}`;
    }

    setPathD(path);
    setSvgSize({ width: wrapperRect.width, height: wrapperRect.height });
  };

  // Recalculate path on mount, resize, and DOM changes
  useEffect(() => {
    updateTimelinePath();

    const ro = new ResizeObserver(() => {
      updateTimelinePath();
    });

    if (wrapperRef.current) {
      ro.observe(wrapperRef.current);
    }

    window.addEventListener('resize', updateTimelinePath);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateTimelinePath);
    };
  }, []);

  // Fetch provided Wooff founders car SVG with transparent background
  useEffect(() => {
    let isMounted = true;
    fetch('/assets/wooff_founders_car_illustration_no_background.svg')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load wooff_founders_car_illustration_no_background.svg');
        return res.text();
      })
      .then((svgText) => {
        if (!isMounted || !carRef.current) return;
        carRef.current.innerHTML = `
          <div class="timeline-car-svg-wrap">${svgText}</div>
        `;
        const svg = carRef.current.querySelector('svg');
        if (svg) {
          svg.removeAttribute('width');
          svg.removeAttribute('height');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.display = 'block';
        }
        setSvgLoaded(true);
      })
      .catch((err) => {
        console.error('Error loading car SVG:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize GSAP ScrollTrigger animation for the car along the curved path
  useEffect(() => {
    if (!svgLoaded || !pathD || !carRef.current || !pathRef.current || !wrapperRef.current) {
      return;
    }

    const carEl = carRef.current;
    const pathEl = pathRef.current;
    const rearWheel = carEl.querySelector('#rear-wheel');
    const frontWheel = carEl.querySelector('#front-wheel');

    // Clean up previous timeline and triggers
    if (animTimeline.current) {
      animTimeline.current.kill();
    }
    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars.id && st.vars.id.startsWith('timeline-')) {
        st.kill();
      }
    });

    gsap.set(carEl, { visibility: 'visible' });

    if (rearWheel) {
      gsap.set(rearWheel, { transformBox: 'view-box' });
    }
    if (frontWheel) {
      gsap.set(frontWheel, { transformBox: 'view-box' });
    }

    const nodeEls = wrapperRef.current.querySelectorAll('.timeline-node-dot');
    const firstDot = nodeEls[0];
    const lastDot = nodeEls[nodeEls.length - 1];

    // Place car directly at the first milestone node (starting point) immediately
    gsap.set(carEl, {
      motionPath: {
        path: pathEl,
        align: pathEl,
        alignOrigin: [0.5, 0.5],
        start: 0,
        end: 0,
        autoRotate: false,
      },
      visibility: 'visible',
    });

    const tl = gsap.timeline({
      id: 'timeline-car-main',
      scrollTrigger: {
        trigger: firstDot || wrapperRef.current,
        start: 'center 50%',
        endTrigger: lastDot || wrapperRef.current,
        end: 'center 50%',
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    // Animate car along the exact curved timeline path starting right at the first node
    tl.to(carEl, {
      motionPath: {
        path: pathEl,
        align: pathEl,
        alignOrigin: [0.5, 0.5],
        autoRotate: false, // Keep car upright and natural
      },
      immediateRender: true,
      ease: 'none',
      duration: 1,
    }, 0);

    // Synchronize independent wheel rotation around their own rotation centers
    if (rearWheel) {
      tl.to(rearWheel, {
        rotation: 360 * 10,
        transformOrigin: '297px 740px',
        ease: 'none',
        duration: 1,
      }, 0);
    }

    if (frontWheel) {
      tl.to(frontWheel, {
        rotation: 360 * 10,
        transformOrigin: '1001px 744px',
        ease: 'none',
        duration: 1,
      }, 0);
    }

    animTimeline.current = tl;

    // Story milestones: subtle activation as car passes each year
    const rowEls = wrapperRef.current.querySelectorAll('.timeline-row');
    rowEls.forEach((rowEl, idx) => {
      ScrollTrigger.create({
        id: `timeline-milestone-${idx}`,
        trigger: rowEl,
        start: 'top 55%',
        end: 'bottom 45%',
        toggleClass: { targets: rowEl, className: 'milestone-active' },
      });
      ScrollTrigger.create({
        id: `timeline-milestone-reached-${idx}`,
        trigger: rowEl,
        start: 'top 55%',
        onEnter: () => rowEl.classList.add('milestone-reached'),
        onLeaveBack: () => rowEl.classList.remove('milestone-reached'),
      });
    });

    ScrollTrigger.refresh();

    return () => {
      if (animTimeline.current) {
        animTimeline.current.kill();
      }
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.id && st.vars.id.startsWith('timeline-')) {
          st.kill();
        }
      });
    };
  }, [svgLoaded, pathD]);

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

        {/* 2. Brewskin Timeline Container with Curvy Spine */}
        <section className="timeline-journey-wrapper" ref={wrapperRef}>
          {/* Curvy Path SVG */}
          {svgSize.width > 0 && svgSize.height > 0 && (
            <svg
              className="timeline-curvy-svg"
              width={svgSize.width}
              height={svgSize.height}
              viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
            >
              <path
                id="timelineCurvedPath"
                ref={pathRef}
                d={pathD}
                className="timeline-curvy-path"
              />
            </svg>
          )}

          {/* Animated Wooff Founders Car along the Curvy Timeline Path */}
          <div
            ref={carRef}
            className="timeline-animated-car"
            aria-label="Wooff founders car traveling along timeline"
          />

          <div className="timeline-items-list">
            {timelineData.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={item.badge || item.year || index} className={`timeline-row ${isEven ? 'row-left' : 'row-right'}`}>

                  {/* Left Column Content */}
                  <div className="timeline-col col-content-left">
                    {isEven ? (
                      <div className="story-img-card-wrap">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="story-timeline-img"
                          onLoad={updateTimelinePath}
                        />
                        <span className="story-img-caption">{item.caption}</span>
                      </div>
                    ) : (
                      <div className="story-text-card">
                        {item.year ? <span className="story-card-date-badge">{item.year}</span> : null}
                        {item.badge ? <span className="timeline-section-badge">{item.badge}</span> : null}
                        <h2>{item.title}</h2>
                        <div className="story-divider-rule"></div>
                        <p>{item.text}</p>
                        {item.author && <span className="story-author-tag"><i className="fa-solid fa-user-doctor me-2"></i>{item.author}</span>}
                      </div>
                    )}
                  </div>

                  {/* Center Node: Year & Dot on curvy line */}
                  <div className="timeline-center-node">
                    {item.year ? <span className="timeline-year-text">{item.year}</span> : null}
                    <div className="timeline-node-dot"></div>
                  </div>

                  {/* Right Column Content */}
                  <div className="timeline-col col-content-right">
                    {isEven ? (
                      <div className="story-text-card">
                        {item.year ? <span className="story-card-date-badge">{item.year}</span> : null}
                        {item.badge ? <span className="timeline-section-badge">{item.badge}</span> : null}
                        <h2>{item.title}</h2>
                        <div className="story-divider-rule"></div>
                        <p>{item.text}</p>
                        {item.author && <span className="story-author-tag"><i className="fa-solid fa-user-doctor me-2"></i>{item.author}</span>}
                      </div>
                    ) : (
                      <div className="story-img-card-wrap">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="story-timeline-img"
                          onLoad={updateTimelinePath}
                        />
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
              &ldquo;As a dentist, I saw how something as essential as brushing became a daily struggle for parents and kids. I created Wooff Kids to turn brushing battles into joyful moments with flavours kids love and thoughtfully formulated oral care that parents can trust.&rdquo;
            </blockquote>
            <div className="founder-signature-block">
              <div className="founder-avatar-circle">
                <img 
                  src="/images/dr-shrushti-avatar.webp" 
                  alt="Dr. Shrushti Bhankhariya" 
                  className="founder-photo-img" 
                  loading="lazy"
                />
              </div>
              <div className="founder-details">
                <h3>Dr. Shrushti Bhankhariya</h3>
                <p>Dentist &amp; Founder</p>
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
