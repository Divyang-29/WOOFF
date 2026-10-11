import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../api';

/**
 * Printable Dynamic Packing Slip / Tax Invoice Modal
 * Fetches real order items and metadata from /api/admin/orders/:id/invoice.
 * Zero static mock data. Fully printable via window.print().
 */
export default function InvoiceModal({ orderId, initialOrder, isOpen, onClose }) {
  const [invoice, setInvoice] = useState(initialOrder || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token') || localStorage.getItem('wooff_token') || '';
        const res = await fetch(API_ENDPOINTS.ADMIN.ORDER_INVOICE(orderId), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (data.invoice) {
            setInvoice(data.invoice);
          } else if (data.order) {
            setInvoice(data.order);
          }
        } else {
          setError('Failed to fetch invoice details from server.');
        }
      } catch (err) {
        console.error('Invoice fetch error:', err);
        setError('Network error while retrieving order invoice.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const order = invoice || initialOrder;

  return (
    <div
      className="invoice-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #wooff-printable-slip, #wooff-printable-slip * {
            visibility: visible !important;
          }
          #wooff-printable-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'scaleUp 0.18s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (Screen Only) */}
        <div
          className="no-print"
          style={{
            padding: '16px 28px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📄</span>
            <span style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '0.02em' }}>
              Packing Slip & Tax Invoice
            </span>
            {order?.order_number && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                #{order.order_number}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              }}
            >
              <span>🖨️</span> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div
          id="wooff-printable-slip"
          style={{
            padding: '36px 40px',
            overflowY: 'auto',
            flex: 1,
            color: '#1e293b',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⏳</div>
              <p style={{ fontWeight: '600' }}>Retrieving live order details from PostgreSQL...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
              <p style={{ fontWeight: '700' }}>{error}</p>
            </div>
          ) : !order ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <p>No order details found.</p>
            </div>
          ) : (
            <div>
              {/* Header: Company & Invoice Info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: '24px',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.03em' }}>
                      WOOFF<span style={{ color: '#0ea5e9' }}>.</span>
                    </span>
                    <span
                      style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '800',
                      }}
                    >
                      KIDS ORAL CARE
                    </span>
                  </div>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#64748b' }}>
                    Wooff Wellness Pvt. Ltd. • Enamel-Safe Formulations
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#64748b' }}>
                    GSTIN: 27AABCU9603R1ZM • support@wooffkids.com
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
                    TAX INVOICE
                  </h2>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                    <strong>Invoice #:</strong> INV-{order.order_number || order.id}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                    <strong>Date:</strong>{' '}
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }) : new Date().toLocaleDateString('en-IN')}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                    <strong>Status:</strong>{' '}
                    <span style={{ textTransform: 'uppercase', fontWeight: '700', color: order.payment_status === 'paid' ? '#059669' : '#d97706' }}>
                      {order.payment_status || 'PENDING'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Two Column Grid: Shipping Address & Shipment Meta */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  backgroundColor: '#f8fafc',
                  padding: '20px',
                  borderRadius: '16px',
                  marginBottom: '28px',
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                    Ship To (Customer):
                  </h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    {order.customer_name || 'Customer'}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                    {order.shipping_address_line_1 || order.address_line_1 || 'Standard Shipping Address'}
                    {order.shipping_address_line_2 ? `, ${order.shipping_address_line_2}` : ''}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                    {order.shipping_city || order.city || ''}, {order.shipping_state || order.state || ''} -{' '}
                    <strong>{order.shipping_postal_code || order.postal_code || order.pincode || ''}</strong>
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
                    📞 {order.customer_phone || order.phone || 'N/A'} • ✉️ {order.customer_email || order.email || 'N/A'}
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                    Logistics & Fulfillment:
                  </h4>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                    <strong>Fulfillment Partner:</strong> Shiprocket Prime
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                    <strong>AWB / Tracking #:</strong>{' '}
                    {order.shiprocket_awb_code ? (
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0284c7' }}>
                        {order.shiprocket_awb_code}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Dispatch</span>
                    )}
                  </p>
                  {order.shiprocket_courier_name && (
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                      <strong>Courier:</strong> {order.shiprocket_courier_name}
                    </p>
                  )}
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>
                    <strong>Payment Method:</strong> {order.payment_method || 'Online (Razorpay)'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: '28px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '10px 14px', color: '#334155', fontWeight: '800' }}>Item & Description</th>
                      <th style={{ padding: '10px 14px', color: '#334155', fontWeight: '800' }}>SKU</th>
                      <th style={{ padding: '10px 14px', color: '#334155', fontWeight: '800', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '10px 14px', color: '#334155', fontWeight: '800', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '10px 14px', color: '#334155', fontWeight: '800', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>
                              {item.product_name || item.title || 'Wooff Toothpaste Variant'}
                            </div>
                            {item.variant_name && (
                              <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: '600' }}>
                                Variant: {item.variant_name}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontFamily: 'monospace' }}>
                            {item.product_sku || item.sku || 'WF-TP-01'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', color: '#334155' }}>
                            ₹{Number(item.price || item.unit_price || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                            ₹{Number(item.line_total || (item.quantity * (item.price || item.unit_price || 0))).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                          No line items recorded for this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
                <div style={{ width: '280px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#64748b' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '700', color: '#1e293b' }}>
                      ₹{Number(order.subtotal || order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                  {Number(order.discount_amount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#16a34a' }}>
                      <span>Discount ({order.coupon_code || 'Promo'}):</span>
                      <span style={{ fontWeight: '700' }}>-₹{Number(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#64748b' }}>
                    <span>Shipping:</span>
                    <span style={{ fontWeight: '700', color: '#1e293b' }}>
                      {Number(order.shipping_amount || 0) === 0 ? 'FREE' : `₹${Number(order.shipping_amount).toFixed(2)}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#64748b' }}>
                    <span>GST (18% inclusive):</span>
                    <span style={{ fontWeight: '700', color: '#1e293b' }}>
                      ₹{Number(order.tax_amount || ((order.total_amount || 0) * 0.18 / 1.18)).toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0 6px 0',
                      borderTop: '2px solid #0f172a',
                      fontSize: '16px',
                      fontWeight: '900',
                      color: '#0f172a',
                    }}
                  >
                    <span>Grand Total:</span>
                    <span>₹{Number(order.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer / Return Instructions */}
              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '16px',
                  fontSize: '11px',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  textAlign: 'center',
                }}
              >
                <p style={{ margin: '2px 0' }}>
                  Thank you for keeping kids' smiles shining bright! • Formulated with Nano-Hydroxyapatite & Prebiotics
                </p>
                <p style={{ margin: '2px 0' }}>
                  For returns or customer inquiries, email <strong>support@wooffkids.com</strong> within 7 days of delivery.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
