import React from 'react';
import { Link } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import ToothHeader from '../../components/ToothHeader/ToothHeader';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <Banner
        title="Privacy Policy"
        breadcrumb="HOME / PRIVACY POLICY"
      />

      <div className="container legal-stack-container">
        {/* Section 1 */}
        <section className="legal-section-card">
          <ToothHeader number="1" title="Our Commitment to Privacy" />
          <div className="legal-content">
            <p className="privacy-paragraph">
              At Wooff, we take the trust of our pack very seriously. We are committed to protecting
              your personal data and respecting the privacy rights of all families who visit our website,
              purchase our prebiotic oral care formulas, or interact with our community. This Privacy Policy
              describes what information we collect, how it is safeguarded, and how you can manage your preferences.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="legal-section-card">
          <ToothHeader number="2" title="Information We Collect" />
          <div className="legal-content">
            <p className="privacy-paragraph">
              To provide a delightful and seamless shopping experience, we collect certain categories of information:
            </p>
            <ul className="privacy-list">
              <li>
                <strong>Order & Billing Information:</strong> When purchasing products, we collect your name,
                shipping address, billing address, email address, phone number, and payment details
                (processed securely via PCI-compliant encryption gateways).
              </li>
              <li>
                <strong>Communication Data:</strong> Information you share when reaching out to customer support,
                submitting questions via our contact form, requesting wholesale information, or leaving reviews.
              </li>
              <li>
                <strong>Usage & Device Data:</strong> Technical logs, browser specifications, IP address, referral sources,
                and on-site interactions collected through cookies and analytical tools to optimize site performance.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="legal-section-card">
          <ToothHeader number="3" title="How We Use Your Information" />
          <div className="legal-content">
            <p className="privacy-paragraph">
              We use the collected information only for legitimate business and customer service purposes:
            </p>
            <ul className="privacy-list">
              <li>Processing, fulfilling, and dispatching your orders and subscription bundles.</li>
              <li>Sending necessary transactional updates, tracking details, and receipts.</li>
              <li>Providing attentive customer support and resolving inquiries quickly.</li>
              <li>Improving our oral care formulas, user experience, and website functionality.</li>
              <li>Preventing fraudulent transactions and protecting the integrity of our platform.</li>
              <li>Delivering optional oral health tips, promotions, and updates (which you can opt out of anytime).</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="legal-section-card">
          <ToothHeader number="4" title="Children's Privacy" />
          <div className="legal-content">
            <p className="privacy-paragraph">
              Although Wooff develops safe, delicious, and prebiotic oral care products designed specifically
              for children, our website and online store are intended solely for use by parents, guardians, and
              individuals who are at least 18 years of age.
            </p>
            <p className="privacy-paragraph">
              <strong>We do not knowingly collect or solicit personal information from children under the age of 13.</strong> If
              we learn that a child under 13 has provided us with personal information without verified parental
              consent, we take immediate steps to delete that information from our servers. If you believe your child
              has submitted personal details to our platform, please reach out to us right away.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="legal-section-card">
          <ToothHeader number="5" title="Contact Us" />
          <div className="legal-content">
            <p className="privacy-paragraph">
              If you have any questions, comments, or data requests regarding this Privacy Policy or your personal information,
              please feel free to reach out to our team:
            </p>
            <div className="privacy-contact-card mt-3">
              <p className="mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@wooffkids.com" className="privacy-link">
                  support@wooffkids.com
                </a>
              </p>
              <p className="mb-0">
                <strong>Contact Form:</strong>{' '}
                <Link to="/contact" className="privacy-link">
                  Visit our Contact Page
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
