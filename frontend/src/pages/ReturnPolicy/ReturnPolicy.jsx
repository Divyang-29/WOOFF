import React from 'react';
import Banner from '../../components/Banner/Banner';
import ToothHeader from '../../components/ToothHeader/ToothHeader';
import '../SharedLegal.css';

export default function ReturnPolicy() {
  return (
    <div className="legal-page-wrapper">
      <Banner breadcrumb="HOME / RETURN POLICY" title="Return Policy" />
      
      <div className="legal-stack-container">
        
        <section className="legal-content">
          <ToothHeader number="1" title="The 30-Day 'Happy Brusher' Guarantee" />
          <p>
            We want your kids to love brushing! If your little ones aren't completely obsessed with our Choco toothpaste, we offer a 30-day money-back guarantee. You can return your first tube within 30 days of delivery for a full refund, even if it's been opened and tried.
          </p>
        </section>

        <section className="legal-content">
          <ToothHeader number="2" title="Eligibility for Returns" />
          <p>
            For subsequent purchases or bundle orders:
          </p>
          <ul>
            <li>Items must be returned unopened, unused, and in their original packaging.</li>
            <li>Return requests must be submitted within 30 days of the delivery date.</li>
            <li>Limited edition items, gift cards, and free promotional items are final sale and non-refundable.</li>
          </ul>
        </section>

        <section className="legal-content">
          <ToothHeader number="3" title="How to Initiate a Return" />
          <p>
            To start a return, simply email our pack at <strong>hello@wooff.online</strong> with your order number and the reason for the return. Our support team will provide you with a return authorization and the shipping address. Please note that return shipping costs are the responsibility of the customer unless the item arrived damaged.
          </p>
        </section>

        <section className="legal-content">
          <ToothHeader number="4" title="Refunds Processing" />
          <p>
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds are processed immediately and will automatically be applied to your original method of payment within 5-7 business days, depending on your bank.
          </p>
        </section>

        <section className="legal-content">
          <ToothHeader number="5" title="Damaged or Defective Items" />
          <p>
            If your toothpaste arrives damaged or there is a defect with the packaging, please contact us immediately with a photo of the item and packaging at <strong>hello@wooff.online</strong>. We will happily send out a replacement tube right away at no additional cost to you.
          </p>
        </section>

      </div>
    </div>
  );
}
