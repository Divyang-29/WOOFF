import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import { getEnrichedBlog, RICH_ARTICLES } from './blogArticleData';
import './SingleBlog.css';

function getInitialBlogData(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).trim().toLowerCase();

  // 1. Direct key match
  let rich = RICH_ARTICLES[cleanSlug];

  // 2. Slug match across all RICH_ARTICLES values
  if (!rich) {
    rich = Object.values(RICH_ARTICLES).find(
      (a) => a.slug === cleanSlug || String(a.id) === cleanSlug
    );
  }

  // 3. Fuzzy fallback to ensure 0ms render without failure
  if (!rich) {
    if (cleanSlug.includes('choco-flavoured') || cleanSlug.includes('choco-toothpaste') || cleanSlug.includes('treat') || cleanSlug.includes('fights')) {
      rich = RICH_ARTICLES['choco-flavoured-toothpaste'];
    } else if (cleanSlug.includes('flavoured') || cleanSlug.includes('guide')) {
      rich = RICH_ARTICLES['chocolate-flavoured-toothpaste'];
    } else if (cleanSlug.includes('parents') || cleanSlug.includes('know')) {
      rich = RICH_ARTICLES['chocolate-toothpaste'];
    } else {
      rich = RICH_ARTICLES['choco-flavoured-toothpaste'] || Object.values(RICH_ARTICLES)[0];
    }
  }

  if (!rich) return null;

  const basePost = {
    id: cleanSlug,
    slug: cleanSlug,
    title: rich.title,
    image_url: rich.image_url || '/assets/choco-toothpaste-pieces.webp',
    author: rich.author?.name || 'Wooff Team',
    author_role: rich.author?.role || 'Pediatric Oral Care Team',
    author_bio: rich.author?.bio,
    author_avatar: rich.author?.avatar,
    created_at: rich.updated_at || new Date().toISOString(),
    content: rich.excerpt,
    category: rich.category,
    tags: rich.tags,
    disclaimer: rich.disclaimer,
  };
  return getEnrichedBlog(basePost, []);
}

