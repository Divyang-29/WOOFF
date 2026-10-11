import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-wrapper">
      <div className="not-found-card">
        <div className="not-found-badge">
          <i className="fa-solid fa-compass me-1"></i> Page Not Located
        </div>
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">404 - Page Not Found</h1>
        <p className="not-found-desc">
          Oops! The page you are looking for seems to have wandered off like an adventurous puppy. 
          It might have been moved, renamed, or is temporarily unavailable.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-not-found-primary">
            <i className="fa-solid fa-house"></i>
            Return to Shop
          </Link>
          <Link to="/products" className="btn-not-found-secondary">
            <i className="fa-solid fa-bag-shopping"></i>
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
