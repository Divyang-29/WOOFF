import React from 'react';
import Banner from '../../components/Banner/Banner';
import ToothHeader from '../../components/ToothHeader/ToothHeader';
import '../SharedLegal.css';

export default function ReturnPolicy() {
  return (
    <div className="legal-page-wrapper">
      <Banner breadcrumb="HOME / REFUND & RETURNS POLICY" title="Refund & Returns Policy" />
      
      <div className="legal-stack-container">
        
        {/* Intro */}
        <section className="legal-content mb-4">
          <p className="lead-intro-text" style={{ fontSize: '1.15rem', color: '#4B2E1E', fontWeight: '600', lineHeight: '1.7' }}>
            We want every Wooff Kids order to reach you safely and in perfect condition. If there’s a problem with your order, don’t worry—we’re here to make it right.
          </p>
        </section>

        {/* Section 1: Returns */}
        <section className="legal-content">
          <ToothHeader number="1" title="Returns" />
          <p>
            For hygiene and safety reasons, opened or used oral-care products are not eligible for return.
          </p>
          <p>
            However, if your order arrives damaged, defective, or incorrect, we’ll be happy to assist you with a replacement or refund, as applicable.
          </p>
        </section>

        {/* Section 2: Damaged or Incorrect Orders */}
        <section className="legal-content">
          <ToothHeader number="2" title="Damaged or Incorrect Orders & Video Verification" />
          <p>
            If you receive a damaged, defective, or incorrect product, please contact us at <a href="mailto:hello@wooff.care" style={{ color: '#4B2E1E', fontWeight: '700' }}>hello@wooff.care</a> within 48 hours of delivery.
          </p>
          <div style={{ backgroundColor: '#FFF5F0', borderLeft: '4px solid #e58b57', padding: '14px 18px', borderRadius: '8px', margin: '16px 0' }}>
            <p style={{ margin: 0, fontWeight: '700', color: '#4B2E1E', fontSize: '1.05rem' }}>
              ⚠️ Mandatory Unboxing Video Requirement:
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#5C4D40', lineHeight: '1.6' }}>
              A continuous, uncut video recorded while opening the package from its original sealed state is strictly required for any damage, transit defect, or incorrect/missing item claim. The video must clearly capture the intact shipping label and the actual unboxing. <strong>Without an unboxing video, no return, replacement, or refund will be provided under any circumstances.</strong>
            </p>
          </div>
          <p>To help us process and resolve your claim quickly, please include:</p>
          <ul>
            <li>Your order number</li>
            <li><strong>Mandatory unboxing video</strong> recorded while opening the sealed parcel</li>
            <li>Clear photographs of the product and outer packaging</li>
          </ul>
          <p>Our support team will inspect the footage and provide a resolution promptly.</p>
        </section>

        {/* Section 3: Refunds */}
        <section className="legal-content">
          <ToothHeader number="3" title="Refunds" />
          <p>
            Once your return or replacement request is reviewed and approved (subject to validation of the mandatory unboxing video), the approved refund amount will be credited to your original payment method within 7–10 business days.
          </p>
          <p>
            Please note that your bank or payment provider may require additional time for the refund to reflect in your account. Without the required opening video verification for transit damage or discrepancies, refund requests cannot be processed.
          </p>
        </section>

        {/* Section 4: Order Cancellation */}
        <section className="legal-content">
          <ToothHeader number="4" title="Order Cancellation" />
          <p>
            Orders can be cancelled before dispatch and will be eligible for a full refund.
          </p>
          <p>
            Once an order has been dispatched, cancellation may not be possible.
          </p>
        </section>

      </div>
    </div>
  );
}
