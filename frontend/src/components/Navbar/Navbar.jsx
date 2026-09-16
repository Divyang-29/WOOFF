import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import wooffLogo from '../../assets/wooff-logo.png';
import './Navbar.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openCart, cartCount } = useCart();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  const mainNavLinks = [
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Ingredients', path: '/ingredients' }
  ];

  const mobileNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Ingredients', path: '/ingredients' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' }
  ];

  return (
    <>
      <header className="navbar navbar-expand-lg fixed-top wooff-site-navbar">
        <div className="container nav-header-container">
          
          {/* Left Desktop Navigation Links */}
          <div className="d-none d-lg-flex align-items-center">
            <ul className="navbar-nav desktop-nav-menu">
              {mainNavLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <li key={link.path} className="nav-item">
                    <Link
                      to={link.path}
                      className={`nav-link ${active ? 'active-link' : ''}`}
                    >
                      <span className="nav-link-text">{link.name}</span>
                      {active && (
                        <svg className="active-smile-arc" viewBox="0 0 40 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 2C12 7 28 7 38 2" stroke="var(--warm-orange, #e58b57)" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Brand Logo - Left on mobile, centered on desktop */}
          <Link to="/" className="navbar-brand d-flex align-items-center me-auto me-lg-0 brand-logo-center" onClick={closeMobileMenu}>
            <img src={wooffLogo} alt="Wooff Kids Logo" className="navbar-logo logo-img" />
          </Link>

          {/* Right Desktop Actions */}
          <div className="d-none d-lg-flex align-items-center gap-4">
            <Link to="/login" className="btn-account-link">
              Login
            </Link>

            <button 
              type="button" 
              aria-label="Shopping Cart" 
              className="btn-cart-nav"
              onClick={openCart}
            >
              <svg className="cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="cart-label">Cart</span>
              {cartCount > 0 && (
                <span className="cart-badge-count">{cartCount}</span>
              )}
            </button>
          </div>

          {/* Mobile & Tablet Header Action Controls */}
          <div className="d-flex d-lg-none align-items-center gap-3">
            <button 
              type="button" 
              aria-label="Shopping Cart" 
              className="btn-cart-nav"
              onClick={openCart}
            >
              <svg className="cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="cart-badge-count">{cartCount}</span>
              )}
            </button>

            <button
              className="mobile-hamburger-btn"
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle Navigation Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* Off-Canvas Slide-Out Navigation Drawer for Mobile & Tablet */}
      {isMobileMenuOpen && (
        <div className="nav-offcanvas-backdrop" onClick={closeMobileMenu}>
          <div 
            className="nav-offcanvas-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Offcanvas Top Header */}
            <div className="offcanvas-header">
              <Link to="/" onClick={closeMobileMenu}>
                <img src={wooffLogo} alt="Wooff Kids Logo" className="offcanvas-logo" />
              </Link>
              <button 
                className="offcanvas-close-btn" 
                onClick={closeMobileMenu}
                aria-label="Close Navigation"
              >
                ✕
              </button>
            </div>

            {/* Offcanvas Nav Links */}
            <div className="offcanvas-body">
              <nav className="offcanvas-nav">
                {mobileNavLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`offcanvas-link ${active ? 'offcanvas-active' : ''}`}
                      onClick={closeMobileMenu}
                    >
                      <span>{link.name}</span>
                      <span className="arrow-icon">→</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Offcanvas Footer Actions */}
            <div className="offcanvas-footer">
              <Link to="/login" className="offcanvas-login-btn" onClick={closeMobileMenu}>
                Login / Signup
              </Link>
              <p className="offcanvas-footer-note">100% Prebiotic & Natural Oral Care</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


