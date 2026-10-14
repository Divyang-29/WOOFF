import React from 'react';
import { useLocation } from 'react-router-dom';
import Banner from '../../components/Banner/Banner';
import CheckoutForm from '../../components/Checkout/CheckoutForm';
import './Checkout.css';

export default function Checkout() {
  const location = useLocation();
  const [isOrderComplete, setIsOrderComplete] = React.useState(false);

  // If redirected from Buy Now on product page with a single item
  const directItem = location.state?.directItem ? [location.state.directItem] : null;

  return (
    <div className="checkout-page">
      {!isOrderComplete && (
        <Banner
          title="Secure Checkout"
          breadcrumb="HOME / CHECKOUT"
        />
      )}

      <div className={`container checkout-content-container ${isOrderComplete ? 'checkout-success-page-wrap' : 'py-4 py-md-5'}`}>
        <CheckoutForm 
          initialItems={directItem}
          onOrderSuccess={() => {
            setIsOrderComplete(true);
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
        />
      </div>
    </div>
  );
}
