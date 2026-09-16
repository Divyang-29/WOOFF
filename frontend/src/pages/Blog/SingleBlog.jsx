import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import './SingleBlog.css';

export default function SingleBlog() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = API_ENDPOINTS?.BLOGS || '/api/blogs';
        const response = await fetch(`${baseUrl}/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Blog article not found.');
          }
          throw new Error(`Failed to load article (HTTP ${response.status})`);
        }

        const data = await response.json();
        const post = data?.blog || data;

        if (isMounted) {
          setBlog(post);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching blog by slug:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load article');
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchBlog();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Format date into "Sept 14, 2026"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="single-blog-page-wrapper">
      <Banner breadcrumb="HOME / BLOG / ARTICLE" title="The Journal" />

      <div className="single-blog-container">
        {/* Navigation / Back Button */}
        <div className="single-blog-top-nav">
          <Link to="/blog" className="back-to-blogs-btn">
            ← Back to All Articles
          </Link>
        </div>

        {loading && (
          <div className="single-blog-loading">
            <div className="blog-spinner" />
            <p>Loading article...</p>
          </div>
        )}

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
            {/* 1. Large Hero Image with Thick Brutalist Border */}
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

            {/* 2. Meta Info (Author & Date side-by-side) */}
            <div className="single-blog-meta-bar">
              <span className="single-blog-author-badge">
                Written by <strong>{blog.author}</strong>
              </span>
              <span className="single-blog-date-badge">
                {formatDate(blog.created_at)}
              </span>
            </div>

            {/* 3. Title */}
            <h1 className="single-blog-title">{blog.title}</h1>

            {/* 4. Full Content with Editorial Styling */}
            <div className="single-blog-content">
              {blog.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="single-blog-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Editorial Quote Box */}
            <div className="single-blog-editorial-quote">
              <p>
                “Brushing shouldn't be a twice-daily battle. With biocompatible science and kid-approved flavor, we're building healthy habits for life.”
              </p>
              <cite>— Wooff Kids Dental Formulations Team</cite>
            </div>

            {/* Bottom Footer Navigation */}
            <div className="single-blog-footer">
              <div className="single-blog-author-card">
                <h4>About the Author</h4>
                <p>
                  <strong>{blog.author}</strong> is dedicated to pediatric dental wellness and gentle, toxin-free oral care solutions designed with biological integrity.
                </p>
              </div>

              <div className="single-blog-actions">
                <Link to="/blog" className="btn-pill-3d">
                  Browse More Articles
                </Link>
                <Link to="/products" className="btn-wooff-primary">
                  Explore Products
                </Link>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
