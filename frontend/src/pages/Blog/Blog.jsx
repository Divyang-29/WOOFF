import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import './Blog.css';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = API_ENDPOINTS?.BLOGS || '/api/blogs';
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const blogList = Array.isArray(data) ? data : data?.blogs || data?.data || [];
        
        if (isMounted) {
          setBlogs(blogList);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching blogs from /api/blogs:', err);
        if (isMounted) {
          setError(err.message || 'Failed to fetch blogs');
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      isMounted = false;
    };
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
                        src={post.image_url || '/assets/tooth_paste.png'}
                        alt={post.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/tooth_paste.png';
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
