import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Banner from '../../components/Banner/Banner';
import { API_ENDPOINTS } from '../../api';
import './Account.css';

export default function Account() {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  // Active Navigation Tab: 'overview' | 'orders' | 'addresses' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipient_name: user?.username || user?.fullName || '',
    phone: user?.phone_number || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    address_type: 'Home',
    is_default: true,
  });

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    username: user?.username || user?.fullName || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    childName: user?.childName || '',
  });

  const [toastMessage, setToastMessage] = useState('');

  // Sync profile form when user state loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || user.fullName || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        childName: user.childName || '',
      });
      setAddressForm((prev) => ({
        ...prev,
        recipient_name: user.username || user.fullName || '',
        phone: user.phone_number || '',
      }));
    }
  }, [user]);

  // Fetch Orders & Addresses
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const token = localStorage.getItem('wooff_token') || localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(API_ENDPOINTS.ORDERS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.orders || (Array.isArray(data) ? data : []);
          setOrders(list);
        }
      } catch (err) {
        console.warn('Orders fetch note:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('wooff_token') || localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(API_ENDPOINTS.ADDRESSES, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.addresses || (Array.isArray(data) ? data : []);
          setAddresses(list);
        }
      } catch (err) {
        console.warn('Addresses fetch note:', err);
      }
    };

    fetchOrders();
    fetchAddresses();
  }, [isAuthenticated]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Save Profile Changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.username.trim()) {
      triggerToast('Please enter your full name.');
      return;
    }

    updateUser(profileForm);
    triggerToast('Profile updated successfully!');
  };

  // Save New Delivery Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.address_line_1 || !addressForm.city || !addressForm.postal_code) {
      triggerToast('Please fill in address, city, and pincode.');
      return;
    }

    try {
      const token = localStorage.getItem('wooff_token') || localStorage.getItem('token');
      if (token) {
        const res = await fetch(API_ENDPOINTS.ADDRESSES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(addressForm),
        });
        if (res.ok) {
          const data = await res.json();
          const savedAddr = data.address || data;
          setAddresses((prev) => [savedAddr, ...prev]);
        } else {
          setAddresses((prev) => [{ id: Date.now(), ...addressForm }, ...prev]);
        }
      } else {
        setAddresses((prev) => [{ id: Date.now(), ...addressForm }, ...prev]);
      }
    } catch {
      setAddresses((prev) => [{ id: Date.now(), ...addressForm }, ...prev]);
    }

    setShowAddressModal(false);
    triggerToast('Delivery address saved!');
    setAddressForm({
      recipient_name: user?.username || user?.fullName || '',
      phone: user?.phone_number || '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      address_type: 'Home',
      is_default: false,
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="account-portal-wrapper">
        <Banner breadcrumb="HOME / MY ACCOUNT" title="My Account" />
        <div className="container py-5 text-center">
          <div className="account-content-card mx-auto" style={{ maxWidth: '480px' }}>
            <div className="empty-state-icon">
              <i className="fa-solid fa-lock" />
            </div>
            <h2 className="tab-header-title">Please Sign In</h2>
            <p className="tab-header-subtitle">
              Log in to view your orders, delivery addresses, and account details.
            </p>
            <Link to="/login" className="btn-wooff-save d-inline-block text-decoration-none">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initialLetter = (user.username || user.fullName || 'U')
    .charAt(0)
    .toUpperCase();

  return (
    <div className="account-portal-wrapper">
      {/* 1. Header Banner */}
      <Banner breadcrumb="HOME / MY ACCOUNT" title="My Account" />

      <div className="account-portal-container">
        {toastMessage && (
          <div className="account-toast-alert success">
            <i className="fa-solid fa-circle-check" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="account-dashboard-grid">
          
          {/* -------------------------------------------------------------
              LEFT SIDEBAR: User Info & Navigation
             ------------------------------------------------------------- */}
          <aside className="account-sidebar-card">
            <div className="sidebar-profile-header">
              <div className="account-avatar-large">
                {initialLetter}
              </div>
              <h2 className="sidebar-user-name">
                {user.username || user.fullName || 'Account User'}
              </h2>
              <div className="sidebar-user-email">
                {user.email || user.phone_number || ''}
              </div>
            </div>

            <nav className="sidebar-nav-menu" aria-label="Account navigation">
              <button
                type="button"
                className={`sidebar-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <div className="sidebar-nav-btn-content">
                  <i className="fa-solid fa-user" />
                  <span>Account Overview</span>
                </div>
                <i className="fa-solid fa-chevron-right small text-muted" />
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <div className="sidebar-nav-btn-content">
                  <i className="fa-solid fa-box" />
                  <span>My Orders</span>
                </div>
                {orders.length > 0 && (
                  <span className="nav-badge-pill">{orders.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <div className="sidebar-nav-btn-content">
                  <i className="fa-solid fa-location-dot" />
                  <span>Saved Addresses</span>
                </div>
                <i className="fa-solid fa-chevron-right small text-muted" />
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <div className="sidebar-nav-btn-content">
                  <i className="fa-solid fa-gear" />
                  <span>Account Settings</span>
                </div>
                <i className="fa-solid fa-chevron-right small text-muted" />
              </button>
            </nav>

            <div className="sidebar-footer-actions">
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-arrow-right-from-bracket" /> Sign Out
              </button>
            </div>
          </aside>

          {/* -------------------------------------------------------------
              RIGHT MAIN CONTENT AREA
             ------------------------------------------------------------- */}
          <main className="account-content-card">
            
            {/* TAB 1: ACCOUNT OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <h1 className="tab-header-title">
                  Hello, {user.username || user.fullName || 'User'}
                </h1>
                <p className="tab-header-subtitle">
                  Manage your personal information, view recent orders, and update delivery addresses.
                </p>

                {/* Account Details Box */}
                <div className="mb-4 p-3 rounded-4" style={{ background: '#FAF7F2', border: '1.5px solid rgba(75, 46, 30, 0.08)' }}>
                  <h5 className="fw-bold mb-3" style={{ color: '#4B2E1E' }}>
                    <i className="fa-solid fa-id-card me-2 text-muted" /> Personal Information
                  </h5>

                  <div className="info-row">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{user.username || user.fullName || 'Not provided'}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{user.email || 'Not provided'}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{user.phone_number || 'Not provided'}</span>
                  </div>

                  {user.childName && (
                    <div className="info-row">
                      <span className="info-label">Child's Name</span>
                      <span className="info-value">{user.childName}</span>
                    </div>
                  )}
                </div>

                {/* Recent Orders Section */}
                <div className="mt-4 pt-2">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0" style={{ color: '#4B2E1E' }}>
                      <i className="fa-solid fa-clock-rotate-left me-2 text-muted" /> Recent Orders
                    </h5>
                    {orders.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none fw-bold small p-0"
                        style={{ color: '#e58b57' }}
                        onClick={() => setActiveTab('orders')}
                      >
                        View All Orders →
                      </button>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-4 rounded-3 text-center" style={{ background: '#FAF7F2', border: '1.5px dashed rgba(75, 46, 30, 0.15)' }}>
                      <p className="text-muted mb-3 small">You haven't placed any orders yet.</p>
                      <Link to="/products" className="btn btn-dark rounded-pill fw-bold btn-sm px-4">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="orders-list-wrap">
                      {orders.slice(0, 2).map((order) => (
                        <div key={order.id} className="order-history-card">
                          <div className="order-card-header">
                            <div>
                              <span className="order-number">Order #{order.order_number || order.id}</span>
                              <span className="order-date ms-2">
                                • {order.created_at ? String(order.created_at).split('T')[0] : 'Recent'}
                              </span>
                            </div>
                            <span className={`order-status-badge ${order.order_status || 'pending'}`}>
                              {order.order_status || 'Pending'}
                            </span>
                          </div>
                          <div className="order-card-body">
                            <div className="small text-muted">
                              Total Amount: <span className="order-total-amount">₹{order.total_amount}</span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-dark btn-sm rounded-pill fw-bold"
                              onClick={() => setActiveTab('orders')}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Action Button */}
                <div className="mt-4 pt-3 border-top">
                  <Link to="/products" className="btn-wooff-save d-inline-block text-decoration-none">
                    <i className="fa-solid fa-tooth me-2" /> Explore Toothpastes
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: MY ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <h1 className="tab-header-title">My Orders</h1>
                <p className="tab-header-subtitle">
                  Track deliveries and view your previous purchases.
                </p>

                {loadingOrders ? (
                  <div className="py-5 text-center text-muted">
                    <div className="spinner-border text-dark mb-2" role="status" />
                    <p className="small">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="empty-tab-state">
                    <div className="empty-state-icon">
                      <i className="fa-solid fa-box-open" />
                    </div>
                    <h3 className="fw-bold mb-2" style={{ color: '#4B2E1E' }}>No Orders Found</h3>
                    <p className="text-muted mb-4 small" style={{ maxWidth: '360px', margin: '0 auto' }}>
                      You haven't made any purchases yet.
                    </p>
                    <Link to="/products" className="btn-wooff-save d-inline-block text-decoration-none">
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div className="orders-list-wrap">
                    {orders.map((order) => (
                      <div key={order.id} className="order-history-card">
                        <div className="order-card-header">
                          <div>
                            <span className="order-number">Order #{order.order_number || order.id}</span>
                            <span className="order-date ms-2">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                            </span>
                          </div>
                          <span className={`order-status-badge ${order.order_status || 'pending'}`}>
                            {order.order_status || 'Pending'}
                          </span>
                        </div>

                        <div className="order-card-body">
                          <div className="order-product-thumbnails">
                            <img
                              src="/assets/tooth_paste.png"
                              alt="Wooff Product"
                              className="order-thumb-img"
                            />
                            <div>
                              <div className="fw-bold text-dark small">Wooff Toothpaste</div>
                              <div className="text-muted small">
                                {order.payment_status === 'paid' ? 'Payment Completed' : 'Payment Pending'}
                              </div>
                            </div>
                          </div>

                          <div className="text-end">
                            <div className="small text-muted">Total</div>
                            <div className="order-total-amount">₹{order.total_amount}</div>
                          </div>
                        </div>

                        {order.shipping_city && (
                          <div className="pt-2 border-top border-light text-muted small">
                            <i className="fa-solid fa-location-dot me-1" />
                            Shipping to: {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h1 className="tab-header-title mb-1">Delivery Addresses</h1>
                    <p className="tab-header-subtitle mb-0">
                      Manage shipping addresses for faster checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-dark rounded-pill fw-bold px-3 py-2"
                    onClick={() => setShowAddressModal(true)}
                  >
                    <i className="fa-solid fa-plus me-1" /> Add Address
                  </button>
                </div>

                <div className="addresses-grid mt-4">
                  {addresses.length === 0 ? (
                    <div className="p-4 rounded-3 text-center col-span-2" style={{ background: '#FAF7F2', border: '1.5px dashed rgba(75, 46, 30, 0.15)' }}>
                      <p className="text-muted mb-3 small">No saved addresses yet.</p>
                      <button
                        type="button"
                        className="btn btn-sm btn-dark rounded-pill fw-bold"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr.id} className={`address-item-card ${addr.is_default ? 'default-address' : ''}`}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="address-tag-badge">{addr.address_type || 'Home'}</span>
                          {addr.is_default && (
                            <span className="badge bg-light text-dark border small fw-bold">Default</span>
                          )}
                        </div>
                        <div className="fw-bold text-dark">{addr.recipient_name}</div>
                        <div className="address-details-text">
                          {addr.address_line_1}<br />
                          {addr.address_line_2 && <>{addr.address_line_2}<br /></>}
                          {addr.city}, {addr.state} - {addr.postal_code}
                        </div>
                        {addr.phone && <div className="small text-muted">Phone: {addr.phone}</div>}
                      </div>
                    ))
                  )}
                </div>

                {/* Add Address Modal */}
                {showAddressModal && (
                  <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content rounded-4 p-3 border-2 border-dark">
                        <div className="modal-header border-0 pb-0">
                          <h5 className="modal-title fw-bold" style={{ color: '#4B2E1E' }}>Add Delivery Address</h5>
                          <button type="button" className="btn-close" onClick={() => setShowAddressModal(false)} />
                        </div>
                        <form onSubmit={handleSaveAddress}>
                          <div className="modal-body">
                            <div className="mb-2">
                              <label className="form-label small fw-bold">Recipient Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={addressForm.recipient_name}
                                onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="mb-2">
                              <label className="form-label small fw-bold">Phone Number *</label>
                              <input
                                type="tel"
                                className="form-control"
                                value={addressForm.phone}
                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                required
                              />
                            </div>
                            <div className="mb-2">
                              <label className="form-label small fw-bold">Address (Flat/House/Street) *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={addressForm.address_line_1}
                                onChange={(e) => setAddressForm({ ...addressForm, address_line_1: e.target.value })}
                                required
                              />
                            </div>
                            <div className="row g-2 mb-2">
                              <div className="col-6">
                                <label className="form-label small fw-bold">City *</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={addressForm.city}
                                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label small fw-bold">Postal Code *</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={addressForm.postal_code}
                                  onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => setShowAddressModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-dark rounded-pill fw-bold">Save Address</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ACCOUNT SETTINGS */}
            {activeTab === 'settings' && (
              <div>
                <h1 className="tab-header-title">Account Settings</h1>
                <p className="tab-header-subtitle">
                  Update your name, contact phone, and account email.
                </p>

                <form onSubmit={handleSaveProfile}>
                  <div className="settings-form-grid">
                    <div className="settings-input-group">
                      <label className="settings-label">Full Name *</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="settings-input-group">
                      <label className="settings-label">Email Address</label>
                      <input
                        type="email"
                        className="settings-input"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </div>

                    <div className="settings-input-group">
                      <label className="settings-label">Phone Number</label>
                      <input
                        type="tel"
                        className="settings-input"
                        value={profileForm.phone_number}
                        onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="settings-input-group">
                      <label className="settings-label">Child's Name (Optional)</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={profileForm.childName}
                        onChange={(e) => setProfileForm({ ...profileForm, childName: e.target.value })}
                        placeholder="Child's Name"
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                    <button type="submit" className="btn-wooff-save">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

          </main>

        </div>
      </div>
    </div>
  );
}
