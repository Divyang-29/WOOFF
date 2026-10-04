import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import { getEnrichedBlog } from './blogArticleData';
import './SingleBlog.css';

export default function SingleBlog() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive Features State
  const [openFaq, setOpenFaq] = useState(null);
  const [tags, setTags] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTocId, setActiveTocId] = useState('');

  // Interactive Comments State
  const [comments, setComments] = useState([
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Verified Mom of 2',
      date: 'October 3, 2026',
      content: 'Switching to nHAp was the best decision we made for our 3-year-old. Her dentist noticed her early white spots remineralized completely within 3 months, and no more tears at night!',
    },
    {
      id: 2,
      name: 'Dr. Marcus Vance',
      role: 'Family Dentistry Practitioner',
      date: 'October 1, 2026',
      content: 'Excellent clinical explanation. The distinction between biomimetic mineral deposit versus chemical fluorapatite veneers is crucial for parents to understand. Sharing with my patients!',
    },
  ]);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '' });
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  // Fetch current blog and all blogs for related articles
  useEffect(() => {
    let isMounted = true;

    const fetchBlogData = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = API_ENDPOINTS?.BLOGS || '/api/blogs';
        
        // 1. Fetch current blog
        const res = await fetch(`${baseUrl}/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Blog article not found.');
          }
          throw new Error(`Failed to load article (HTTP ${res.status})`);
        }
        const data = await res.json();
        const basePost = data?.blog || data;

        // 2. Fetch all blogs for related posts
        let blogList = [];
        try {
          const allRes = await fetch(baseUrl);
          if (allRes.ok) {
            const allData = await allRes.json();
            blogList = Array.isArray(allData) ? allData : allData?.blogs || [];
          }
        } catch (e) {
          console.warn('Could not fetch related blogs list:', e);
        }

        if (isMounted) {
          const enriched = getEnrichedBlog(basePost, blogList);
          setBlog(enriched);
          setTags(enriched.tags || []);
          setAllBlogs(blogList);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching blog details:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load article');
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchBlogData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

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
      <Banner breadcrumb="HOME / BLOG / ARTICLE" title="The Journal" />

      <div className="single-blog-container">
        {/* Loading State */}
        {loading && (
          <div className="single-blog-loading">
            <div className="blog-spinner" />
            <p>Loading full article & scientific research...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="single-blog-error">
            <h2>Article Not Found</h2>
            <p>{error}</p>
            <Link to="/blog" className="btn-wooff-primary">
              Return to Journal
            </Link>
          </div>
        )}

        {!loading && !error && blog && (
          <article className="single-blog-article">
            
            {/* 1. Breadcrumbs: Home → Blog → Category → Article */}
            <nav className="blog-breadcrumbs-nav" aria-label="Breadcrumb">
              <ol className="blog-breadcrumbs-list">
                <li><Link to="/">Home</Link></li>
                <li className="breadcrumb-separator">›</li>
                <li><Link to="/blog">Blog</Link></li>
                <li className="breadcrumb-separator">›</li>
                <li><span className="breadcrumb-category">{blog.category}</span></li>
                <li className="breadcrumb-separator">›</li>
                <li className="breadcrumb-active" aria-current="page">{blog.title}</li>
              </ol>
            </nav>

            {/* 2. H1: Main Blog Title */}
            <h1 className="single-blog-title">{blog.title}</h1>

            {/* 3. Meta Information Bar */}
            <div className="single-blog-meta-card">
              <div className="meta-author-wrap">
                <img
                  src={blog.author_profile?.avatar || '/assets/wooff-logo.png'}
                  alt={blog.author_profile?.name || blog.author}
                  className="meta-author-avatar"
                  onError={(e) => { e.currentTarget.src = '/assets/wooff-logo.png'; }}
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
                src={blog.image_url || '/assets/tooth_paste.png'}
                alt={blog.title}
                className="single-blog-hero-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/tooth_paste.png';
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
            {blog.excerpt && (
              <div className="single-blog-lead-box">
                <div className="lead-icon"><i className="fa-solid fa-quote-left" /></div>
                <p className="lead-text">{blog.excerpt}</p>
              </div>
            )}

            {/* 6. Table of Contents */}
            {blog.toc && blog.toc.length > 0 && (
              <div className="single-blog-toc-card">
                <div className="toc-header">
                  <span className="toc-icon">📑</span>
                  <h3 className="toc-title">Table of Contents</h3>
                </div>
                <ul className="toc-list">
                  {blog.toc.map((item) => (
                    <li key={item.id} className={activeTocId === item.id ? 'active' : ''}>
                      <a href={`#${item.id}`}>
                        <span className="toc-dot">•</span>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 7. Main Article Sections (H2, H3, Paragraphs, Images, Lists, Tables, Examples) */}
            <div className="single-blog-main-content">
              {blog.sections && blog.sections.map((section, sIdx) => (
                <section key={section.id || sIdx} id={section.id} className="article-section-block">
                  <h2 className="article-h2">{section.title}</h2>

                  {section.paragraphs && section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="article-paragraph">{p}</p>
                  ))}

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
                            <span>{li}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Responsive Comparison Table */}
                  {section.table && (
                    <div className="article-table-responsive-wrapper">
                      <div className="table-heading-label">Clinical Data Comparison</div>
                      <table className="article-comparison-table">
                        <thead>
                          <tr>
                            {section.table.headers.map((h, hIdx) => (
                              <th key={hIdx}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className={cIdx === 0 ? 'metric-name' : cIdx === 2 ? 'wooff-highlight' : ''}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 9. Conclusion & Key Takeaways */}
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

            {/* 10. Author Box */}
            <div className="blog-author-profile-card">
              <div className="author-card-avatar-wrap">
                <img
                  src={blog.author_profile?.avatar || '/assets/wooff-logo.png'}
                  alt={blog.author_profile?.name || blog.author}
                  className="author-card-avatar"
                  onError={(e) => { e.currentTarget.src = '/assets/wooff-logo.png'; }}
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
                  <Link to="/product/wooff-choco-toothpaste" className="btn-pill-3d">
                    Shop Formula • ₹349
                  </Link>
                  <Link to="/products" className="btn-view-all-products">
                    View All Products →
                  </Link>
                </div>
              </div>
              <div className="prod-rec-image-wrap">
                <img src="/assets/choco.png" alt="Wooff Choco Toothpaste" className="prod-rec-img" />
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
                          src={rel.image_url || '/assets/tooth_paste.png'}
                          alt={rel.title}
                          className="related-card-img"
                          onError={(e) => { e.currentTarget.src = '/assets/tooth_paste.png'; }}
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
                  <h3 className="comments-title">Discussion & Questions ({comments.length})</h3>
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
                {comments.map((c) => (
                  <div key={c.id} className="comment-bubble">
                    <div className="comment-avatar">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-body">
                      <div className="comment-top">
                        <span className="comment-author-name">{c.name}</span>
                        <span className="comment-role-pill">{c.role}</span>
                        <span className="comment-date">{c.date}</span>
                      </div>
                      <p className="comment-text">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </article>
        )}
      </div>
    </div>
  );
}
