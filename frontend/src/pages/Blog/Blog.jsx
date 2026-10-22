import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import { RICH_ARTICLES } from './blogArticleData';
import './Blog.css';

// Canonical ordering of blog articles for the Journal
const CANONICAL_BLOG_ORDER = [
  'chocolate-toothpaste',
  'chocolate-flavoured-toothpaste',
  'choco-flavoured-toothpaste',
];

function enrichBlogItem(post) {
  if (!post) return post;
  const rawSlug = String(post.slug || post.id || '').trim().toLowerCase();

  let matchedKey = null;
  if (rawSlug === 'chocolate-toothpaste' || rawSlug.includes('parents') || rawSlug.includes('know')) {
    matchedKey = 'chocolate-toothpaste';
  } else if (rawSlug === 'chocolate-flavoured-toothpaste' || rawSlug.includes('choose') || rawSlug.includes('best') || rawSlug.includes('guide')) {
    matchedKey = 'chocolate-flavoured-toothpaste';
  } else if (rawSlug === 'choco-flavoured-toothpaste' || rawSlug === 'choco-toothpaste' || rawSlug.includes('treat') || rawSlug.includes('fights')) {
    matchedKey = 'choco-flavoured-toothpaste';
  } else if (RICH_ARTICLES[rawSlug]) {
    matchedKey = rawSlug;
  }

  const rich = matchedKey ? RICH_ARTICLES[matchedKey] : null;
  if (rich) {
    return {
      ...post,
      id: matchedKey,
      slug: matchedKey,
      title: rich.title,
      content: rich.excerpt || post.content,
      excerpt: rich.excerpt,
      image_url: rich.image_url || post.image_url,
      author: rich.author?.name || post.author || 'Wooff Team',
      created_at: rich.created_at || rich.updated_at || post.created_at,
    };
  }

  return post;
}

const STATIC_BLOG_FALLBACKS = [
  enrichBlogItem({
    id: 'chocolate-toothpaste',
    slug: 'chocolate-toothpaste',
    title: 'Chocolate Toothpaste',
    content: "Looking for Chocolate Toothpaste for kids? Try Wooff for a chocolate-inspired brushing experience that makes daily oral care more enjoyable. Explore Now!",
    image_url: 'https://res.cloudinary.com/dnvgblkjo/image/upload/v1791794125/wooff_blogs/chocolate-toothpaste-wood.webp',
    author: 'Wooff Team',
    created_at: '2026-10-21T08:30:00Z',
  }),
  enrichBlogItem({
    id: 'chocolate-flavoured-toothpaste',
    slug: 'chocolate-flavoured-toothpaste',
    title: 'Chocolate Flavoured Toothpaste',
    content: 'Discover Wooff Chocolate Flavoured Toothpaste for a fun daily brushing experience. Make oral care enjoyable for kids with a delicious chocolate taste. Shop Now!',
    image_url: 'https://res.cloudinary.com/dnvgblkjo/image/upload/v1791794134/wooff_blogs/FDP02976.webp',
    author: 'Wooff Team',
    created_at: '2026-10-21T09:00:00Z',
  }),
  enrichBlogItem({
    id: 'choco-flavoured-toothpaste',
    slug: 'choco-flavoured-toothpaste',
    title: 'Choco Flavoured Toothpaste',
    content: 'Make brushing fun with Wooff Choco Flavoured Toothpaste! Enjoy a delicious chocolate flavour and a refreshing brushing experience every day.',
    image_url: 'https://res.cloudinary.com/dnvgblkjo/image/upload/v1791794136/wooff_blogs/choco-toothpaste-pieces.webp',
    author: 'Wooff Team',
    created_at: '2026-10-21T09:00:00Z',
  }),
];

export default function Blog() {
  const [blogs, setBlogs] = useState(STATIC_BLOG_FALLBACKS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBlogs = async () => {
      try {
        const endpoint = API_ENDPOINTS?.BLOGS || '/api/blogs';
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const blogList = Array.isArray(data) ? data : data?.blogs || data?.data || [];
          if (isMounted && blogList.length > 0) {
            const enriched = blogList.map(enrichBlogItem);
            enriched.sort((a, b) => {
              const idxA = CANONICAL_BLOG_ORDER.indexOf(a.slug);
              const idxB = CANONICAL_BLOG_ORDER.indexOf(b.slug);
              return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
            });
            setBlogs(enriched);
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote blogs, keeping cached stories:', err);
      }
    };

    fetchBlogs();
    return () => { isMounted = false; };
  }, []);

  // Format created_at date into "Sept 14, 2026"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Format excerpt cleanly
  const formatExcerpt = (contentOrPost) => {
    const text = typeof contentOrPost === 'object' && contentOrPost !== null
      ? (contentOrPost.excerpt || contentOrPost.content || '')
      : (contentOrPost || '');
    if (!text) return '';
    if (text.length <= 165) return text;
    return `${text.slice(0, 160).trim()}...`;
  };

  return (
    <div className="blog-page-wrapper">
      <Banner breadcrumb="HOME / BLOG" title="Our Journal" />

      <div className="blog-container">
        {loading && (
          <div className="blog-loading-state">
            <div className="blog-spinner" />
            <p>Loading the latest stories from Wooff Kids...</p>
          </div>
        )}

        {error && !loading && (
          <div className="blog-error-state">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button
              type="button"
              className="btn-wooff-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className="blog-empty-state">
            <h3>No articles published yet</h3>
            <p>Check back soon for new insights, oral health science, and parenting tips!</p>
          </div>
        )}

        {!loading && !error && blogs.length > 0 && (
          <div className="blog-grid">
            {blogs.map((post) => {
              const postSlug = post.slug || String(post.id);
              return (
                <article key={post.id} className="blog-card">
                  <Link to={`/blog/${postSlug}`} className="blog-card-image-link">
                    <div className="blog-card-image">
                      <img
                        src={post.image_url || '/assets/tooth_paste.webp'}
                        alt={post.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/tooth_paste.webp';
                        }}
                      />
                    </div>
                  </Link>

                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span className="blog-card-author">{post.author}</span>
                      <span className="blog-card-date">{formatDate(post.created_at)}</span>
                    </div>

                    <Link to={`/blog/${postSlug}`} className="blog-title-link">
                      <h3 className="blog-card-title">{post.title}</h3>
                    </Link>

                    <p className="blog-card-excerpt">
                      {formatExcerpt(post)}
                    </p>

                    <div className="blog-card-footer">
                      <Link className="read-more-btn" to={`/blog/${postSlug}`}>
                        Read Article →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
