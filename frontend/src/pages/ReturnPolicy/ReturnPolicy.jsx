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
          <ToothHeader number="2" title="Damaged or Incorrect Orders" />
          <p>
            If you receive a damaged, defective, or incorrect product, please contact us at <a href="mailto:hello@wooff.care" style={{ color: '#4B2E1E', fontWeight: '700' }}>hello@wooff.care</a> within 48 hours of delivery.
          </p>
          <p>To help us resolve the issue quickly, please include:</p>
          <ul>
            <li>Your order number</li>
            <li>Clear photographs of the product</li>
            <li>Photographs of the packaging received</li>
          </ul>
          <p>Our team will review your request and get back to you as soon as possible.</p>
        </section>

        {/* Section 3: Refunds */}
        <section className="legal-content">
          <ToothHeader number="3" title="Refunds" />
          <p>
            Once your refund request has been approved, the applicable amount will be refunded to your original payment method within 7–10 business days.
          </p>
          <p>
            Please note that your bank or payment provider may require additional time for the refund to appear in your account.
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
