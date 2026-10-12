import React from 'react';
import { useLocation } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import CheckoutForm from '../../components/Checkout/CheckoutForm';
import './Checkout.css';

export default function Checkout() {
  const location = useLocation();

  // If redirected from Buy Now on product page with a single item
  const directItem = location.state?.directItem ? [location.state.directItem] : null;

  return (
    <div className="checkout-page">
      <Banner
        title="Secure Checkout"
        breadcrumb="HOME / CHECKOUT"
      />

      <div className="container checkout-content-container py-4 py-md-5">
        <CheckoutForm initialItems={directItem} />
      </div>
    </div>
  );
}
