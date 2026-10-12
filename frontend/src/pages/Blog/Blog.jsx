import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import './Blog.css';

const STATIC_BLOG_FALLBACKS = [
  {
    id: 'chocolate-toothpaste',
    slug: 'chocolate-toothpaste',
    title: 'Chocolate Toothpaste: What Parents Should Know',
    content: 'Is chocolate toothpaste safe and effective for kids? Ingredients, usage and expert-style answers from Wooff.',
    image_url: 'https://res.cloudinary.com/dnvgblkjo/image/upload/v1791794125/wooff_blogs/chocolate-toothpaste-wood.webp',
    author: 'Wooff Team',
    created_at: '2026-10-12T13:30:00Z',
  },
  {
    id: 'chocolate-flavoured-toothpaste',
    slug: 'chocolate-flavoured-toothpaste',
    title: "Chocolate Flavoured Toothpaste: A Parent's Guide",
    content: "Why kids love chocolate flavoured toothpaste, what is inside Wooff, and how to make brushing a daily habit.",
    image_url: 'https://res.cloudinary.com/dnvgblkjo/image/upload/v1791794134/wooff_blogs/FDP02976.webp',
    author: 'Wooff Team',
    created_at: '2026-10-12T13:00:00Z',
  },
  {
    id: 'choco-toothpaste',
    slug: 'choco-toothpaste',
    title: 'Choco Flavoured Toothpaste: Make Brushing a Treat',
    content: 'Choco flavoured toothpaste turns a daily chore into something kids look forward to. Wooff is built for that.',
    image_url: 'https://res.cloudinary.com/dnvgblkjo/image/upload/v1791794136/wooff_blogs/choco-toothpaste-pieces.webp',
    author: 'Wooff Team',
    created_at: '2026-10-12T12:00:00Z',
  },
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
            setBlogs(blogList);
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

  // Slice content to 120 characters and append "..."
  const formatExcerpt = (content) => {
    if (!content) return '';
    if (content.length <= 120) return content;
    return `${content.slice(0, 120)}...`;
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
                      {formatExcerpt(post.content)}
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
