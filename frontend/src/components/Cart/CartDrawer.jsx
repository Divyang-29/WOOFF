import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    freeShippingThreshold,
    amountForFreeShipping,
    hasFreeShipping
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className={`cart-drawer-backdrop ${isCartOpen ? 'is-visible' : ''}`} onClick={closeCart}>
      <div 
        className={`cart-drawer-panel ${isCartOpen ? 'is-open' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">Your Cart</h2>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close Cart">
            ✕
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="free-shipping-banner">
          {hasFreeShipping ? (
            <div className="shipping-text success">
              🎉 <strong>Free Shipping Unlocked!</strong>
            </div>
          ) : (
            <div className="shipping-text">
              Add <strong>₹{amountForFreeShipping.toFixed(2)}</strong> more for <strong>FREE Shipping!</strong>
            </div>
          )}
          <div className="shipping-progress-track">
            <div 
              className="shipping-progress-fill"
              style={{ width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%` }}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <h3 className="empty-cart-title">Your cart is empty</h3>
              <Link to="/products" className="shop-btn-pill" onClick={closeCart}>
                Shop Wooff
              </Link>
            </div>
          ) : (
            /* Filled Cart Items List */
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const itemTotal = parseFloat(item.final_price || item.price || 0) * item.quantity;
                return (
                  <div key={item.id || item.product_id} className="cart-item-row">
                    <img 
                      src={item.primary_image || item.image || '/images/hero_tubes.jpg'} 
                      alt={item.title} 
                      className="cart-item-thumb" 
                    />
                    
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{item.title}</h4>
                      <div className="cart-item-price-row">
                        <span className="cart-item-price">₹{parseFloat(item.final_price || item.price).toFixed(2)}</span>
                        {item.price > item.final_price && (
                          <span className="cart-item-original-price">₹{parseFloat(item.price).toFixed(2)}</span>
                        )}
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-qty-selector">
                          <button 
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >-</button>
                          <span className="cart-qty-num">{item.quantity}</span>
                          <button 
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >+</button>
                        </div>

                        <button 
                          className="cart-remove-btn" 
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-line-total">
                      ₹{itemTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Summary Sticky Footer */}
        <div className="cart-drawer-footer">
          <div className="cart-subtotal-row">
            <span className="subtotal-label">Subtotal</span>
            <span className="subtotal-amount">₹{cartSubtotal.toFixed(2)}</span>
          </div>

          <button 
            className="checkout-btn" 
            disabled={cartItems.length === 0}
            onClick={() => {
              alert(`Proceeding to checkout for ₹${cartSubtotal.toFixed(2)}`);
            }}
          >
            Checkout
          </button>

          <p className="cart-footer-note">Taxes and shipping calculated at checkout</p>
        </div>
      </div>
    </div>
  );
}