export default function SingleBlog() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug === 'choco-toothpaste') {
      navigate('/blog/choco-flavoured-toothpaste', { replace: true });
    }
  }, [slug, navigate]);

  const initialData = getInitialBlogData(slug);
  const [blog, setBlog] = useState(initialData);
  const [allBlogs, setAllBlogs] = useState([]);
  const [error, setError] = useState(null);

  // Interactive Features State
  const [openFaq, setOpenFaq] = useState(null);
  const [tags, setTags] = useState(initialData?.tags || []);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTocId, setActiveTocId] = useState('');
  const [isTocOpen, setIsTocOpen] = useState(true);

  // Interactive Comments State (Real user comments only, no fake data)
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '' });
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  // Instant render & background sync
  useEffect(() => {
    let isMounted = true;
    const immediate = getInitialBlogData(slug);

    if (immediate) {
      setBlog(immediate);
      setTags(immediate.tags || []);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      setError(null);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const revalidate = async () => {
      try {
        const baseUrl = API_ENDPOINTS?.BLOGS || '/api/blogs';
        const [singleRes, allRes] = await Promise.allSettled([
          fetch(`${baseUrl}/${slug}`, { signal: controller.signal }),
          fetch(baseUrl, { signal: controller.signal }),
        ]);

        let serverPost = null;
        if (singleRes.status === 'fulfilled' && singleRes.value.ok) {
          const data = await singleRes.value.json();
          serverPost = data?.blog || data;
        }

        let blogList = [];
        if (allRes.status === 'fulfilled' && allRes.value.ok) {
          const allData = await allRes.value.json();
          blogList = Array.isArray(allData) ? allData : allData?.blogs || [];
        }

        if (isMounted) {
          if (blogList.length > 0) {
            setAllBlogs(blogList);
          }
          if (serverPost) {
            const enriched = getEnrichedBlog(serverPost, blogList);
            setBlog(enriched);
            setTags(enriched.tags || []);
          } else if (!immediate) {
            setError('Blog article not found.');
          }
        }
      } catch (err) {
        if (isMounted && !immediate) {
          setError('Failed to load article');
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    revalidate();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
      const scriptTag = document.getElementById('blog-schema-ld');
      if (scriptTag) scriptTag.remove();
    };
  }, [slug]);

  // Document Title, Meta Description & Schema.org Article LD+JSON
  useEffect(() => {
    if (!blog) return;

    const pageTitle = blog.meta_title || `${blog.title} | Wooff`;
    const pageDesc = blog.meta_description || blog.excerpt || '';

    document.title = pageTitle;

    // Standard meta description
    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'description';
      document.head.appendChild(metaTag);
    }
    if (pageDesc) {
      metaTag.setAttribute('content', pageDesc);
    }

    // Open Graph & Twitter Descriptions
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && pageDesc) ogDesc.setAttribute('content', pageDesc);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc && pageDesc) twitterDesc.setAttribute('content', pageDesc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', pageTitle);

    if (blog.canonical_url) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', blog.canonical_url);
      }
    }

    let scriptTag = document.getElementById('blog-schema-ld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'blog-schema-ld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    const schemaGraph = [
      {
        "@type": "Article",
        "headline": blog.title,
        "description": blog.meta_description || blog.excerpt,
        "author": {
          "@type": "Organization",
          "name": blog.author_profile?.name || blog.author || "Wooff"
        },
        "about": blog.category || "Kids Oral Care",
        "datePublished": blog.created_at || new Date().toISOString()
      }
    ];

    if (blog.faqs && blog.faqs.length > 0) {
      schemaGraph.push({
        "@type": "FAQPage",
        "mainEntity": blog.faqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      });
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": schemaGraph
    };
    scriptTag.textContent = JSON.stringify(schemaData);
  }, [blog]);

  // Active TOC Section Highlighter
  useEffect(() => {
    if (!blog?.sections?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    blog.sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    const faqEl = document.getElementById('faq-section');
    if (faqEl) observer.observe(faqEl);

    const concEl = document.getElementById('conclusion');
    if (concEl) observer.observe(concEl);

    return () => observer.disconnect();
  }, [blog]);

  // Date Formatter
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };


  // Copy Link Handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Comment Submit Handler
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.comment.trim()) return;

    const newComment = {
      id: Date.now(),
      name: commentForm.name.trim(),
      role: 'Verified Reader',
      date: 'Just now',
      content: commentForm.comment.trim(),
    };

    setComments([newComment, ...comments]);
    setCommentForm({ name: '', email: '', comment: '' });
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 4000);
  };

  const currentUrl = encodeURIComponent(window.location.href);
  const articleTitle = encodeURIComponent(blog?.title || 'Wooff Journal Article');

  return (
    <div className="single-blog-page-wrapper">
      <Banner
        breadcrumb={
          blog
            ? `HOME / BLOG / ${blog.category ? blog.category.toUpperCase() : 'ARTICLE'}`
            : 'HOME / BLOG / ARTICLE'
        }
        title={blog?.title || 'The Journal'}
      />

      <div className="single-blog-container">
        {/* Error State */}
        {!blog && error && (
          <div className="single-blog-error">
            <h2>Article Not Found</h2>
            <p>{error}</p>
            <Link to="/blog" className="btn-wooff-primary">
              Return to Journal
            </Link>
          </div>
        )}

        {blog && (
          <article className="single-blog-article">

            {/* 3. Meta Information Bar */}
            <div className="single-blog-meta-card">
              <div className="meta-author-wrap">
                <img
                  src={blog.author_profile?.avatar ? blog.author_profile.avatar.replace(/\.(png|jpg|jpeg)$/i, '.webp') : '/assets/wooff-logo.webp'}
                  alt={blog.author_profile?.name || blog.author}
                  className="meta-author-avatar"
                  onError={(e) => { e.currentTarget.src = '/assets/wooff-logo.webp'; }}
                />
                <div className="meta-author-text">
                  <span className="meta-author-name">
                    {blog.author_profile?.name || blog.author}
                    <i className="fa-solid fa-circle-check verified-icon" title="Verified Dental Expert" />
                  </span>
                  <span className="meta-author-role">{blog.author_profile?.role || 'Pediatric Dental Contributor'}</span>
                </div>
              </div>

              <div className="meta-specs-wrap">
                <div className="meta-spec-item" title="Date Published">
                  <i className="fa-regular fa-calendar" />
                  <span>{formatDate(blog.created_at)}</span>
                </div>
                {blog.updated_at && blog.updated_at !== blog.created_at && (
                  <div className="meta-spec-item text-muted" title="Last Updated">
                    <i className="fa-solid fa-clock-rotate-left" />
                    <span>Updated {formatDate(blog.updated_at)}</span>
                  </div>
                )}
                <div className="meta-spec-item" title="Reading Time">
                  <i className="fa-regular fa-clock" />
                  <span>{blog.reading_time}</span>
                </div>
                <div className="meta-spec-item category-badge-wrap">
                  <span className="blog-category-tag">{blog.category}</span>
                </div>
              </div>
            </div>

            {/* Tags Row */}
            {tags && tags.length > 0 && (
              <div className="blog-tags-bar">
                <div className="tags-label">
                  <i className="fa-solid fa-tags" /> Tags:
                </div>
                <div className="tags-chips-list">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="blog-tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Featured Hero Image with Caption */}
            <div className="single-blog-hero-image-container">
              <img
                src={blog.image_url || '/assets/tooth_paste.webp'}
                alt={blog.title}
                className="single-blog-hero-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/tooth_paste.webp';
                }}
              />
            </div>
            {blog.image_caption && (
              <p className="single-blog-image-caption">
                <i className="fa-solid fa-camera me-1" /> {blog.image_caption}
              </p>
            )}

            {/* Floating / Sticky Social Share Toolbar */}
            <div className="blog-social-share-strip">
              <span className="share-strip-title">Share Article:</span>
              <a
                href={`https://api.whatsapp.com/send?text=${articleTitle}%20${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn whatsapp"
                title="Share on WhatsApp"
              >
                <i className="fa-brands fa-whatsapp" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${articleTitle}&url=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn twitter"
                title="Share on X"
              >
                <i className="fa-brands fa-x-twitter" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn facebook"
                title="Share on Facebook"
              >
                <i className="fa-brands fa-facebook-f" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn linkedin"
                title="Share on LinkedIn"
              >
                <i className="fa-brands fa-linkedin-in" />
              </a>
              <button
                type="button"
                className="share-btn copy-link"
                onClick={handleCopyLink}
                title="Copy Article Link"
              >
                <i className={`fa-solid ${copiedLink ? 'fa-check' : 'fa-link'}`} />
              </button>
              {copiedLink && <span className="copy-link-toast">Link Copied!</span>}
            </div>

            {/* 5. Short Introduction / Excerpt */}
            {blog.introHtml ? (
              <div className="single-blog-intro-content mb-4" dangerouslySetInnerHTML={{ __html: blog.introHtml }} />
            ) : blog.excerpt ? (
              <div className="single-blog-lead-box">
                <div className="lead-icon"><i className="fa-solid fa-quote-left" /></div>
                <p className="lead-text">{blog.excerpt}</p>
              </div>
            ) : null}

            {/* 6. Table of Contents */}
            {blog.toc && blog.toc.length > 0 && (
              <div className={`single-blog-toc-card ${isTocOpen ? 'is-open' : 'is-collapsed'}`}>
                <div
                  className="toc-header"
                  onClick={() => setIsTocOpen(!isTocOpen)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsTocOpen(!isTocOpen); }}
                >
                  <div className="toc-header-left">
                    <span className="toc-icon">📑</span>
                    <h3 className="toc-title">Table of Contents</h3>
                    <span className="toc-count-pill">{blog.toc.length} sections</span>
                  </div>
                  <button
                    type="button"
                    className="toc-toggle-btn"
                    aria-label={isTocOpen ? 'Collapse table of contents' : 'Expand table of contents'}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isTocOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
                {isTocOpen && (
                  <ul className="toc-list">
                    {blog.toc.map((item) => (
                      <li key={item.id} className={activeTocId === item.id ? 'active' : ''}>
                        <a
                          href={`#${item.id}`}
                          onClick={() => {
                            if (window.innerWidth < 768) {
                              setIsTocOpen(false);
                            }
                          }}
                        >
                          <span className="toc-dot">•</span>
                          <span className="toc-item-text">{item.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 7. Main Article Sections (H2, H3, Paragraphs, Images, Lists, Tables, Examples) */}
            <div className="single-blog-main-content">
              {blog.sections && blog.sections.map((section, sIdx) => (
                <section key={section.id || sIdx} id={section.id} className="article-section-block">
                  <h2 className="article-h2">{section.title}</h2>

                  {section.bodyHtml ? (
                    <div className="article-body-html" dangerouslySetInnerHTML={{ __html: section.bodyHtml }} />
                  ) : (
                    <>
                      {section.paragraphs && section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="article-paragraph" dangerouslySetInnerHTML={{ __html: p }} />
                      ))}

                      {/* Subsections (H3) */}
                      {section.subsections && section.subsections.map((sub, subIdx) => (
                        <div key={subIdx} className="article-subsection-block mt-3 mb-4">
                          <h3 className="article-h3 mb-2">{sub.title}</h3>
                          <p className="article-paragraph" dangerouslySetInnerHTML={{ __html: sub.content }} />
                        </div>
                      ))}

                      {/* Inline Section Image */}
                      {section.image && (
                        <div className="article-inline-image-wrapper my-4">
                          <img
                            src={typeof section.image === 'string' ? section.image : section.image.url}
                            alt={section.image?.alt || section.title}
                            className="article-inline-image"
                            style={{ width: '100%', borderRadius: '16px', objectFit: 'cover' }}
                          />
                          {section.image?.caption && (
                            <p className="single-blog-image-caption mt-2">
                              <i className="fa-solid fa-camera me-1" /> {section.image.caption}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Editorial Quote */}
                      {section.quote && (
                        <blockquote className="article-editorial-quote">
                          <p>{section.quote}</p>
                          <cite>— Wooff Clinical Research Division</cite>
                        </blockquote>
                      )}

                      {/* Pro-Tip Callout Box */}
                      {section.callout && (
                        <div className="article-pro-tip-box">
                          <div className="pro-tip-badge">
                            <i className="fa-solid fa-lightbulb" /> {section.callout.title}
                          </div>
                          <p className="pro-tip-text">{section.callout.text}</p>
                        </div>
                      )}

                      {/* Custom List */}
                      {section.list && (
                        <div className="article-features-checklist">
                          <ul>
                            {section.list.map((li, lIdx) => (
                              <li key={lIdx}>
                                <i className="fa-solid fa-circle-check checklist-icon" />
                                <span dangerouslySetInnerHTML={{ __html: li }} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Responsive Comparison Table */}
                      {section.table && (
                        <div className="article-table-responsive-wrapper">
                          <div className="table-heading-label">{section.table.title || 'Clinical Data Comparison'}</div>
                          <table className="article-comparison-table">
                            <thead>
                              <tr>
                                {section.table.headers.map((h, hIdx) => (
                                  <th key={hIdx} dangerouslySetInnerHTML={{ __html: h }} />
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.table.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className={cIdx === 0 ? 'metric-name' : cIdx === 2 ? 'wooff-highlight' : ''} dangerouslySetInnerHTML={{ __html: cell }} />
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}

                  {/* Custom Links */}
                  {section.customLinks && (
                    <div className="article-custom-links-row mt-3 mb-4">
                      {section.customLinks.map((lnk, lIdx) => (
                        <Link key={lIdx} to={lnk.url} className="article-inline-link me-4">
                          {lnk.text} &rarr;
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* 8. FAQ Section */}
            {blog.faqs && blog.faqs.length > 0 && (
              <section id="faq-section" className="blog-faq-section">
                <div className="faq-section-header">
                  <span className="faq-eyebrow">Expert Answers</span>
                  <h2 className="faq-title">Frequently Asked Questions</h2>
                </div>

                <div className="blog-faq-accordion-list">
                  {blog.faqs.map((faq, idx) => (
                    <div key={idx} className={`faq-card-item ${openFaq === idx ? 'expanded' : ''}`}>
                      <button
                        type="button"
                        className="faq-question-button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      >
                        <span className="faq-q-text">{faq.q}</span>
                        <span className="faq-toggle-icon">{openFaq === idx ? '−' : '+'}</span>
                      </button>
                      {openFaq === idx && (
                        <div className="faq-answer-pane">
                          <p dangerouslySetInnerHTML={{ __html: faq.a }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 9. Conclusion & Key Takeaways */}
            {blog.conclusion_takeaways && blog.conclusion_takeaways.length > 0 && (
              <section id="conclusion" className="blog-conclusion-section">
                <div className="conclusion-box">
                  <div className="conclusion-badge">
                    <i className="fa-solid fa-bookmark" /> Conclusion & Key Takeaways
                  </div>
                  <p className="conclusion-intro">
                    Empowering your family’s dental health starts with understanding biological ingredients over aggressive marketing:
                  </p>
                  <ul className="conclusion-takeaways-list">
                    {blog.conclusion_takeaways.map((point, idx) => (
                      <li key={idx}>
                        <i className="fa-solid fa-shield-halved takeaway-icon" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* 10. Clinical Disclaimer & Accuracy Notice */}
            {blog.disclaimer && (
              <div className="blog-clinical-disclaimer-card">
                <i className="fa-solid fa-circle-info me-2" />
                <small>{blog.disclaimer}</small>
              </div>
            )}

            {/* 11. Author Box */}
            <div className="blog-author-profile-card">
              <div className="author-card-avatar-wrap">
                <img
                  src={blog.author_profile?.avatar ? blog.author_profile.avatar.replace(/\.(png|jpg|jpeg)$/i, '.webp') : '/assets/wooff-logo.webp'}
                  alt={blog.author_profile?.name || blog.author}
                  className="author-card-avatar"
                  onError={(e) => { e.currentTarget.src = '/assets/wooff-logo.webp'; }}
                />
              </div>
              <div className="author-card-info">
                <span className="author-card-eyebrow">About the Author</span>
                <h3 className="author-card-name">{blog.author_profile?.name || blog.author}</h3>
                <p className="author-card-credentials">{blog.author_profile?.role}</p>
                <p className="author-card-bio">{blog.author_profile?.bio}</p>
                <div className="author-card-signatures">
                  <span className="verified-author-badge">
                    <i className="fa-solid fa-award" /> Peer Reviewed & Formulated with Integrity
                  </span>
                </div>
              </div>
            </div>

            {/* 11. Internal Links / Product Recommendation Spotlight */}
            <div className="blog-product-recommendation-card">
              <div className="prod-rec-content">
                <span className="prod-rec-tag">Recommended Pediatric Formula</span>
                <h3 className="prod-rec-title">Wooff Kids Prebiotic Choco Toothpaste with 2% nHAp</h3>
                <p className="prod-rec-desc">
                  Experience the exact science discussed in this article. 100% bio-identical nano-hydroxyapatite and organic theobromine rebuild enamel safely without any warning labels.
                </p>
                <div className="prod-rec-actions">
                  <Link to="/product/choco-toothpaste" className="btn-pill-3d">
                    Shop Formula • ₹249
                  </Link>
                  <Link to="/products" className="btn-view-all-products">
                    View All Products →
                  </Link>
                </div>
              </div>
              <div className="prod-rec-image-wrap">
                <img src="/assets/FDP02904.webp" alt="Wooff Choco Toothpaste" className="prod-rec-img" />
              </div>
            </div>

            {/* 12. Related Articles Grid */}
            {blog.relatedArticles && blog.relatedArticles.length > 0 && (
              <section className="blog-related-section">
                <div className="related-section-header">
                  <span className="related-eyebrow">More From The Journal</span>
                  <h3 className="related-title">Related Clinical Articles</h3>
                </div>

                <div className="related-articles-grid">
                  {blog.relatedArticles.map((rel) => (
                    <article key={rel.slug || rel.id} className="related-article-card">
                      <Link to={`/blog/${rel.slug}`} className="related-card-img-link">
                        <img
                          src={rel.image_url || '/assets/tooth_paste.webp'}
                          alt={rel.title}
                          className="related-card-img"
                          onError={(e) => { e.currentTarget.src = '/assets/tooth_paste.webp'; }}
                        />
                      </Link>
                      <div className="related-card-body">
                        <div className="related-card-meta">
                          <span className="related-card-author">{rel.author}</span>
                          <span className="related-card-date">{formatDate(rel.created_at)}</span>
                        </div>
                        <h4 className="related-card-title">
                          <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                        </h4>
                        <Link to={`/blog/${rel.slug}`} className="related-read-more-link">
                          Read Article <span>→</span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* 13. Comments Section (Interactive Discussion) */}
            <section className="blog-comments-section">
              <div className="comments-header">
                <div className="comments-header-left">
                  <i className="fa-solid fa-comments me-2" />
                  <h3 className="comments-title">
                    Discussion & Questions {comments.length > 0 ? `(${comments.length})` : ''}
                  </h3>
                </div>
                <span className="comments-subtitle">Join the dental wellness conversation</span>
              </div>

              {/* Leave a Comment Form */}
              <form onSubmit={handleCommentSubmit} className="blog-comment-form">
                <h4 className="form-legend">Leave a Reply</h4>
                {commentSubmitted && (
                  <div className="comment-success-alert">
                    <i className="fa-solid fa-circle-check me-2" />
                    Thank you! Your comment has been posted to the discussion thread.
                  </div>
                )}
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="comment-name">Your Name *</label>
                    <input
                      id="comment-name"
                      type="text"
                      required
                      placeholder="e.g. Rachel Green"
                      value={commentForm.name}
                      onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="comment-email">Your Email (Optional)</label>
                    <input
                      id="comment-email"
                      type="email"
                      placeholder="name@example.com"
                      value={commentForm.email}
                      onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group mt-3">
                  <label htmlFor="comment-text">Your Comment or Question *</label>
                  <textarea
                    id="comment-text"
                    rows={4}
                    required
                    placeholder="Share your thoughts or ask our dental research team a question..."
                    value={commentForm.comment}
                    onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-wooff-primary mt-3">
                  <i className="fa-solid fa-paper-plane me-2" /> Post Comment
                </button>
              </form>

              {/* Comments List */}
              <div className="blog-comments-list">
                {comments.length === 0 ? (
                  <div className="blog-no-comments-yet">
                    <i className="fa-regular fa-comment-dots me-2" />
                    <span>No comments yet. Be the first to share your thoughts or ask a question!</span>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="comment-bubble">
                      <div className="comment-avatar">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="comment-body">
                        <div className="comment-top">
                          <span className="comment-author-name">{c.name}</span>
                          {c.role && <span className="comment-role-pill">{c.role}</span>}
                          <span className="comment-date">{c.date}</span>
                        </div>
                        <p className="comment-text">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

          </article>
        )}
      </div>
    </div>
  );
}
