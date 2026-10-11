import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const COOKIE_STORAGE_KEY = 'wooff_cookie_consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!consent) {
        // Small delay so it transitions smoothly after initial page load
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.warn('Could not read cookie consent from storage', err);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'essential_only');
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside className="cookie-consent-bar" role="dialog" aria-label="Cookie Preferences">
      <div className="cookie-consent-content">
        <div className="cookie-consent-icon">
          <i className="fa-solid fa-cookie-bite"></i>
        </div>
        <div>
          <h4 className="cookie-consent-title">We Value Your Privacy</h4>
          <p className="cookie-consent-text">
            We use essential cookies to provide secure checkout, improve our store, and personalize your experience. 
            Learn more in our{' '}
            <Link to="/privacy-policy#cookies" className="cookie-consent-link">
              Cookie Policy
            </Link>.
          </p>
        </div>
      </div>

      <div className="cookie-consent-actions">
        <button
          type="button"
          onClick={handleDecline}
          className="btn-cookie-decline"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="btn-cookie-accept"
        >
          Accept All
        </button>
      </div>
    </aside>
  );
}
