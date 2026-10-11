import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import CheckoutForm from '../../components/Checkout/CheckoutForm';
import './Checkout.css';

export default function Checkout() {
  const location = useLocation();

  // If redirected from Buy Now on product page with a single item
  const directItem = location.state?.directItem ? [location.state.directItem] : null;

  return (
    <div className="checkout-page-container">
      <div className="container py-4 py-md-5">
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="checkout-breadcrumb mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products" className="text-decoration-none">Shop</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Secure Checkout
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="checkout-page-header mb-4 text-center text-md-start">
          <h1 className="checkout-page-title">Fast & Secure Checkout</h1>
          <p className="checkout-page-tagline">
            Complete your order with official 100% genuine Wooff canine oral health care.
          </p>
        </div>

        {/* Main Checkout Form Component */}
        <CheckoutForm initialItems={directItem} />
      </div>
    </div>
  );
}
