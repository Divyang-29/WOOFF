import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import ToothHeader from '../../components/ToothHeader/ToothHeader';
import { API_ENDPOINTS } from '../../api';
import './TermsAndConditions.css';

export default function TermsAndConditions() {
  const [dynamicTerms, setDynamicTerms] = useState(null);

  useEffect(() => {
    document.title = "Terms & Conditions | Wooff Care";
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const fetchTerms = async () => {
      try {
        const endpoint = API_ENDPOINTS?.TERMS || '/terms-and-conditions';
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          const content = data?.terms?.content;
          if (
            content &&
            typeof content === 'string' &&
            content.trim().length > 0 &&
            !content.includes('No terms & conditions content has been published yet')
          ) {
            setDynamicTerms(data.terms);
          }
        }
      } catch (err) {
        console.warn('Using default Terms & Conditions document.', err);
      }
    };
    fetchTerms();
  }, []);

  return (
    <div className="terms-page">
      <Banner
        title={dynamicTerms?.title || "Terms & Conditions"}
        breadcrumb="HOME / TERMS & CONDITIONS"
      />

      <div className="container legal-stack-container">
        {dynamicTerms?.content && !dynamicTerms.content.includes('No terms & conditions content has been published yet') ? (
          <section className="legal-section-card">
            <ToothHeader number="1" title={dynamicTerms.title || "Store Policy Details"} />
            <div className="legal-content">
              <div style={{ whiteSpace: 'pre-line', lineHeight: '1.7', color: '#4B2E1E' }}>
                {dynamicTerms.content}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Section 1 */}
            <section className="legal-section-card">
              <ToothHeader number="1" title="Agreement to Terms" />
              <div className="legal-content">
                <p className="terms-paragraph">
                  Welcome to Wooff! By accessing or using our website, purchasing our oral care products, or engaging
                  with our services, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you
                  do not agree with any part of these terms, please do not use our website or purchase our products.
                </p>
              </div>
            </section>

        {/* Section 2 */}
        <section className="legal-section-card">
          <ToothHeader number="2" title="Products & Pricing" />
          <div className="legal-content">
            <p className="terms-paragraph">
              We strive to provide accurate descriptions and imagery for our Choco Tubes, toothpaste varieties,
              and bundled oral care packs. However, descriptions, images, and prices are subject to change at any
              time without prior notice.
            </p>
            <ul className="terms-list">
              <li>All prices are displayed in the specified local currency and exclude applicable shipping or tax fees unless noted otherwise.</li>
              <li>We reserve the right to modify or discontinue any product or bundle formula at any time.</li>
              <li>We reserve the right to limit the sales quantities of any products or subscriptions to any person, household, or geographic region.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="legal-section-card">
          <ToothHeader number="3" title="Orders & Payment" />
          <div className="legal-content">
            <p className="terms-paragraph">
              When you place an order with Wooff, you agree to provide current, complete, and accurate purchase and
              account information.
            </p>
            <p className="terms-paragraph">
              We reserve the right to refuse or cancel any order for reasons including, but not limited to, product
              availability, inaccuracies in product or pricing information, suspected fraudulent activity, or
              unauthorized reseller patterns. In the event of a cancellation after payment has been processed, we
              will promptly issue a full refund to your original payment method.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="legal-section-card">
          <ToothHeader number="4" title="Shipping, Returns & Refunds" />
          <div className="legal-content">
            <p className="terms-paragraph">
              Estimated delivery timelines provided during checkout or in confirmation emails are approximate
              estimates only. Wooff is not liable for carrier-related delays outside our reasonable control.
            </p>
            <p className="terms-paragraph">
              Due to the hygienic nature of children’s oral care and toothpaste formulas, opened tubes cannot be
              returned for restocking. However, if your order arrives damaged, defective, or incorrect, please reach
              out within 48 hours of delivery.
            </p>
            <p className="terms-paragraph">
              <strong>Mandatory Parcel Opening Video:</strong> To qualify for a return, replacement, or refund for items that arrive damaged, leaking, defective, or incorrect, customers must provide an uncut, continuous video recorded while opening the sealed package from scratch, showing the intact shipping label. <strong>Without a valid parcel unboxing video, no return or refund will be provided.</strong> For full terms, please review our <Link to="/refund-policy" className="terms-link">Refund & Returns Policy</Link>.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="legal-section-card">
          <ToothHeader number="5" title="Intellectual Property" />
          <div className="legal-content">
            <p className="terms-paragraph">
              All content, trademarks, logos, graphics, brand mascots, designs, typography, illustrations, and software
              on this website are the proprietary property of Wooff Kids Oralcare (Wooff Care) or its licensors and are protected by
              applicable copyright, trademark, and intellectual property laws. You may not reproduce, modify,
              distribute, or republish any material without our explicit prior written consent.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="legal-section-card">
          <ToothHeader number="6" title="Limitation of Liability" />
          <div className="legal-content">
            <p className="terms-paragraph">
              Wooff oral care formulas are created using high-quality, pediatrician-approved, and food-grade prebiotic
              ingredients. However, our products should be used as directed on the packaging. Parents and guardians
              should supervise young children during brushing routines.
            </p>
            <p className="terms-paragraph">
              To the maximum extent permitted by applicable law, Wooff and its officers, directors, and affiliates shall
              not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or
              inability to use our products or website.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="legal-section-card">
          <ToothHeader number="7" title="Contact Us" />
          <div className="legal-content">
            <p className="terms-paragraph">
              Have questions or need clarification regarding these Terms and Conditions? We’re always here to assist:
            </p>
            <div className="terms-contact-card mt-3">
              <p className="mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:hello@wooff.care" className="terms-link">
                  hello@wooff.care
                </a>
              </p>
              <p className="mb-0">
                <strong>Support Portal:</strong>{' '}
                <Link to="/contact" className="terms-link">
                  Visit our Contact Page
                </Link>
              </p>
            </div>
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  );
}
