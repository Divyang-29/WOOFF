import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './TrackOrder.css';

const TIMELINE_STAGES = [
  { key: 'pending', label: 'Order Placed', desc: 'Order received & recorded' },
  { key: 'processing', label: 'Processing', desc: 'Packed & scheduled with Shiprocket' },
  { key: 'shipped', label: 'Shipped', desc: 'Handed over to courier partner' },
  { key: 'delivered', label: 'Delivered', desc: 'Safely delivered to customer' },
];

export default function TrackOrder() {
  const { order_number: routeOrderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const queryOrder = searchParams.get('order') || searchParams.get('id');

  const [orderNumberInput, setOrderNumberInput] = useState(routeOrderNumber || queryOrder || '');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-fetch if order_number was provided in URL params
  useEffect(() => {
    const initialOrder = routeOrderNumber || queryOrder;
    if (initialOrder && initialOrder.trim()) {
      setOrderNumberInput(initialOrder.trim());
      handleTrackOrder(initialOrder.trim());
    }
  }, [routeOrderNumber, queryOrder]);

  const handleTrackOrder = async (queryNumber) => {
    const target = (queryNumber || orderNumberInput || '').trim();
    if (!target) {
      setError('Please enter a valid order reference number.');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const response = await axios.get(`/api/orders/track/${encodeURIComponent(target)}`);
      if (response.data.success && response.data.order) {
        setCurrentOrder(response.data.order);
      } else {
        setCurrentOrder(null);
        setError(response.data.message || 'Order not found.');
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setCurrentOrder(null);
      setError(
        err.response?.data?.message ||
        `No order found with reference "${target}". Please verify the number from your confirmation email/receipt.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrackOrder(orderNumberInput);
  };

  // Determine stage progression index for the timeline
  const getStageIndex = (status) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'processing' || s === 'confirmed') return 1;
    return 0; // 'pending' or default
  };

  const activeStageIndex = currentOrder ? getStageIndex(currentOrder.order_status) : 0;
  const isCancelled = currentOrder && (currentOrder.order_status === 'cancelled' || currentOrder.order_status === 'returned');

  return (
    <div className="track-order-page">
      <div className="container py-4 py-md-5">
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="track-breadcrumb mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products" className="text-decoration-none">Shop</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Track Order
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="track-header text-center mb-4 mb-md-5">
          <div className="track-header-icon-wrap mb-3">
            <i className="fa-solid fa-truck-fast"></i>
          </div>
          <h1 className="track-page-title">Track Your Order</h1>
          <p className="track-page-subtitle">
            Enter your Wooff order reference number to check live shipping status & tracking details.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="track-search-card mb-5">
          <form onSubmit={handleSubmit} className="track-search-form">
            <div className="input-group track-input-group">
              <span className="input-group-text track-icon-prefix">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                className="form-control track-input"
                placeholder="e.g. WOOFF-ORD-84714988-5027"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn track-search-btn"
                disabled={loading || !orderNumberInput.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-compass me-2"></i>
                    Track Order
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick example pill */}
          <div className="track-example-row">
            <span className="text-muted small">Recent order:</span>
            <button
              type="button"
              className="example-pill-btn"
              onClick={() => {
                setOrderNumberInput('WOOFF-ORD-84714988-5027');
                handleTrackOrder('WOOFF-ORD-84714988-5027');
              }}
            >
              WOOFF-ORD-84714988-5027
            </button>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="track-error-card mb-5" role="alert">
            <div className="error-icon">
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <div className="error-content">
              <h4>Order Not Found</h4>
              <p>{error}</p>
              <span className="error-tip">
                Tip: Please make sure you included the full order number including the "WOOFF-ORD-" prefix.
              </span>
            </div>
          </div>
        )}

        {/* ORDER DETAILS & TRACKING TIMELINE */}
        {currentOrder && (
          <div className="track-result-wrapper">
            {/* Top Status Card */}
            <div className="track-summary-card mb-4">
              <div className="summary-card-header">
                <div>
                  <span className="summary-order-badge">Order Reference</span>
                  <h2 className="summary-order-number">{currentOrder.order_number}</h2>
                  <div className="summary-meta-row">
                    <span>
                      <i className="fa-regular fa-calendar me-1"></i>
                      {new Date(currentOrder.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-capitalize">
                      <i className="fa-solid fa-credit-card me-1"></i>
                      Payment: <strong>{currentOrder.payment_status}</strong>
                    </span>
                  </div>
                </div>

                <div className="summary-status-pill-wrap">
                  <span className={`status-pill status-${currentOrder.order_status}`}>
                    {currentOrder.order_status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* TIMELINE VISUALIZATION (Pending -> Processing -> Shipped -> Delivered) */}
              <div className="timeline-container">
                <h3 className="timeline-heading">
                  <i className="fa-solid fa-route me-2 text-primary-color"></i>
                  Delivery Progress Timeline
                </h3>

                {isCancelled ? (
                  <div className="cancelled-banner">
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    This order has been marked as <strong>{currentOrder.order_status.toUpperCase()}</strong>.
                  </div>
                ) : (
                  <div className="timeline-track">
                    {TIMELINE_STAGES.map((stage, idx) => {
                      const isCompleted = idx < activeStageIndex;
                      const isCurrent = idx === activeStageIndex;
                      const isPending = idx > activeStageIndex;

                      return (
                        <div
                          key={stage.key}
                          className={`timeline-step ${
                            isCompleted ? 'step-completed' : isCurrent ? 'step-current' : 'step-pending'
                          }`}
                        >
                          <div className="step-marker">
                            {isCompleted ? (
                              <i className="fa-solid fa-check"></i>
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          <div className="step-info">
                            <span className="step-label">{stage.label}</span>
                            <span className="step-desc">{stage.desc}</span>
                          </div>
                          {idx < TIMELINE_STAGES.length - 1 && (
                            <div className={`step-connector ${isCompleted ? 'connector-active' : ''}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SHIPROCKET LIVE SHIPMENT TRACKING CARD */}
            {currentOrder.shiprocket_awb_code ? (
              <div className="shiprocket-tracking-card mb-4">
                <div className="sr-header-row">
                  <div className="sr-badge-title">
                    <i className="fa-solid fa-box-open me-2 text-primary-color"></i>
                    Live Logistics & Dispatch Details
                  </div>
                  <span className="sr-logistics-partner">Powered by Shiprocket</span>
                </div>

                <div className="sr-details-grid">
                  <div className="sr-info-box">
                    <span className="sr-info-label">Courier Partner</span>
                    <span className="sr-info-value">
                      <i className="fa-solid fa-truck text-muted me-2"></i>
                      {currentOrder.shiprocket_courier_name || 'Shiprocket Courier Partner'}
                    </span>
                  </div>

                  <div className="sr-info-box">
                    <span className="sr-info-label">AWB Tracking Number</span>
                    <span className="sr-info-value code-font">
                      {currentOrder.shiprocket_awb_code}
                    </span>
                  </div>

                  <div className="sr-info-box">
                    <span className="sr-info-label">Current Logistics Status</span>
                    <span className="sr-info-value status-highlight">
                      {currentOrder.shiprocket_status || 'In Transit'}
                    </span>
                  </div>
                </div>

                {/* Clickable button labeled 'Track Live Shipment' linking to https://shiprocket.co/tracking/{awb} */}
                <div className="sr-action-row">
                  <a
                    href={`https://shiprocket.co/tracking/${currentOrder.shiprocket_awb_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-track-live"
                  >
                    <i className="fa-solid fa-location-arrow me-2"></i>
                    Track Live Shipment
                    <i className="fa-solid fa-arrow-up-right-from-square ms-2 small"></i>
                  </a>
                </div>
              </div>
            ) : currentOrder.shiprocket_order_id ? (
              <div className="shiprocket-pending-card mb-4">
                <div className="pending-icon">
                  <i className="fa-solid fa-boxes-packing"></i>
                </div>
                <div className="pending-content">
                  <h5>Shiprocket Dispatch Initiated</h5>
                  <p>
                    Order has been assigned Shiprocket Order ID <strong>#{currentOrder.shiprocket_order_id}</strong>.
                    Courier partner allocation & live AWB tracking number will be updated once courier pickup is assigned.
                  </p>
                </div>
              </div>
            ) : null}

            {/* ORDER ITEMS & DESTINATION DETAILS */}
            <div className="row g-4">
              {/* Left Column: Line Items */}
              <div className="col-md-7">
                <div className="track-items-card">
                  <h4 className="card-section-title">
                    <i className="fa-solid fa-basket-shopping me-2 text-primary-color"></i>
                    Ordered Items
                  </h4>
                  <div className="track-items-list">
                    {(currentOrder.items || []).map((item) => (
                      <div key={item.id} className="track-item-row">
                        <div className="track-item-info">
                          <span className="track-item-name">{item.product_name}</span>
                          <span className="track-item-sku">SKU: {item.product_sku || 'WOOFF-SKU'}</span>
                        </div>
                        <div className="track-item-qty">Qty: {item.quantity}</div>
                        <div className="track-item-price">
                          ₹{parseFloat(item.line_total || (item.unit_price * item.quantity)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="track-total-row">
                    <span>Total Amount Paid:</span>
                    <strong>₹{parseFloat(currentOrder.total_amount).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Destination Shipping Address */}
              <div className="col-md-5">
                <div className="track-destination-card">
                  <h4 className="card-section-title">
                    <i className="fa-solid fa-location-dot me-2 text-primary-color"></i>
                    Delivery Destination
                  </h4>
                  <div className="destination-details">
                    <p className="destination-name">
                      <strong>{currentOrder.customer_name}</strong>
                    </p>
                    <p className="destination-address">
                      {currentOrder.shipping_address_line_1}
                      {currentOrder.shipping_address_line_2 ? `, ${currentOrder.shipping_address_line_2}` : ''}
                    </p>
                    <p className="destination-city">
                      {currentOrder.shipping_city}, {currentOrder.shipping_state} - {currentOrder.shipping_postal_code}
                    </p>
                    <div className="destination-badge">
                      <i className="fa-solid fa-shield-halved text-success me-1"></i>
                      Insured Standard Delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
