import { Link } from 'react-router-dom';
import wooffLogo from '../../assets/wooff-logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer py-5">
      <div className="container">
        <div className="row g-4">
          {/* Column 1: Brand Info */}
          <div className="col-12 col-md-4">
            <Link to="/" className="footer-logo-link d-inline-block mb-3">
              <img
                src={wooffLogo}
                alt="Wooff Kids"
                className="footer-logo"
              />
            </Link>
            <p className="footer-desc mb-3">
              Making kids’ oral care fun, safe, and prebiotic-powered.
              Formulated with nHAp and prebiotic inulin for strong enamel and happy smiles.
            </p>
            <div className="footer-badge-wrapper">
              <span className="footer-badge">
                🦷 India’s 1st Prebiotic Kids Oralcare
              </span>
            </div>
          </div>

          {/* Column 2: Products & Science */}
          <div className="col-6 col-md-4">
            <h5 className="footer-col-title mb-3">Shop & Science</h5>
            <ul className="footer-links-list list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/products" className="footer-link">
                  Toothpaste
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/ingredients" className="footer-link">
                  Inside the Tube
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="footer-link">
                  Our Story & Mission
                </Link>
              </li>
              <li>
                <Link to="/blog" className="footer-link">
                  Our Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Support */}
          <div className="col-6 col-md-4">
            <h5 className="footer-col-title mb-3">Customer Care</h5>
            <ul className="footer-links-list list-unstyled mb-0">
              <li className="mb-2">
                <Link to="/faq" className="footer-link">
                  FAQs
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shipping" className="footer-link">
                  Shipping & Tracking
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/refund-policy" className="footer-link">
                  Refund & Returns Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="footer-link">
                  Contact Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy-policy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="footer-link">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="footer-divider my-4" />

        {/* Bottom Bar: Copyright & Legal */}
        <div className="row align-items-center">
          <div className="col-12 col-md-6 text-center text-md-start mb-2 mb-md-0">
            <p className="footer-copyright mb-0">
              © {new Date().getFullYear()} Wooff Kids Oralcare. All rights reserved.
            </p>
          </div>
          <div className="col-12 col-md-6 text-center text-md-end">
            <div className="footer-legal d-inline-flex flex-wrap justify-content-center justify-content-md-end gap-3 gap-md-4">
              <Link to="/privacy-policy" className="footer-legal-link">
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className="footer-legal-link">
                Terms & Conditions
              </Link>
              <Link to="/cookies" className="footer-legal-link">
                Cookie Preferences
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
