import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { loadRazorpayScript } from '../../utils/razorpay';
import { invalidateProductCache } from '../../utils/productData';
import './CheckoutForm.css';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

export default function CheckoutForm({ initialItems = null, onOrderSuccess = null }) {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user, token } = useAuth();

  // Resolve items to purchase: either direct item passed via props/state or cart items
  const itemsToCheckout = (initialItems && initialItems.length > 0)
    ? initialItems
    : cartItems;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'

  // Scroll to top immediately and track Meta Pixel Purchase when order confirmation is reached
  useEffect(() => {
    if (successOrder) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', {
          value: parseFloat(successOrder.totalAmount || successOrder.totalPrice || 0),
          currency: 'INR',
        });
      }
    }
  }, [successOrder]);


  // Pincode auto-fetch state
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  // Fetch City and State from official Indian Postal Pincode API
  const fetchLocationByPincode = async (pincodeVal) => {
    if (!pincodeVal || pincodeVal.length !== 6) return;
    setIsFetchingPincode(true);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincodeVal}`);
      const data = await res.json();

      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const detectedCity = po.District || po.Block || po.Circle || '';
        const detectedState = po.State || '';

        // Match detected state against INDIAN_STATES list (case-insensitive)
        const matchedState = INDIAN_STATES.find(
          (s) => s.toLowerCase() === detectedState.trim().toLowerCase()
        ) || detectedState;

        setFormData((prev) => ({
          ...prev,
          city: detectedCity || prev.city,
          state: matchedState || prev.state,
        }));

        // Clear any previous validation errors for pincode, city, or state
        setFormErrors((prev) => {
          const updated = { ...prev };
          delete updated.pincode;
          delete updated.city;
          delete updated.state;
          return updated;
        });
      }
    } catch (err) {
      console.warn('Pincode auto-fetch error:', err);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  // Pre-fill user details if logged in (skip if admin account)
  useEffect(() => {
    if (user) {
      const isAdmin =
        user.role === 'admin' ||
        user.username?.toLowerCase() === 'admin' ||
        user.email?.toLowerCase().includes('admin');

      // Never auto-populate admin credentials into customer checkout form
      if (!isAdmin) {
        const detectedName =
          user.fullName ||
          user.full_name ||
          user.name ||
          (user.username && user.username.toLowerCase() !== 'admin' ? user.username : '') ||
          '';

        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || detectedName,
          email: prev.email || user.email || '',
          phone: prev.phone || (user.phone_number ? user.phone_number.replace(/^\+91/, '') : ''),
        }));
      }
    }
  }, [user]);

  // Financial calculations
  const subtotal = itemsToCheckout.reduce((acc, item) => {
    const price = parseFloat(item.final_price || item.unit_price || item.price || 0);
    const qty = parseInt(item.quantity) || 1;
    return acc + price * qty;
  }, 0);

  // Free shipping for all products
  const shippingCost = 0;
  const grandTotal = subtotal + shippingCost;

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'pincode') {
      const cleanPin = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, pincode: cleanPin }));

      if (cleanPin.length === 6) {
        fetchLocationByPincode(cleanPin);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear field-level error on edit
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Asynchronously record cart drop-off in abandoned_carts
  const trackCartDropoff = (currentData = formData, step = 'shipping_details') => {
    const contactEmail = currentData.email?.trim();
    const contactPhone = currentData.phone?.trim();
    if (!contactEmail && !contactPhone) return;
    if (itemsToCheckout.length === 0) return;

    fetch('/api/cart/abandoned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: currentData.fullName,
        email: contactEmail,
        phone: contactPhone,
        items: itemsToCheckout.map((it) => ({
          product_id: it.id || it.product_id,
          title: it.title || it.name,
          price: it.final_price || it.unit_price || it.price,
          quantity: it.quantity || 1,
          image: it.primary_image || it.image,
          bundle_type: it.bundle_type || 'single',
        })),
        total_value: grandTotal,
        checkout_step: step,
      }),
    }).catch(() => {});
  };

  // Field validation
  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Phone number is required.';
    } else if (cleanPhone.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = 'Address Line 1 is required.';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required.';
    }

    const cleanPincode = formData.pincode.trim();
    if (!cleanPincode) {
      errors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(cleanPincode)) {
      errors.pincode = 'Please enter a valid 6-digit Indian postal code.';
    }

    if (itemsToCheckout.length === 0) {
      errors.items = 'Your checkout items list is empty.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission & Razorpay flow
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare payload matching orderController.checkoutHandler
      const checkoutPayload = {
        cart_items: itemsToCheckout.map((it) => ({
          id: it.id || it.product_id,
          product_id: it.product_id || it.id,
          title: it.title || it.name || it.product_name,
          final_price: parseFloat(it.final_price || it.unit_price || it.price || 0),
          quantity: parseInt(it.quantity) || 1,
        })),
        address: {
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address_line_1: formData.addressLine1.trim(),
          address_line_2: formData.addressLine2.trim() || null,
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        notes: formData.notes.trim() || null,
        payment_method: paymentMethod === 'cod' ? 'cod' : 'razorpay',
      };

      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      // 2. Send Axios POST request to backend checkout route
      const response = await axios.post('/api/orders/checkout', checkoutPayload, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      const { data } = response;

      if (!data.success) {
        throw new Error(data.message || 'Failed to initialize payment session from server.');
      }

      // ── Handle Cash on Delivery (COD) Success ───────────────────
      if (data.is_cod) {
        clearCart();
        invalidateProductCache();

        const orderConfirmation = {
          orderNumber: data.order?.order_number || `WOOFF-${data.order_id}`,
          orderId: data.order_id || data.order?.id,
          totalAmount: ((data.amount || Math.round(grandTotal * 100)) / 100).toFixed(2),
          customerName: formData.fullName,
          customerEmail: formData.email,
          shippingAddress: `${formData.addressLine1}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          isCod: true,
          paymentMethod: 'Cash on Delivery (COD)',
        };

        setSuccessOrder(orderConfirmation);
        if (typeof onOrderSuccess === 'function') {
          onOrderSuccess(orderConfirmation);
        }
        setIsSubmitting(false);
        return;
      }

      // ── Handle Razorpay Online Prepaid Flow ───────────────────────
      if (!data.razorpay_order_id) {
        throw new Error(data.message || 'Failed to initialize payment session from server.');
      }

      // 3. Ensure Razorpay checkout script is loaded
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        throw new Error('Could not load Razorpay payment SDK. Please check your internet connection.');
      }

      // 4. Initialize Razorpay modal using the returned order ID & amount
      const options = {
        key: data.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'Wooff Pet Care',
        description: `Order #${data.order?.order_number || data.order_id}`,
        order_id: data.razorpay_order_id,
        prefill: {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        theme: {
          color: '#4B2E1E',
        },
        handler: async function (paymentResponse) {
          try {
            // STEP 5: Verify payment signature via backend
            const verifyRes = await axios.post('/api/verify-payment', {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              order_id: data.order_id || data.order?.id,
            });

            if (verifyRes.data.success) {
              // Clear cart on successful purchase
              clearCart();
              // Invalidate cached product inventory so fresh real-time stock is reflected
              invalidateProductCache();

              const orderConfirmation = {
                orderNumber: data.order?.order_number || `WOOFF-${data.order_id}`,
                orderId: data.order_id || data.order?.id,
                paymentId: paymentResponse.razorpay_payment_id,
                totalAmount: (data.amount / 100).toFixed(2),
                customerName: formData.fullName,
                customerEmail: formData.email,
                shippingAddress: `${formData.addressLine1}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
              };

              setSuccessOrder(orderConfirmation);
              if (typeof onOrderSuccess === 'function') {
                onOrderSuccess(orderConfirmation);
              }
            } else {
              setErrorMessage(verifyRes.data.message || 'Payment signature verification failed.');
            }
          } catch (verErr) {
            console.error('Payment verification error:', verErr);
            setErrorMessage(
              verErr.response?.data?.message ||
              'Payment received, but confirmation sync failed. Please contact hello@wooff.care.'
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            trackCartDropoff(formData, 'payment_modal_dismissed');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (failResponse) {
        console.error('Razorpay payment failed:', failResponse.error);
        trackCartDropoff(formData, 'payment_failed');
        setErrorMessage(`Payment failed: ${failResponse.error?.description || 'Transaction declined.'}`);
        setIsSubmitting(false);
      });

      trackCartDropoff(formData, 'payment_modal_opened');
      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout submission error:', err);
      const apiMsg = err.response?.data?.message || err.message;
      setErrorMessage(apiMsg || 'An error occurred while creating your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Render Success Screen if payment completed
  if (successOrder) {
    return (
      <div className="checkout-success-container">
        <div className="success-icon-badge">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2 className="success-title">Order Confirmed!</h2>
        <p className="success-subtitle">
          Thank you, <strong>{successOrder.customerName}</strong>. Your dental care order is in motion!
        </p>

        <div className="order-details-card">
          <div className="detail-row">
            <span className="detail-label">Order Reference:</span>
            <strong className="detail-value detail-value-order">{successOrder.orderNumber}</strong>
          </div>
          {successOrder.isCod ? (
            <div className="detail-row">
              <span className="detail-label">Payment Mode:</span>
              <strong className="detail-value" style={{ color: '#2e7d32' }}>
                <i className="fa-solid fa-money-bill-wave me-1"></i> Cash on Delivery (COD)
              </strong>
            </div>
          ) : (
            <div className="detail-row">
              <span className="detail-label">Payment ID:</span>
              <code className="detail-value detail-value-code">{successOrder.paymentId}</code>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">{successOrder.isCod ? 'Amount Due on Delivery:' : 'Amount Paid:'}</span>
            <strong className="detail-value" style={{ fontSize: '1.1rem', color: '#4B2E1E' }}>₹{successOrder.totalAmount}</strong>
          </div>
          <div className="detail-row">
            <span className="detail-label">Shipping To:</span>
            <span className="detail-value">{successOrder.shippingAddress}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Confirmation Sent To:</span>
            <span className="detail-value detail-value-email">{successOrder.customerEmail}</span>
          </div>
        </div>

        <div className="fulfillment-badge">
          <i className="fa-solid fa-truck-fast me-2"></i>
          Automated Fast Dispatch scheduled via Shiprocket Logistics.
        </div>

        <div className="success-actions">
          <button 
            type="button" 
            className="btn-primary-action"
            onClick={() => navigate(`/track/${encodeURIComponent(successOrder.orderNumber)}`)}
          >
            <i className="fa-solid fa-route me-2"></i>
            Track This Order
          </button>
          <button 
            type="button" 
            className="btn-secondary-action"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-component-wrapper">
      <form id="checkoutForm" onSubmit={handleSubmit} noValidate className="checkout-grid">
        {/* LEFT COLUMN: Shipping Address Form */}
        <div className="checkout-form-column">
          <div className="checkout-card">
            <div className="checkout-header">
              <h2 className="checkout-title">
                <i className="fa-solid fa-location-dot me-2 text-primary-color"></i>
                Delivery & Shipping Address
              </h2>
              <p className="checkout-subtitle">
                Please enter the address where you would like your Wooff order delivered.
              </p>
            </div>

            {errorMessage && (
              <div className="checkout-error-banner" role="alert">
                <i className="fa-solid fa-circle-exclamation me-2"></i>
                {errorMessage}
              </div>
            )}

            <div>
              {/* Full Name */}
              <div className="form-group mb-2 mb-md-3">
                <label htmlFor="fullName" className="form-label">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`form-control custom-input ${formErrors.fullName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Priya Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {formErrors.fullName && <div className="invalid-feedback">{formErrors.fullName}</div>}
              </div>

              {/* Email & Phone */}
              <div className="row g-2 g-md-3 mb-2 mb-md-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control custom-input ${formErrors.email ? 'is-invalid' : ''}`}
                    placeholder="priya@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => trackCartDropoff(formData, 'shipping_details')}
                    disabled={isSubmitting}
                  />
                  {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="phone" className="form-label">
                    10-digit Phone Number <span className="required-star">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text country-prefix">+91</span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      maxLength={10}
                      className={`form-control custom-input ${formErrors.phone ? 'is-invalid' : ''}`}
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => trackCartDropoff(formData, 'shipping_details')}
                      disabled={isSubmitting}
                    />
                  </div>
                  {formErrors.phone && <div className="text-danger small mt-1">{formErrors.phone}</div>}
                </div>
              </div>

              {/* Address Line 1 */}
              <div className="form-group mb-2 mb-md-3">
                <label htmlFor="addressLine1" className="form-label">
                  Address Line 1 (Flat, House no., Building, Street) <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  className={`form-control custom-input ${formErrors.addressLine1 ? 'is-invalid' : ''}`}
                  placeholder="Flat 402, Sunshine Apartments, MG Road"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {formErrors.addressLine1 && <div className="invalid-feedback">{formErrors.addressLine1}</div>}
              </div>

              {/* Address Line 2 */}
              <div className="form-group mb-2 mb-md-3">
                <label htmlFor="addressLine2" className="form-label">
                  Address Line 2 (Apartment, Area, Sector, Landmark) <span className="optional-tag">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  className="form-control custom-input"
                  placeholder="Near Central Park, Bandra West"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              {/* Pincode (Auto-fetches City & State), City & State */}
              <div className="row g-2 g-md-3 mb-2 mb-md-3">
                <div className="col-6 col-md-4">
                  <label htmlFor="pincode" className="form-label d-flex justify-content-between align-items-center">
                    <span>
                      Pincode <span className="required-star">*</span>
                    </span>
                    {isFetchingPincode && (
                      <span className="spinner-border spinner-border-sm text-primary-color" role="status" aria-hidden="true"></span>
                    )}
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      maxLength={6}
                      className={`form-control custom-input ${formErrors.pincode ? 'is-invalid' : ''}`}
                      placeholder="e.g. 400050"
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {isFetchingPincode && (
                      <div className="pincode-fetch-indicator">
                        <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>
                      </div>
                    )}
                  </div>
                  {formErrors.pincode && <div className="invalid-feedback d-block">{formErrors.pincode}</div>}
                </div>

                <div className="col-6 col-md-4">
                  <label htmlFor="city" className="form-label">
                    City <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`form-control custom-input ${formErrors.city ? 'is-invalid' : ''}`}
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {formErrors.city && <div className="invalid-feedback">{formErrors.city}</div>}
                </div>

                <div className="col-12 col-md-4">
                  <label htmlFor="state" className="form-label">
                    State <span className="required-star">*</span>
                  </label>
                  <select
                    id="state"
                    name="state"
                    className={`form-select custom-input ${formErrors.state ? 'is-invalid' : ''}`}
                    value={formData.state}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {formErrors.state && <div className="invalid-feedback">{formErrors.state}</div>}
                </div>
              </div>

              {/* Optional Notes */}
              <div className="form-group mb-4">
                <label htmlFor="notes" className="form-label">
                  Delivery Instructions <span className="optional-tag">(Optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  className="form-control custom-input"
                  placeholder="e.g. Ring the bell twice, leave with security guard if unavailable."
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="checkout-summary-column">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>

            {itemsToCheckout.length === 0 ? (
              <div className="empty-summary-alert">
                <i className="fa-solid fa-cart-shopping me-2"></i>
                No items selected for checkout.
              </div>
            ) : (
              <div className="summary-items-list">
                {itemsToCheckout.map((item, idx) => {
                  const unitPrice = parseFloat(item.final_price || item.unit_price || item.price || 0);
                  const qty = parseInt(item.quantity) || 1;
                  const itemImg = item.primary_image || item.image || (item.images && item.images[0]) || '/assets/tooth_paste.webp';

                  return (
                    <div key={item.id || item.product_id || idx} className="summary-item-row">
                      <div className="summary-item-img-wrap">
                        <img src={itemImg} alt={item.title || item.name} />
                        <span className="summary-item-badge">{qty}</span>
                      </div>
                      <div className="summary-item-details">
                        <div className="summary-item-name">
                          {item.slug === 'choco-toothpaste' || String(item.product_id || item.id) === '9'
                            ? 'Wooff Kids Choco Toothpaste 50g (Above 2 Years)'
                            : (item.title || item.name || 'Wooff Kids Toothpaste')}
                        </div>
                        <div className="summary-item-qty">Qty: {qty}</div>
                      </div>
                      <div className="summary-item-price">₹{(unitPrice * qty).toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-cost-breakdown">
              <div className="cost-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="cost-row">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <strong className="text-success">FREE</strong> : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              {shippingCost > 0 && (
                <div className="free-shipping-hint">
                  Add ₹{(500 - subtotal).toFixed(2)} more for <strong>FREE Delivery</strong>!
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="cost-row grand-total-row">
                <span>Total Amount</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="checkout-payment-section">
              <span className="checkout-payment-heading">Select Payment Method</span>

              {/* 1. Online Payment (Razorpay Live) */}
              <div
                className={`payment-option-card ${paymentMethod === 'online' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('online')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setPaymentMethod('online')}
              >
                <input
                  type="radio"
                  id="pay-online"
                  name="paymentMethodOption"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                />
                <div className="payment-option-content">
                  <label htmlFor="pay-online" className="payment-option-title mb-0">
                    💳 Online Payment
                    <span className="payment-option-badge">Instant</span>
                  </label>
                  <span className="payment-option-desc">
                    Instant UPI (GPay, PhonePe, Paytm), Cards & NetBanking via Razorpay
                  </span>
                </div>
              </div>

              {/* 2. Cash on Delivery (COD) */}
              <div
                className={`payment-option-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setPaymentMethod('cod')}
              >
                <input
                  type="radio"
                  id="pay-cod"
                  name="paymentMethodOption"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div className="payment-option-content">
                  <label htmlFor="pay-cod" className="payment-option-title mb-0">
                    💵 Cash on Delivery (COD)
                  </label>
                  <span className="payment-option-desc">
                    Pay with cash or UPI at your doorstep upon delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Action / Submit Button */}
            <button
              type="submit"
              id="submitCheckoutBtn"
              className={`checkout-submit-btn ${paymentMethod === 'cod' ? 'cod-mode' : ''}`}
              disabled={isSubmitting || itemsToCheckout.length === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {paymentMethod === 'cod' ? 'Confirming Your Order...' : 'Connecting to Razorpay Secure Gateway...'}
                </>
              ) : paymentMethod === 'cod' ? (
                <>
                  <i className="fa-solid fa-truck-fast me-2"></i>
                  PLACE ORDER (CASH ON DELIVERY)
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock me-2"></i>
                  PAY ₹{grandTotal.toFixed(2)} VIA RAZORPAY
                </>
              )}
            </button>

            {/* Trust Indicators */}
            <div className="checkout-trust-indicators">
              <span>
                <i className="fa-solid fa-shield-halved text-success me-1"></i> 256-Bit SSL
              </span>
              <span>
                <i className="fa-solid fa-bolt text-warning me-1"></i> Instant Sync
              </span>
              <span>
                <i className="fa-solid fa-truck text-primary me-1"></i> Express Delivery
              </span>
            </div>

            {paymentMethod === 'online' && (
              <div className="payment-gateways-accepted">
                <span className="gateways-label">Accepted Payment Methods:</span>
                <div className="gateways-icons">
                  <span className="badge bg-light text-dark border">UPI (GPay / PhonePe / Paytm)</span>
                  <span className="badge bg-light text-dark border">Credit & Debit Cards</span>
                  <span className="badge bg-light text-dark border">NetBanking</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
