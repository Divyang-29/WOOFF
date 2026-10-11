import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../api';
import SalesTrendChart from '../../components/Admin/SalesTrendChart';
import ConfirmModal from '../../components/Admin/ConfirmModal';
import InvoiceModal from '../../components/Admin/InvoiceModal';
import { SkeletonCard, SkeletonTable } from '../../components/Admin/SkeletonLoader';
import './Admin.css';

export default function Admin() {
  const { user, login } = useAuth();

  // Admin Security Access State (Strict JWT / Role validation)
  const [adminAccessGranted, setAdminAccessGranted] = useState(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('wooff_token');
    const storedUser = localStorage.getItem('wooff_user');
    if (storedUser && token) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role === 'admin') return true;
      } catch (e) {}
    }
    return false;
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('wooff_token') || '';
  const getAuthHeader = () => (getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {});

  const handleLogoutAdmin = () => {
    localStorage.removeItem('wooff_admin_access');
    localStorage.removeItem('token');
    localStorage.removeItem('wooff_token');
    localStorage.removeItem('wooff_user');
    setAdminAccessGranted(false);
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      setAdminAccessGranted(true);
    } else if (user && user.role !== 'admin') {
      handleLogoutAdmin();
    }
  }, [user]);

  // Cryptographically verify Admin JWT token on mount
  useEffect(() => {
    const verifyAdminToken = async () => {
      const token = getAuthToken();
      if (!token) {
        setAdminAccessGranted(false);
        return;
      }
      try {
        const res = await fetch(API_ENDPOINTS.ADMIN.VERIFY, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          handleLogoutAdmin();
        } else {
          setAdminAccessGranted(true);
        }
      } catch (err) {
        console.error('Admin token verification network error:', err);
      }
    };
    verifyAdminToken();
  }, []);

  // Active Tab: 'dashboard' | 'products' | 'categories' | 'ingredients' | 'orders' | 'blogs' | 'coupons' | 'faqs' | 'terms' | 'contact' | 'users' | 'reels' | 'testimonials' | 'reviews' | 'audit_logs'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Loading & Alert Notifications
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState({ type: '', text: '' });

  // Pagination & Filtering States for Scalability
  const [ordersPagination, setOrdersPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [customersPagination, setCustomersPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [auditLogsPagination, setAuditLogsPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });

  // Search & Filter state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditEntityFilter, setAuditEntityFilter] = useState('');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // -------------------------------------------------------------------
  // ZERO STATIC MOCK DATA - 100% POSTGRESQL DRIVEN DATASETS
  // -------------------------------------------------------------------
  const [analytics, setAnalytics] = useState({
    total_revenue: 0,
    this_month_revenue: 0,
    last_month_revenue: 0,
    revenue_growth_percent: 0,
    total_orders_count: 0,
    active_orders_count: 0,
    ready_for_shipment_count: 0,
    shipped_orders_count: 0,
    delivered_orders_count: 0,
    total_customers: 0,
    new_customers_this_month: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_products_count: 0,
    top_selling_products: [],
    daily_sales_trends: [],
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [blogsList, setBlogsList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [faqsList, setFaqsList] = useState([]);
  const [termsData, setTermsData] = useState({ title: '', content: '', updated_at: '' });
  const [contactMessages, setContactMessages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [auditLogsList, setAuditLogsList] = useState([]);

  // -------------------------------------------------------------------
  // OPERATIONAL WORKFLOW & MODAL STATES
  // -------------------------------------------------------------------
  // Custom Confirmation Modal (Replaces native window.confirm)
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: true,
    loading: false,
    action: null,
  });

  // Printable Dynamic Packing Slip / Invoice Modal
  const [invoiceModalState, setInvoiceModalState] = useState({
    isOpen: false,
    orderId: null,
    order: null,
  });

  // Product CRUD Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    category_id: 1,
    price: '',
    final_price: '',
    stock: '',
    sku: '',
    primary_image: '',
    description: '',
    is_bestseller: false,
    bundle_type: 'single',
    low_stock_threshold: 10,
    variants: [],
  });

  // Hero Ingredients Formulation CMS Modal State
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    slug: '',
    sub_title: '',
    tag: '',
    description: '',
    benefits: '',
    badge_text: '',
    icon_url: '',
    display_order: 1,
    is_active: true,
  });

  // Shiprocket dispatch state
  const [fulfillingOrderId, setFulfillingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const initialBlogState = {
    title: '',
    slug: '',
    category: 'Pediatric Dental Science',
    tags: 'FluorideFree, NanoHydroxyapatite, OralHealth',
    author: 'Dr. Ananya Sharma',
    author_role: 'Pediatric Dental Specialist',
    author_avatar: '',
    author_bio: '',
    reading_time: '5 min read',
    image_url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80',
    image_caption: '',
    excerpt: '',
    content: '',
    conclusion_takeaways: '',
  };
  const [blogForm, setBlogForm] = useState(initialBlogState);

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_value: 0,
    usage_limit: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true,
  });

  // Abandoned Carts & Revenue Recovery State
  const [abandonedCartsList, setAbandonedCartsList] = useState([]);
  const [abandonedStats, setAbandonedStats] = useState({
    abandonedCount: 0,
    potentialLostValue: 0,
    recoveredCount: 0,
    recoveredValue: 0,
    conversionRate: 0,
  });
  const [abandonedSort, setAbandonedSort] = useState('highest_value');
  const [abandonedStatusFilter, setAbandonedStatusFilter] = useState('all');
  const [abandonedSearchQuery, setAbandonedSearchQuery] = useState('');
  const [abandonedPage, setAbandonedPage] = useState(1);
  const [abandonedTotalPages, setAbandonedTotalPages] = useState(1);
  const [abandonedTotal, setAbandonedTotal] = useState(0);
  const [loadingAbandonedCarts, setLoadingAbandonedCarts] = useState(false);
  const [viewingAbandonedCart, setViewingAbandonedCart] = useState(null);

  // In-App User Notifications State (Phase 5)
  const [notificationsList, setNotificationsList] = useState([]);
  const [notificationStats, setNotificationStats] = useState({
    totalDispatched: 0,
    totalBroadcasts: 0,
    totalTargeted: 0,
    totalReads: 0,
  });
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsTotalPages, setNotificationsTotalPages] = useState(1);
  const [notificationsTotal, setNotificationsTotal] = useState(0);
  const [notificationsLimit, setNotificationsLimit] = useState(15);
  const [notificationSearchQuery, setNotificationSearchQuery] = useState('');
  const [notificationTypeFilter, setNotificationTypeFilter] = useState('all');
  const [notificationAudienceFilter, setNotificationAudienceFilter] = useState('all');
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);

  // Dispatch Composer Form State
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'promotional',
    target_audience: 'all',
    user_id: '',
  });
  const [selectedCustomerPreview, setSelectedCustomerPreview] = useState(null);
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', display_order: 1 });

  const [reviewsList, setReviewsList] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Video Reels State
  const [reelsList, setReelsList] = useState([]);
  const [showReelModal, setShowReelModal] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [reelForm, setReelForm] = useState({
    product_id: '',
    video_url: '',
    product_name: '',
    product_photo: '',
    price: '',
    caption: '',
    author: '@wooffkids',
    rating: '5.0 ★',
    reviews_count: '1.2k',
    product_slug: '',
    video_file: null,
    photo_file: null,
  });

  // Testimonials State
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    rating: 5,
    author: '',
    text: '',
  });

  // Auto clear toast notifications
  const showToast = (type, text) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg({ type: '', text: '' }), 4000);
  };

  // Fetch Live Analytics & Data from Backend APIs on Mount in parallel
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();

      const [
        analyticsResult,
        ordersResult,
        customersResult,
        productsResult,
        categoriesResult,
        reelsResult,
        testimonialsResult,
        reviewsResult,
        blogsResult,
        couponsResult,
        faqsResult,
        termsResult,
        ingredientsResult,
        contactResult,
        auditLogsResult,
        abandonedCartsResult,
        notificationsResult,
      ] = await Promise.allSettled([
        fetch(API_ENDPOINTS.ADMIN.ANALYTICS, { headers }),
        fetch(`${API_ENDPOINTS.ADMIN.ORDERS}?page=${ordersPagination.page}&limit=${ordersPagination.limit}&status=${orderStatusFilter}&search=${encodeURIComponent(orderSearchQuery)}`, { headers }),
        fetch(`${API_ENDPOINTS.ADMIN.CUSTOMERS}?page=${customersPagination.page}&limit=${customersPagination.limit}&search=${encodeURIComponent(customerSearchQuery)}`, { headers }),
        fetch(API_ENDPOINTS.PRODUCTS),
        fetch(API_ENDPOINTS.CATEGORIES),
        fetch('/api/videos'),
        fetch('/api/testimonials'),
        fetch('/api/products/reviews/all'),
        fetch(API_ENDPOINTS.BLOGS),
        fetch(API_ENDPOINTS.COUPONS, { headers }),
        fetch(API_ENDPOINTS.FAQS),
        fetch(API_ENDPOINTS.TERMS),
        fetch(API_ENDPOINTS.INGREDIENTS),
        fetch(API_ENDPOINTS.CONTACT, { headers }),
        fetch(`${API_ENDPOINTS.ADMIN.AUDIT_LOGS}?page=${auditLogsPagination.page}&limit=${auditLogsPagination.limit}&action=${auditActionFilter}&entity_type=${auditEntityFilter}&search=${encodeURIComponent(auditSearchQuery)}`, { headers }),
        fetch(`${API_ENDPOINTS.ADMIN.ABANDONED_CARTS}?page=${abandonedPage}&limit=15&sort=${abandonedSort}&status=${abandonedStatusFilter}&search=${encodeURIComponent(abandonedSearchQuery)}`, { headers }),
        fetch(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS}?page=${notificationsPage}&limit=${notificationsLimit}&type=${notificationTypeFilter}&audience=${notificationAudienceFilter}&search=${encodeURIComponent(notificationSearchQuery)}`, { headers }),
      ]);

      if (analyticsResult.status === 'fulfilled' && analyticsResult.value.ok) {
        const data = await analyticsResult.value.json();
        if (data.analytics) setAnalytics(data.analytics);
      } else if (analyticsResult.status === 'fulfilled' && [401, 403].includes(analyticsResult.value.status)) {
        handleLogoutAdmin();
        showToast('danger', 'Admin session expired. Please log in again.');
        return;
      }

      if (ordersResult.status === 'fulfilled' && ordersResult.value.ok) {
        const oData = await ordersResult.value.json();
        if (oData.orders && Array.isArray(oData.orders)) {
          setOrders(oData.orders);
          if (oData.total !== undefined) {
            setOrdersPagination((prev) => ({
              ...prev,
              total: oData.total,
              totalPages: oData.totalPages || 1,
            }));
          }
        }
      }

      if (customersResult.status === 'fulfilled' && customersResult.value.ok) {
        const cData = await customersResult.value.json();
        if (cData.customers && Array.isArray(cData.customers)) {
          setUsersList(cData.customers);
          if (cData.total !== undefined) {
            setCustomersPagination((prev) => ({
              ...prev,
              total: cData.total,
              totalPages: cData.totalPages || 1,
            }));
          }
        }
      }

      if (productsResult.status === 'fulfilled' && productsResult.value.ok) {
        const pData = await productsResult.value.json();
        const list = Array.isArray(pData) ? pData : pData?.products || [];
        if (Array.isArray(list)) setProducts(list);
      }

      if (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) {
        const catData = await categoriesResult.value.json();
        const list = Array.isArray(catData) ? catData : catData?.categories || [];
        if (Array.isArray(list)) setCategories(list);
      }

      if (ingredientsResult.status === 'fulfilled' && ingredientsResult.value.ok) {
        const ingData = await ingredientsResult.value.json();
        if (ingData.ingredients && Array.isArray(ingData.ingredients)) {
          setIngredientsList(ingData.ingredients);
        }
      }

      if (contactResult.status === 'fulfilled' && contactResult.value.ok) {
        const cntData = await contactResult.value.json();
        const list = cntData?.messages || (Array.isArray(cntData) ? cntData : []);
        if (Array.isArray(list)) setContactMessages(list);
      }

      if (auditLogsResult.status === 'fulfilled' && auditLogsResult.value.ok) {
        const aData = await auditLogsResult.value.json();
        if (aData.logs && Array.isArray(aData.logs)) {
          setAuditLogsList(aData.logs);
          if (aData.total !== undefined) {
            setAuditLogsPagination((prev) => ({
              ...prev,
              total: aData.total,
              totalPages: aData.totalPages || 1,
            }));
          }
        }
      }

      if (reelsResult.status === 'fulfilled' && reelsResult.value.ok) {
        const rData = await reelsResult.value.json();
        const list = rData?.videos || (Array.isArray(rData) ? rData : []);
        if (Array.isArray(list)) setReelsList(list);
      }

      if (testimonialsResult.status === 'fulfilled' && testimonialsResult.value.ok) {
        const tData = await testimonialsResult.value.json();
        const list = Array.isArray(tData) ? tData : tData?.testimonials || tData?.data || [];
        if (Array.isArray(list)) setTestimonialsList(list);
      }

      if (reviewsResult.status === 'fulfilled' && reviewsResult.value.ok) {
        const rData = await reviewsResult.value.json();
        if (rData.success && Array.isArray(rData.reviews)) setReviewsList(rData.reviews);
      }

      if (blogsResult.status === 'fulfilled' && blogsResult.value.ok) {
        const bData = await blogsResult.value.json();
        const list = Array.isArray(bData) ? bData : bData?.blogs || [];
        if (Array.isArray(list)) setBlogsList(list);
      }

      if (couponsResult.status === 'fulfilled' && couponsResult.value.ok) {
        const cData = await couponsResult.value.json();
        const list = Array.isArray(cData) ? cData : cData?.coupons || [];
        if (Array.isArray(list)) setCoupons(list);
      }

      if (faqsResult.status === 'fulfilled' && faqsResult.value.ok) {
        const fData = await faqsResult.value.json();
        const list = Array.isArray(fData) ? fData : fData?.faqs || [];
        if (Array.isArray(list)) setFaqsList(list);
      }

      if (termsResult.status === 'fulfilled' && termsResult.value.ok) {
        const tData = await termsResult.value.json();
        if (tData?.terms) setTermsData(tData.terms);
      }

      if (abandonedCartsResult.status === 'fulfilled' && abandonedCartsResult.value.ok) {
        const abData = await abandonedCartsResult.value.json();
        if (abData.carts && Array.isArray(abData.carts)) setAbandonedCartsList(abData.carts);
        if (abData.stats) setAbandonedStats(abData.stats);
        if (abData.total !== undefined) setAbandonedTotal(abData.total);
        if (abData.totalPages !== undefined) setAbandonedTotalPages(abData.totalPages);
      }

      if (notificationsResult.status === 'fulfilled' && notificationsResult.value.ok) {
        const nData = await notificationsResult.value.json();
        if (nData.notifications && Array.isArray(nData.notifications)) setNotificationsList(nData.notifications);
        if (nData.stats) setNotificationStats(nData.stats);
        if (nData.total !== undefined) setNotificationsTotal(nData.total);
        if (nData.totalPages !== undefined) setNotificationsTotalPages(nData.totalPages);
      }
    } catch (err) {
      console.error('Failed to load admin dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbandonedCarts = async () => {
    try {
      setLoadingAbandonedCarts(true);
      const headers = getAuthHeader();
      const res = await fetch(
        `${API_ENDPOINTS.ADMIN.ABANDONED_CARTS}?page=${abandonedPage}&limit=15&sort=${abandonedSort}&status=${abandonedStatusFilter}&search=${encodeURIComponent(abandonedSearchQuery)}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.carts && Array.isArray(data.carts)) setAbandonedCartsList(data.carts);
        if (data.stats) setAbandonedStats(data.stats);
        if (data.total !== undefined) setAbandonedTotal(data.total);
        if (data.totalPages !== undefined) setAbandonedTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error('Abandoned carts query error:', e);
    } finally {
      setLoadingAbandonedCarts(false);
    }
  };

  const fetchNotificationsHistory = async () => {
    try {
      setLoadingNotifications(true);
      const headers = getAuthHeader();
      const res = await fetch(
        `${API_ENDPOINTS.ADMIN.NOTIFICATIONS}?page=${notificationsPage}&limit=${notificationsLimit}&type=${notificationTypeFilter}&audience=${notificationAudienceFilter}&search=${encodeURIComponent(notificationSearchQuery)}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) setNotificationsList(data.notifications);
        if (data.stats) setNotificationStats(data.stats);
        if (data.total !== undefined) setNotificationsTotal(data.total);
        if (data.totalPages !== undefined) setNotificationsTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error('Notifications query error:', e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Search customers for targeted notification delivery
  const handleSearchCustomersForNotification = async (query) => {
    setCustomerSearchInput(query);
    if (!query || query.trim().length < 2) {
      setCustomerSearchResults([]);
      return;
    }
    try {
      setSearchingCustomers(true);
      const headers = getAuthHeader();
      const res = await fetch(
        `${API_ENDPOINTS.ADMIN.CUSTOMERS}?page=1&limit=8&search=${encodeURIComponent(query.trim())}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        setCustomerSearchResults(data.customers || []);
      }
    } catch (err) {
      console.error('Customer search error:', err);
    } finally {
      setSearchingCustomers(false);
    }
  };

  const handleSelectTargetCustomer = (cust) => {
    setSelectedCustomerPreview(cust);
    setNotificationForm((prev) => ({
      ...prev,
      target_audience: 'specific',
      user_id: cust.id,
    }));
    setCustomerSearchInput('');
    setCustomerSearchResults([]);
  };

  // Dispatch new notification alert
  const handleSendNotification = async (e) => {
    if (e) e.preventDefault();
    if (!notificationForm.title.trim()) {
      showToast('danger', 'Please enter a notification title.');
      return;
    }
    if (!notificationForm.message.trim()) {
      showToast('danger', 'Please enter a notification message.');
      return;
    }
    if (notificationForm.target_audience === 'specific' && !notificationForm.user_id) {
      showToast('danger', 'Please select a target customer for specific delivery.');
      return;
    }

    try {
      setSendingNotification(true);
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      };
      const res = await fetch(API_ENDPOINTS.ADMIN.NOTIFICATION_SEND, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: notificationForm.title.trim(),
          message: notificationForm.message.trim(),
          type: notificationForm.type,
          target_audience: notificationForm.target_audience,
          user_id: notificationForm.target_audience === 'specific' ? notificationForm.user_id : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', data.message || 'Notification dispatched successfully!');
        setNotificationForm({
          title: '',
          message: '',
          type: 'promotional',
          target_audience: 'all',
          user_id: '',
        });
        setSelectedCustomerPreview(null);
        setCustomerSearchInput('');
        setCustomerSearchResults([]);
        fetchNotificationsHistory();
      } else {
        showToast('danger', data.message || 'Failed to dispatch notification.');
      }
    } catch (err) {
      console.error('Dispatch notification error:', err);
      showToast('danger', 'Network error while dispatching notification.');
    } finally {
      setSendingNotification(false);
    }
  };

  // Retract / Delete notification alert
  const handleDeleteNotification = (notif) => {
    triggerConfirm({
      title: 'Retract / Delete Notification',
      message: `Are you sure you want to retract notification #${notif.id} "${notif.title}"? This will permanently remove it from users' inboxes.`,
      confirmText: 'Retract Alert',
      danger: true,
      action: async () => {
        try {
          const headers = getAuthHeader();
          const res = await fetch(API_ENDPOINTS.ADMIN.NOTIFICATION_DELETE(notif.id), {
            method: 'DELETE',
            headers,
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('success', 'Notification deleted successfully.');
            fetchNotificationsHistory();
          } else {
            showToast('danger', data.message || 'Failed to retract notification.');
          }
        } catch (err) {
          console.error('Delete notification error:', err);
          showToast('danger', 'Network error while deleting notification.');
        }
      },
    });
  };

  useEffect(() => {
    if (!adminAccessGranted) return;
    fetchAdminData();
  }, [adminAccessGranted, ordersPagination.page, customersPagination.page, auditLogsPagination.page]);

  // Debounced search for notification dispatch history
  useEffect(() => {
    if (!adminAccessGranted || activeTab !== 'notifications') return;
    const timer = setTimeout(() => {
      fetchNotificationsHistory();
    }, 350);
    return () => clearTimeout(timer);
  }, [notificationSearchQuery, notificationTypeFilter, notificationAudienceFilter, notificationsPage, notificationsLimit, activeTab]);

  // Debounced search for abandoned carts
  useEffect(() => {
    if (!adminAccessGranted || activeTab !== 'abandoned_carts') return;
    const timer = setTimeout(() => {
      fetchAbandonedCarts();
    }, 350);
    return () => clearTimeout(timer);
  }, [abandonedSearchQuery, abandonedSort, abandonedStatusFilter, abandonedPage, activeTab]);

  // Debounced search for orders
  useEffect(() => {
    if (!adminAccessGranted) return;
    const timer = setTimeout(async () => {
      try {
        const headers = getAuthHeader();
        const res = await fetch(
          `${API_ENDPOINTS.ADMIN.ORDERS}?page=1&limit=${ordersPagination.limit}&status=${orderStatusFilter}&search=${encodeURIComponent(orderSearchQuery)}`,
          { headers }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.orders) {
            setOrders(data.orders);
            setOrdersPagination((prev) => ({ ...prev, page: 1, total: data.total || 0, totalPages: data.totalPages || 1 }));
          }
        }
      } catch (e) {
        console.error('Orders search query error:', e);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [orderSearchQuery, orderStatusFilter]);

  // Debounced search for customers
  useEffect(() => {
    if (!adminAccessGranted) return;
    const timer = setTimeout(async () => {
      try {
        const headers = getAuthHeader();
        const res = await fetch(
          `${API_ENDPOINTS.ADMIN.CUSTOMERS}?page=1&limit=${customersPagination.limit}&search=${encodeURIComponent(customerSearchQuery)}`,
          { headers }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.customers) {
            setUsersList(data.customers);
            setCustomersPagination((prev) => ({ ...prev, page: 1, total: data.total || 0, totalPages: data.totalPages || 1 }));
          }
        }
      } catch (e) {
        console.error('Customers search query error:', e);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [customerSearchQuery]);

  // Debounced filter for audit logs
  useEffect(() => {
    if (!adminAccessGranted || activeTab !== 'audit_logs') return;
    const timer = setTimeout(async () => {
      try {
        const headers = getAuthHeader();
        const res = await fetch(
          `${API_ENDPOINTS.ADMIN.AUDIT_LOGS}?page=1&limit=${auditLogsPagination.limit}&action=${auditActionFilter}&entity_type=${auditEntityFilter}&search=${encodeURIComponent(auditSearchQuery)}`,
          { headers }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.logs) {
            setAuditLogsList(data.logs);
            setAuditLogsPagination((prev) => ({ ...prev, page: 1, total: data.total || 0, totalPages: data.totalPages || 1 }));
          }
        }
      } catch (e) {
        console.error('Audit logs query error:', e);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [auditActionFilter, auditEntityFilter, auditSearchQuery, activeTab]);

  // Unified Secure Asset Upload Handler (.jpg, .png, .jpeg, .webp only, max 10MB)
  const handleSecureAssetUpload = async (file, onUploadSuccess) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExtensions = /\.(jpg|jpeg|png|webp)$/i;

    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      showToast('danger', 'Invalid file format! Only JPG, JPEG, PNG, and WEBP images are allowed. SVG and executables are forbidden.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('danger', 'File size exceeds 10MB! Please compress the asset before uploading.');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.url) {
        onUploadSuccess(data.url);
        showToast('success', `Uploaded "${file.name}" successfully!`);
      } else {
        showToast('danger', data.message || `Upload failed for "${file.name}".`);
      }
    } catch (err) {
      console.error('Asset upload error:', err);
      showToast('danger', `Network error during asset upload for "${file.name}".`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFileUpload = (e, targetFormSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleSecureAssetUpload(file, (url) => {
      targetFormSetter((prev) => ({ ...prev, primary_image: url, image_url: url }));
    });
    e.target.value = '';
  };

  const handleGenericFileUpload = (e, fieldName, targetFormSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleSecureAssetUpload(file, (url) => {
      targetFormSetter((prev) => ({ ...prev, [fieldName]: url }));
    });
    e.target.value = '';
  };

  // Handle Strictly Validated Admin Login via POST /api/auth/login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoginError(data.message || 'Invalid email or password.');
        return;
      }

      if (data.user?.role !== 'admin') {
        setLoginError('Access denied. This account does not possess administrator privileges.');
        return;
      }

      // Store tokens and update authentication state
      localStorage.setItem('token', data.token);
      localStorage.setItem('wooff_token', data.token);
      localStorage.setItem('wooff_admin_access', 'true');
      if (typeof login === 'function') {
        login(data.token, data.user);
      }
      setAdminAccessGranted(true);
      showToast('success', `Welcome back, ${data.user.username || 'Admin'}!`);
    } catch (err) {
      console.error('Admin login error:', err);
      setLoginError('Unable to connect to authentication server. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ===================================================================
  // 0. CATEGORIES CRUD HANDLERS
  // ===================================================================
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', description: '' });
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, slug: cat.slug || '', description: cat.description || '' });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    try {
      const isEdit = !!editingCategory;
      const url = isEdit ? `${API_ENDPOINTS.CATEGORIES}/${editingCategory.id}` : API_ENDPOINTS.CATEGORIES;
      const method = isEdit ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        const data = await res.json();
        const savedCat = data.category || data;
        if (isEdit) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? { ...c, ...savedCat } : c))
          );
        } else {
          setCategories((prev) => [...prev, savedCat]);
        }
        showToast('success', `Category "${categoryForm.name}" saved successfully!`);
        setShowCategoryModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('danger', data.message || 'Failed to save category on server.');
      }
    } catch (err) {
      console.error('Save category error:', err);
      showToast('danger', 'Network error while saving category.');
    }
  };

  // Custom Modal Confirmation System (Replaces native window.confirm)
  const triggerConfirm = ({ title, message, confirmText = 'Confirm', danger = true, action }) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      danger,
      loading: false,
      action,
    });
  };

  const handleModalConfirm = async () => {
    if (confirmConfig.action) {
      try {
        setConfirmConfig((prev) => ({ ...prev, loading: true }));
        await confirmConfig.action();
      } catch (err) {
        console.error('Confirmation action error:', err);
      } finally {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false, loading: false }));
      }
    } else {
      setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteCategory = (id, name) => {
    triggerConfirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${name}"? Products mapped to this category may be affected.`,
      confirmText: 'Delete Category',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.message || 'Failed to delete category on server.');
          }
          setCategories((prev) => prev.filter((c) => c.id !== id));
          showToast('success', `Category "${name}" deleted.`);
        } catch (err) {
          console.error('API delete category error:', err);
          showToast('danger', err.message || 'Error deleting category.');
        }
      },
    });
  };

  // ===================================================================
  // 1. PRODUCTS CRUD HANDLERS (Dynamic Variants & Stock Thresholds)
  // ===================================================================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      category_id: categories[0]?.id || 1,
      price: '',
      final_price: '',
      stock: 25,
      sku: `WF-PROD-${Date.now().toString(36).toUpperCase()}`,
      primary_image: '',
      description: '',
      is_bestseller: false,
      bundle_type: 'single',
      low_stock_threshold: 10,
      variants: [],
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      category_id: prod.category_id || categories[0]?.id || 1,
      price: prod.price,
      final_price: prod.final_price,
      stock: prod.stock,
      sku: prod.sku,
      primary_image: prod.primary_image || '',
      description: prod.description || '',
      is_bestseller: !!prod.is_bestseller,
      bundle_type: prod.bundle_type || 'single',
      low_stock_threshold: prod.low_stock_threshold ?? 10,
      variants: Array.isArray(prod.variants) ? prod.variants : [],
    });
    setShowProductModal(true);
  };

  const handleToggleBestseller = async (id, currentVal) => {
    const newVal = !currentVal;
    try {
      await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ is_bestseller: newVal }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_bestseller: newVal } : p))
      );
      showToast('success', `Product Bestseller status updated!`);
    } catch (err) {
      console.warn('Backend update note: Syncing local state', err);
    }
  };

  const handleToggleProductActive = async (id, currentActive) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p))
        );
        showToast('success', `Product visibility changed to ${!currentActive ? 'ACTIVE' : 'INACTIVE'}!`);
      } else {
        showToast('danger', data.message || 'Failed to toggle product status.');
      }
    } catch (err) {
      showToast('danger', 'Error updating product status.');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price) {
      showToast('danger', 'Please enter product title and price.');
      return;
    }

    try {
      const isEdit = !!editingProduct;
      const url = isEdit
        ? `${API_ENDPOINTS.PRODUCTS}/${editingProduct.id}`
        : API_ENDPOINTS.PRODUCTS;
      const method = isEdit ? 'PUT' : 'POST';

      const parsedPrice = Math.max(0, parseFloat(productForm.price) || 0);
      const parsedFinalPrice = Math.max(0, parseFloat(productForm.final_price || productForm.price) || 0);
      const parsedStock = Math.max(0, parseInt(productForm.stock || '0', 10) || 0);

      const payload = {
        ...productForm,
        price: parsedPrice,
        final_price: parsedFinalPrice,
        stock: parsedStock,
        category_id: productForm.category_id || categories[0]?.id || 1,
        bundle_type: productForm.bundle_type || 'single',
        low_stock_threshold: parseInt(productForm.low_stock_threshold) || 10,
        variants: productForm.variants || [],
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const savedProd = data.product || data;
        const catName = categories.find((c) => c.id == savedProd.category_id)?.name || 'Toothpaste';
        const formatted = { ...savedProd, category_name: catName };

        if (isEdit) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? { ...p, ...formatted } : p))
          );
        } else {
          setProducts((prev) => [formatted, ...prev]);
        }
        showToast('success', `Product "${productForm.title}" saved successfully!`);
        setShowProductModal(false);
      } else {
        showToast('danger', data.message || 'Failed to save product on server.');
      }
    } catch (err) {
      console.error('Save product error:', err);
      showToast('danger', 'Network error while saving product.');
    }
  };

  const handleDeleteProduct = (id, title) => {
    triggerConfirm({
      title: 'Delete Product',
      message: `Are you sure you want to permanently delete "${title}"? This product and all associated variants will be archived.`,
      confirmText: 'Delete Product',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.message || 'Failed to delete product on server.');
          }
          setProducts((prev) => prev.filter((p) => p.id !== id));
          showToast('success', `Product "${title}" deleted.`);
        } catch (err) {
          console.error('Delete product error:', err);
          showToast('danger', err.message || 'Error deleting product.');
        }
      },
    });
  };

  // ===================================================================
  // 2. BLOGS CRUD HANDLERS
  // ===================================================================
  const handleOpenAddBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      slug: '',
      category: 'Pediatric Dental Science',
      tags: 'FluorideFree, NanoHydroxyapatite, OralHealth',
      author: 'Dr. Ananya Sharma',
      author_role: 'Pediatric Dental Specialist',
      author_avatar: '',
      author_bio: 'Pediatric dental consultant dedicated to evidence-based non-toxic care.',
      reading_time: '5 min read',
      image_url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80',
      image_caption: 'Advanced biomimetic enamel remineralization in clinical pediatric care.',
      excerpt: '',
      content: '',
      conclusion_takeaways: '',
    });
    setShowBlogModal(true);
  };

  const handleOpenEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title || '',
      slug: blog.slug || '',
      category: blog.category || 'Pediatric Dental Science',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
      author: blog.author || '',
      author_role: blog.author_role || '',
      author_avatar: blog.author_avatar || '',
      author_bio: blog.author_bio || '',
      reading_time: blog.reading_time || '5 min read',
      image_url: blog.image_url || '',
      image_caption: blog.image_caption || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      conclusion_takeaways: Array.isArray(blog.conclusion_takeaways)
        ? blog.conclusion_takeaways.join('\n')
        : (typeof blog.conclusion_takeaways === 'string' ? blog.conclusion_takeaways : ''),
    });
    setShowBlogModal(true);
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content || !blogForm.author) {
      showToast('danger', 'Please enter blog title, author, and content.');
      return;
    }

    const processedTakeaways = blogForm.conclusion_takeaways
      ? (Array.isArray(blogForm.conclusion_takeaways)
          ? blogForm.conclusion_takeaways
          : blogForm.conclusion_takeaways.split('\n').map((s) => s.trim()).filter(Boolean))
      : [];

    const payload = {
      ...blogForm,
      slug: blogForm.slug ? blogForm.slug.trim() : blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      conclusion_takeaways: processedTakeaways,
    };

    try {
      const isEdit = !!editingBlog;
      const url = isEdit ? `${API_ENDPOINTS.BLOGS}/${editingBlog.id}` : API_ENDPOINTS.BLOGS;
      const method = isEdit ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const savedBlog = data.blog || data;
        if (isEdit) {
          setBlogsList((prev) =>
            prev.map((b) => (b.id === editingBlog.id ? { ...b, ...savedBlog } : b))
          );
        } else {
          setBlogsList((prev) => [savedBlog, ...prev]);
        }
        showToast('success', `Blog article "${blogForm.title}" saved!`);
        setShowBlogModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('danger', data.message || 'Failed to save blog article on server.');
      }
    } catch (err) {
      console.error('Save blog error:', err);
      showToast('danger', 'Network error while saving blog article.');
    }
  };

  const handleDeleteBlog = (id, title) => {
    triggerConfirm({
      title: 'Delete Blog Article',
      message: `Are you sure you want to delete article "${title}"?`,
      confirmText: 'Delete Article',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.BLOGS}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.message || 'Failed to delete blog article on server.');
          }
          setBlogsList((prev) => prev.filter((b) => b.id !== id));
          showToast('success', `Article "${title}" deleted.`);
        } catch (err) {
          console.error('Delete blog error:', err);
          showToast('danger', err.message || 'Error deleting article.');
        }
      },
    });
  };

  // ===================================================================
  // 3. COUPONS & PROMOTIONS CRUD HANDLERS
  // ===================================================================
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      discount_type: 'percentage',
      discount_value: 15,
      min_order_value: 0,
      usage_limit: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      is_active: true,
    });
    setShowCouponModal(true);
  };

  const handleOpenEditCoupon = (c) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code || '',
      discount_type: c.discount_type || 'percentage',
      discount_value: c.discount_value !== undefined ? c.discount_value : (c.discount_percent || 15),
      min_order_value: c.min_order_value || c.min_cart_value || 0,
      usage_limit: c.usage_limit ?? '',
      valid_from: c.valid_from ? new Date(c.valid_from).toISOString().split('T')[0] : '',
      valid_until: (c.valid_until || c.expires_at || c.expiry_date)
        ? new Date(c.valid_until || c.expires_at || c.expiry_date).toISOString().split('T')[0]
        : '',
      is_active: c.is_active !== false,
    });
    setShowCouponModal(true);
  };

  const handleToggleCouponActive = async (id, currentVal) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.COUPONS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ is_active: !currentVal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: !currentVal } : c))
        );
        showToast('success', `Coupon active status updated!`);
      } else {
        showToast('danger', data.message || 'Failed to update coupon status.');
      }
    } catch (err) {
      showToast('danger', 'Network error while updating coupon status.');
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discount_value) {
      showToast('danger', 'Please enter a coupon code and discount value.');
      return;
    }

    try {
      const isEdit = !!editingCoupon;
      const url = isEdit ? `${API_ENDPOINTS.COUPONS}/${editingCoupon.id}` : API_ENDPOINTS.COUPONS;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        min_order_value: parseFloat(couponForm.min_order_value || 0),
        usage_limit: couponForm.usage_limit !== '' ? parseInt(couponForm.usage_limit, 10) : null,
        valid_from: couponForm.valid_from ? new Date(couponForm.valid_from).toISOString() : null,
        valid_until: couponForm.valid_until ? new Date(couponForm.valid_until).toISOString() : null,
        is_active: Boolean(couponForm.is_active),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const savedCoupon = data.coupon || data;
        if (isEdit) {
          setCoupons((prev) =>
            prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...savedCoupon } : c))
          );
        } else {
          setCoupons((prev) => [savedCoupon, ...prev]);
        }
        showToast('success', `Coupon "${payload.code}" saved successfully!`);
        setShowCouponModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('danger', data.message || 'Failed to save coupon on server.');
      }
    } catch (err) {
      console.error('Save coupon error:', err);
      showToast('danger', 'Network error while saving coupon.');
    }
  };

  const handleDeleteCoupon = (id, code) => {
    triggerConfirm({
      title: 'Delete Coupon',
      message: `Are you sure you want to delete promo coupon "${code}"?`,
      confirmText: 'Delete Coupon',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.COUPONS}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.message || 'Failed to delete coupon on server.');
          }
          setCoupons((prev) => prev.filter((c) => c.id !== id));
          showToast('success', `Coupon "${code}" deleted.`);
        } catch (err) {
          console.error('Delete coupon error:', err);
          showToast('danger', err.message || 'Error deleting coupon.');
        }
      },
    });
  };

  // ===================================================================
  // ABANDONED CARTS & REVENUE RECOVERY HANDLERS
  // ===================================================================
  const handleUpdateCartRecoveryStatus = async (id, newStatus) => {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.ABANDONED_CART_STATUS(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAbandonedCartsList((prev) =>
          prev.map((cart) => (cart.id === id ? { ...cart, recovery_status: newStatus } : cart))
        );
        showToast('success', `Cart recovery status updated to ${newStatus.toUpperCase()}!`);
        fetchAbandonedCarts();
      } else {
        showToast('danger', data.message || 'Failed to update recovery status.');
      }
    } catch (err) {
      showToast('danger', 'Error updating recovery status.');
    }
  };

  const handleDeleteAbandonedCart = (id, email) => {
    triggerConfirm({
      title: 'Delete Abandoned Cart',
      message: `Are you sure you want to delete the abandoned cart record for ${email || 'this customer'}?`,
      confirmText: 'Delete Record',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(API_ENDPOINTS.ADMIN.ABANDONED_CART_DELETE(id), {
            method: 'DELETE',
            headers: getAuthHeader(),
          });
          if (res.ok) {
            setAbandonedCartsList((prev) => prev.filter((c) => c.id !== id));
            showToast('success', 'Abandoned cart record removed.');
            fetchAbandonedCarts();
          } else {
            showToast('danger', 'Failed to delete record.');
          }
        } catch (err) {
          showToast('danger', 'Error connecting to server.');
        }
      },
    });
  };

  // ===================================================================
  // 4. FAQS CRUD HANDLERS
  // ===================================================================
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqForm({ question: '', answer: '', display_order: faqsList.length + 1 });
    setShowFaqModal(true);
  };

  const handleOpenEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqForm({ question: faq.question, answer: faq.answer, display_order: faq.display_order });
    setShowFaqModal(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer) {
      showToast('danger', 'Both question and answer are required.');
      return;
    }

    try {
      const isEdit = !!editingFaq;
      const url = isEdit ? `${API_ENDPOINTS.FAQS}/${editingFaq.id}` : API_ENDPOINTS.FAQS;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(faqForm),
      });

      if (res.ok) {
        const data = await res.json();
        const savedFaq = data.faq || data;
        if (isEdit) {
          setFaqsList((prev) =>
            prev.map((f) => (f.id === editingFaq.id ? { ...f, ...savedFaq } : f))
          );
        } else {
          setFaqsList((prev) => [...prev, savedFaq]);
        }
        showToast('success', 'FAQ saved successfully!');
        setShowFaqModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('danger', data.message || 'Failed to save FAQ on server.');
      }
    } catch (err) {
      console.error('Save FAQ error:', err);
      showToast('danger', 'Network error while saving FAQ.');
    }
  };

  const handleDeleteFaq = (id) => {
    triggerConfirm({
      title: 'Delete FAQ',
      message: 'Are you sure you want to delete this FAQ entry?',
      confirmText: 'Delete FAQ',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.FAQS}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.message || 'Failed to delete FAQ on server.');
          }
          setFaqsList((prev) => prev.filter((f) => f.id !== id));
          showToast('success', 'FAQ deleted.');
        } catch (err) {
          console.error('Delete FAQ error:', err);
          showToast('danger', err.message || 'Error deleting FAQ.');
        }
      },
    });
  };

  // ===================================================================
  // 5. TERMS & CONDITIONS CRUD HANDLER
  // ===================================================================
  const handleSaveTerms = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.TERMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(termsData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.terms) setTermsData(data.terms);
      }
    } catch (err) {
      console.warn('API terms note: update local state', err);
    }

    setTermsData((prev) => ({
      ...prev,
      updated_at: new Date().toISOString().split('T')[0],
    }));
    showToast('success', 'Terms & Conditions & Store Policies updated successfully!');
  };

  // Orders Status Change Handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ order_status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, order_status: newStatus } : ord))
        );
        showToast('success', `Order status updated to "${newStatus.toUpperCase()}"!`);
        // Refresh live analytics
        const aRes = await fetch(API_ENDPOINTS.ADMIN.ANALYTICS, { headers: getAuthHeader() });
        if (aRes.ok) {
          const aData = await aRes.json();
          if (aData.analytics) setAnalytics(aData.analytics);
        }
      } else {
        showToast('error', data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Update order status error:', err);
      showToast('error', 'Error updating order status');
    }
  };


  const handleDeleteReviewInAdmin = (id) => {
    triggerConfirm({
      title: 'Delete Customer Review',
      message: 'Are you sure you want to permanently delete this customer review? Rating averages will recalculate.',
      confirmText: 'Delete Review',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`/api/products/reviews/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          const data = await res.json();
          if (data.success) {
            setReviewsList((prev) => prev.filter((r) => r.id !== id));
            showToast('success', 'Customer review deleted successfully!');
            const pRes = await fetch(API_ENDPOINTS.PRODUCTS);
            if (pRes.ok) {
              const pData = await pRes.json();
              const list = Array.isArray(pData) ? pData : pData?.products || [];
              if (Array.isArray(list)) setProducts(list);
            }
          } else {
            showToast('danger', data.message || 'Failed to delete review.');
          }
        } catch (err) {
          showToast('danger', 'Error connecting to server.');
        }
      },
    });
  };

  // ===================================================================
  // 6. BRAND REELS CRUD HANDLERS
  // ===================================================================
  const handleOpenAddReel = () => {
    setEditingReel(null);
    const firstProd = products[0] || {};
    setReelForm({
      product_id: firstProd.id || '',
      video_url: '',
      product_name: firstProd.title || '',
      product_photo: firstProd.primary_image || '',
      price: firstProd.final_price || firstProd.price || 349,
      caption: firstProd.title ? `Brush with ${firstProd.title}! 🦷✨` : 'See it in action!',
      author: '@wooffkids',
      rating: '5.0 ★',
      reviews_count: '1.2k',
      product_slug: firstProd.slug || '',
      video_file: null,
      photo_file: null,
    });
    setShowReelModal(true);
  };

  const handleOpenEditReel = (reel) => {
    setEditingReel(reel);
    setReelForm({
      product_id: reel.product_id || '',
      video_url: reel.video_url || '',
      product_name: reel.product_name || '',
      product_photo: reel.product_photo || '',
      price: reel.price || '',
      caption: reel.caption || '',
      author: reel.author || '@wooffkids',
      rating: reel.rating || '5.0 ★',
      reviews_count: reel.reviews_count || '1k+',
      product_slug: reel.product_slug || '',
      video_file: null,
      photo_file: null,
    });
    setShowReelModal(true);
  };

  const handleSelectProductForReel = (prodId) => {
    const selProd = products.find((p) => String(p.id) === String(prodId));
    if (selProd) {
      setReelForm((prev) => ({
        ...prev,
        product_id: selProd.id,
        product_name: selProd.title,
        price: selProd.final_price || selProd.price,
        product_photo: selProd.primary_image,
        product_slug: selProd.slug,
        caption: prev.caption || `Brush with ${selProd.title}! 🦷✨`,
      }));
    } else {
      setReelForm((prev) => ({ ...prev, product_id: prodId }));
    }
  };

  const handleSaveReel = async (e) => {
    e.preventDefault();
    if (!reelForm.video_url && !reelForm.video_file) {
      showToast('danger', 'Please upload a video file or enter a video URL.');
      return;
    }

    try {
      setUploadingVideo(true);
      const isEdit = !!editingReel;
      const url = isEdit ? `/api/videos/${editingReel.id}` : '/api/videos';
      const method = isEdit ? 'PUT' : 'POST';

      const formData = new FormData();
      if (reelForm.product_id) formData.append('product_id', reelForm.product_id);
      if (reelForm.video_url) formData.append('video_url', reelForm.video_url);
      if (reelForm.product_name) formData.append('product_name', reelForm.product_name);
      if (reelForm.product_photo) formData.append('product_photo', reelForm.product_photo);
      if (reelForm.price) formData.append('price', reelForm.price);
      if (reelForm.caption) formData.append('caption', reelForm.caption);
      if (reelForm.author) formData.append('author', reelForm.author);
      if (reelForm.rating) formData.append('rating', reelForm.rating);
      if (reelForm.reviews_count) formData.append('reviews_count', reelForm.reviews_count);
      if (reelForm.product_slug) formData.append('product_slug', reelForm.product_slug);

      if (reelForm.video_file) {
        formData.append('video', reelForm.video_file);
      }
      if (reelForm.photo_file) {
        formData.append('product_photo', reelForm.photo_file);
      }

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Video Reel saved successfully!`);
        const rRes = await fetch('/api/videos');
        if (rRes.ok) {
          const rData = await rRes.json();
          const list = rData?.videos || (Array.isArray(rData) ? rData : []);
          setReelsList(list);
        }
        setShowReelModal(false);
      } else {
        showToast('danger', data.message || 'Failed to save video reel.');
      }
    } catch (err) {
      console.error('Error saving reel:', err);
      showToast('danger', 'Error connecting to server.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteReel = (id) => {
    triggerConfirm({
      title: 'Delete Video Reel',
      message: 'Are you sure you want to delete this video reel?',
      confirmText: 'Delete Reel',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`/api/videos/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          const data = await res.json();
          if (data.success) {
            setReelsList((prev) => prev.filter((r) => r.id !== id));
            showToast('success', 'Video reel deleted successfully.');
          } else {
            showToast('danger', data.message || 'Failed to delete video reel.');
          }
        } catch (err) {
          showToast('danger', 'Error connecting to server.');
        }
      },
    });
  };

  // ===================================================================
  // 7. TESTIMONIALS CRUD HANDLERS
  // ===================================================================
  const handleOpenAddTestimonial = () => {
    setEditingTestimonial(null);
    setTestimonialForm({
      rating: 5,
      author: '',
      text: '',
    });
    setShowTestimonialModal(true);
  };

  const handleOpenEditTestimonial = (item) => {
    setEditingTestimonial(item);
    setTestimonialForm({
      rating: item.rating || 5,
      author: item.author || item.author_name || '',
      text: item.text || item.testimonial || item.review || '',
    });
    setShowTestimonialModal(true);
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    if (!testimonialForm.author || !testimonialForm.text) {
      showToast('danger', 'Please enter author name and testimonial quote.');
      return;
    }

    try {
      const isEdit = !!editingTestimonial;
      const url = isEdit ? `/api/testimonials/${editingTestimonial.id}` : '/api/testimonials';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        rating: Number(testimonialForm.rating) || 5,
        author: testimonialForm.author.trim(),
        text: testimonialForm.text.trim(),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Testimonial ${isEdit ? 'updated' : 'created'} successfully!`);
        const tRes = await fetch('/api/testimonials');
        if (tRes.ok) {
          const tData = await tRes.json();
          const list = Array.isArray(tData) ? tData : tData?.testimonials || tData?.data || [];
          setTestimonialsList(list);
        }
        setShowTestimonialModal(false);
      } else {
        showToast('danger', data.message || 'Failed to save testimonial.');
      }
    } catch (err) {
      console.error('Save testimonial error:', err);
      showToast('danger', 'Error connecting to server.');
    }
  };

  const handleDeleteTestimonial = (id) => {
    triggerConfirm({
      title: 'Delete Testimonial',
      message: 'Are you sure you want to delete this customer testimonial?',
      confirmText: 'Delete Testimonial',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`/api/testimonials/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          const data = await res.json();
          if (data.success) {
            setTestimonialsList((prev) => prev.filter((t) => t.id !== id));
            showToast('success', 'Testimonial deleted successfully.');
          } else {
            showToast('danger', data.message || 'Failed to delete testimonial.');
          }
        } catch (err) {
          showToast('danger', 'Error connecting to server.');
        }
      },
    });
  };

  // ===================================================================
  // 8. LOGISTICS, CSV EXPORT & PACKING SLIP WORKFLOWS
  // ===================================================================
  const handleShiprocketFulfill = async (orderId) => {
    try {
      setFulfillingOrderId(orderId);
      const res = await fetch(API_ENDPOINTS.ADMIN.ORDER_SHIPROCKET_FULFILL(orderId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Order dispatched! Shiprocket AWB: ${data.data?.awb_code || 'Generated'}`);
        fetchAdminData();
      } else {
        showToast('danger', data.message || 'Shiprocket dispatch failed.');
      }
    } catch (err) {
      showToast('danger', 'Network error during Shiprocket dispatch.');
    } finally {
      setFulfillingOrderId(null);
    }
  };

  const handleCancelOrderPrompt = (order) => {
    triggerConfirm({
      title: `Cancel Order #${order.order_number || order.id}`,
      message: `Are you sure you want to cancel this order? All items will be restocked to inventory and status marked as CANCELLED.`,
      confirmText: 'Cancel Order & Restock',
      danger: true,
      action: async () => {
        try {
          setCancellingOrderId(order.id);
          const res = await fetch(API_ENDPOINTS.ADMIN.ORDER_CANCEL(order.id), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeader(),
            },
            body: JSON.stringify({ reason: 'Admin panel cancellation with inventory restock' }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('success', 'Order cancelled and product inventory restocked!');
            fetchAdminData();
          } else {
            showToast('danger', data.message || 'Failed to cancel order.');
          }
        } catch (err) {
          showToast('danger', 'Network error while cancelling order.');
        } finally {
          setCancellingOrderId(null);
        }
      },
    });
  };

  const handleExportOrdersCsv = async () => {
    try {
      const url = `${API_ENDPOINTS.ADMIN.EXPORT_ORDERS_CSV}?status=${orderStatusFilter}&search=${encodeURIComponent(orderSearchQuery)}`;
      const res = await fetch(url, { headers: getAuthHeader() });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `wooff_orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('success', 'Orders CSV exported successfully!');
    } catch (err) {
      showToast('danger', 'Failed to export orders CSV.');
    }
  };

  const handleExportCustomersCsv = async () => {
    try {
      const url = `${API_ENDPOINTS.ADMIN.EXPORT_CUSTOMERS_CSV}?search=${encodeURIComponent(customerSearchQuery)}`;
      const res = await fetch(url, { headers: getAuthHeader() });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `wooff_customers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('success', 'Customers CSV exported successfully!');
    } catch (err) {
      showToast('danger', 'Failed to export customers CSV.');
    }
  };

  const handleOpenInvoice = (order) => {
    setInvoiceModalState({
      isOpen: true,
      orderId: order.id,
      order: order,
    });
  };

  // ===================================================================
  // 9. HERO INGREDIENTS CMS HANDLERS
  // ===================================================================
  const handleOpenAddIngredient = () => {
    setEditingIngredient(null);
    setIngredientForm({
      name: '',
      slug: '',
      sub_title: '',
      tag: 'Formulation Asset',
      description: '',
      benefits: '',
      badge_text: 'Bio-Active',
      icon_url: '/assets/tooth_paste.webp',
      display_order: ingredientsList.length + 1,
      is_active: true,
    });
    setShowIngredientModal(true);
  };

  const handleOpenEditIngredient = (ing) => {
    setEditingIngredient(ing);
    setIngredientForm({
      name: ing.name || '',
      slug: ing.slug || '',
      sub_title: ing.sub_title || '',
      tag: ing.tag || '',
      description: ing.description || '',
      benefits: Array.isArray(ing.benefits) ? ing.benefits.join('\n') : (ing.benefits || ''),
      badge_text: ing.badge_text || '',
      icon_url: ing.icon_url || '',
      display_order: ing.display_order || 1,
      is_active: ing.is_active !== false,
    });
    setShowIngredientModal(true);
  };

  const handleSaveIngredient = async (e) => {
    e.preventDefault();
    if (!ingredientForm.name || !ingredientForm.description) {
      showToast('danger', 'Ingredient Name and Description are required.');
      return;
    }

    try {
      const isEdit = !!editingIngredient;
      const url = isEdit ? `${API_ENDPOINTS.INGREDIENTS}/${editingIngredient.id}` : API_ENDPOINTS.INGREDIENTS;
      const method = isEdit ? 'PUT' : 'POST';

      const benefitsArray = typeof ingredientForm.benefits === 'string'
        ? ingredientForm.benefits.split('\n').map((b) => b.trim()).filter(Boolean)
        : ingredientForm.benefits;

      const payload = {
        ...ingredientForm,
        benefits: benefitsArray,
        display_order: parseInt(ingredientForm.display_order) || 1,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Ingredient "${ingredientForm.name}" saved successfully!`);
        setShowIngredientModal(false);
        const refRes = await fetch(API_ENDPOINTS.INGREDIENTS);
        if (refRes.ok) {
          const rData = await refRes.json();
          if (rData.ingredients) setIngredientsList(rData.ingredients);
        }
      } else {
        showToast('danger', data.message || 'Failed to save ingredient.');
      }
    } catch (err) {
      showToast('danger', 'Network error while saving ingredient.');
    }
  };

  const handleDeleteIngredient = (id, name) => {
    triggerConfirm({
      title: 'Delete Hero Ingredient',
      message: `Are you sure you want to delete formulation ingredient "${name}"?`,
      confirmText: 'Delete Ingredient',
      danger: true,
      action: async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.INGREDIENTS}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || 'Failed to delete ingredient.');
          setIngredientsList((prev) => prev.filter((i) => i.id !== id));
          showToast('success', `Ingredient "${name}" deleted.`);
        } catch (err) {
          showToast('danger', err.message || 'Error deleting ingredient.');
        }
      },
    });
  };

  const handleToggleIngredientActive = async (id, currentActive) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.INGREDIENTS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIngredientsList((prev) => prev.map((i) => (i.id === id ? { ...i, is_active: !currentActive } : i)));
        showToast('success', `Ingredient status updated.`);
      }
    } catch (err) {
      showToast('danger', 'Failed to update ingredient status.');
    }
  };

  // If Admin Lock Active, render Admin Login Screen
  if (!adminAccessGranted) {
    return (
      <div className="container py-5">
        <div className="admin-auth-lock-card">
          <div className="mb-3 text-warning">
            <i className="fa-solid fa-shield-halved fa-3x"></i>
          </div>
          <h2 className="fw-bold mb-2" style={{ color: '#4B2E1E' }}>
            Wooff Admin Control Center
          </h2>
          <p className="text-muted small mb-4">
            Authorized administrator credentials required. Please sign in with your admin account.
          </p>

          {loginError && (
            <div className="alert alert-danger py-2 small mb-3 rounded-3 fw-bold" role="alert">
              <i className="fa-solid fa-circle-exclamation me-2"></i>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div className="mb-3 text-start">
              <label className="form-label small fw-bold text-muted">Admin Email</label>
              <input
                type="email"
                className="form-control form-control-lg rounded-3 border-2"
                placeholder="admin@wooff.care"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label small fw-bold text-muted">Password</label>
              <input
                type="password"
                className="form-control form-control-lg rounded-3 border-2"
                placeholder="Enter password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary w-100 py-3 text-center justify-content-center fw-bold"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to Control Center <i className="fa-solid fa-arrow-right ms-2"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      
      {/* Toast Notification Alert */}
      {toastMsg.text && (
        <div
          className={`position-fixed bottom-0 end-0 m-4 p-3 rounded-4 shadow-lg text-white z-3 bg-${
            toastMsg.type === 'danger' ? 'danger' : 'success'
          }`}
          style={{ zIndex: 9999, fontWeight: 700 }}
        >
          {toastMsg.text}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <i className="fa-solid fa-wand-magic-sparkles text-warning fs-4"></i>
          <div>
            <h4 className="admin-brand-title">Wooff Admin</h4>
            <span className="small text-white-50">Control Center</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fa-solid fa-chart-line width-20"></i> Overview & Sales
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <i className="fa-solid fa-box-open width-20"></i> Products Manager
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <i className="fa-solid fa-folder-open width-20"></i> Categories
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'reels' ? 'active' : ''}`}
            onClick={() => setActiveTab('reels')}
          >
            <i className="fa-solid fa-video width-20"></i> Brand Video Reels ({reelsList.length})
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'testimonials' ? 'active' : ''}`}
            onClick={() => setActiveTab('testimonials')}
          >
            <i className="fa-solid fa-quote-left width-20"></i> Testimonials ({testimonialsList.length})
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <i className="fa-solid fa-star width-20"></i> Product Reviews ({reviewsList.length})
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fa-solid fa-truck-fast width-20"></i> Orders & Delivery
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'abandoned_carts' ? 'active' : ''}`}
            onClick={() => setActiveTab('abandoned_carts')}
          >
            <i className="fa-solid fa-cart-arrow-down width-20"></i> Abandoned Carts ({abandonedStats.abandonedCount || 0})
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            <i className="fa-solid fa-newspaper width-20"></i> Articles & Blogs
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <i className="fa-solid fa-tags width-20"></i> Coupons & Offers
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="fa-solid fa-bell width-20"></i> User Notifications ({notificationStats.totalDispatched || 0})
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'faqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('faqs')}
          >
            <i className="fa-solid fa-circle-question width-20"></i> FAQs Manager
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            <i className="fa-solid fa-file-contract width-20"></i> Store Policies
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <i className="fa-solid fa-comments width-20"></i> Support Inbox
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            <i className="fa-solid fa-flask-vial width-20"></i> Hero Ingredients CMS ({ingredientsList.length})
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fa-solid fa-users width-20"></i> Customers
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'audit_logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit_logs')}
          >
            <i className="fa-solid fa-clipboard-list width-20"></i> Admin Audit Trail
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <span className="small text-white-50 fw-bold">Admin Active</span>
            <button
              className="btn btn-sm btn-outline-light py-0 px-2 rounded-pill small"
              onClick={handleLogoutAdmin}
            >
              Lock <i className="fa-solid fa-lock ms-1"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="admin-main-content">
        
        {/* Topbar Header */}
        <header className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {activeTab === 'dashboard' && <><i className="fa-solid fa-chart-line text-warning me-2"></i> Store Analytics & Dashboard</>}
              {activeTab === 'products' && <><i className="fa-solid fa-box-open text-warning me-2"></i> Products CRUD Catalog</>}
              {activeTab === 'categories' && <><i className="fa-solid fa-folder-open text-warning me-2"></i> Product Categories</>}
              {activeTab === 'ingredients' && <><i className="fa-solid fa-flask-vial text-warning me-2"></i> Hero Formulation Ingredients CMS</>}
              {activeTab === 'reels' && <><i className="fa-solid fa-video text-warning me-2"></i> Brand Video Reels Manager</>}
              {activeTab === 'testimonials' && <><i className="fa-solid fa-quote-left text-warning me-2"></i> Customer Testimonials</>}
              {activeTab === 'reviews' && <><i className="fa-solid fa-star text-warning me-2"></i> Customer Reviews Management</>}
              {activeTab === 'orders' && <><i className="fa-solid fa-truck-fast text-warning me-2"></i> Customer Orders & Logistics Automation</>}
              {activeTab === 'abandoned_carts' && <><i className="fa-solid fa-cart-arrow-down text-warning me-2"></i> Abandoned Cart Recovery & Revenue Rescue</>}
              {activeTab === 'blogs' && <><i className="fa-solid fa-newspaper text-warning me-2"></i> Articles & Blog Posts CRUD</>}
              {activeTab === 'coupons' && <><i className="fa-solid fa-tags text-warning me-2"></i> Promotions Engine & Discount Coupons</>}
              {activeTab === 'notifications' && <><i className="fa-solid fa-bell text-warning me-2"></i> In-App User Notifications Engine & Dispatch Center</>}
              {activeTab === 'faqs' && <><i className="fa-solid fa-circle-question text-warning me-2"></i> Frequently Asked Questions CRUD</>}
              {activeTab === 'terms' && <><i className="fa-solid fa-file-contract text-warning me-2"></i> Terms & Conditions Policies</>}
              {activeTab === 'contact' && <><i className="fa-solid fa-comments text-warning me-2"></i> Support Inbox</>}
              {activeTab === 'users' && <><i className="fa-solid fa-users text-warning me-2"></i> Registered Customers & Analytics</>}
              {activeTab === 'audit_logs' && <><i className="fa-solid fa-clipboard-list text-warning me-2"></i> Admin Security & Activity Audit Trail</>}
            </h1>
            <p className="text-muted small mb-0">Wooff Kids 100% Prebiotic Toothpaste Dynamic CRUD Control Center</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="admin-btn admin-btn-outline d-lg-none"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <i className="fa-solid fa-bars me-1"></i> Menu
            </button>
            <a href="/" target="_blank" rel="noreferrer" className="admin-btn admin-btn-outline">
              <i className="fa-solid fa-globe me-1"></i> View Live Shop
            </a>
          </div>
        </header>

        {/* -------------------------------------------------------------
            TAB 1: DASHBOARD OVERVIEW & ANALYTICS
           ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon-wrapper"><i className="fa-solid fa-wallet"></i></div>
                <div className="stat-details">
                  <div className="stat-label">Total Revenue</div>
                  <h3 className="stat-value">₹{Number(analytics.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  <div className="stat-subtext">
                    {analytics.last_month_revenue > 0 ? (
                      analytics.revenue_growth_percent >= 0 ? (
                        <span className="text-success">↑ {analytics.revenue_growth_percent}% this month</span>
                      ) : (
                        <span className="text-danger">↓ {Math.abs(analytics.revenue_growth_percent)}% this month</span>
                      )
                    ) : analytics.this_month_revenue > 0 ? (
                      <span>₹{Number(analytics.this_month_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })} this month</span>
                    ) : (
                      <span>₹0.00 this month</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-wrapper"><i className="fa-solid fa-box"></i></div>
                <div className="stat-details">
                  <div className="stat-label">Active Orders</div>
                  <h3 className="stat-value">
                    {analytics.active_orders_count ?? orders.filter((o) => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.order_status)).length} Orders
                  </h3>
                  <div className="stat-subtext">
                    {analytics.ready_for_shipment_count ?? orders.filter((o) => ['confirmed', 'processing'].includes(o.order_status)).length} Ready for shipment
                  </div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-wrapper"><i className="fa-solid fa-users"></i></div>
                <div className="stat-details">
                  <div className="stat-label">Registered Customers</div>
                  <h3 className="stat-value">{analytics.total_customers || usersList.length} Customers</h3>
                  <div className="stat-subtext">
                    {analytics.new_customers_this_month > 0
                      ? `+${analytics.new_customers_this_month} new this month`
                      : `${analytics.total_customers || usersList.length || 0} active accounts`}
                  </div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-wrapper" style={{ background: '#FCE8E6', color: '#C5221F' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div className="stat-details">
                  <div className="stat-label">Low Stock Warning</div>
                  <h3 className="stat-value" style={{ color: '#C5221F' }}>
                    {analytics.low_stock_count ?? products.filter((p) => p.stock <= 10).length} Items
                  </h3>
                  <div className="stat-subtext text-danger">
                    {analytics.out_of_stock_count > 0
                      ? `${analytics.out_of_stock_count} item(s) out of stock`
                      : 'Stock below 10 units'}
                  </div>
                </div>
              </div>
            </div>

            {products.some((p) => p.stock <= 10) && (
              <div className="alert alert-warning border-0 rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-bold mb-1 text-dark">
                    <i className="fa-solid fa-triangle-exclamation text-danger me-2"></i> Low Inventory Alert
                  </h6>
                  <p className="small mb-0 text-muted">
                    Some items (e.g. <strong>{products.find((p) => p.stock <= 10)?.title}</strong>) have fewer than 10 units remaining.
                  </p>
                </div>
                <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => setActiveTab('products')}>
                  Restock Inventory <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              </div>
            )}

            {/* Real-Time 30-Day Revenue Velocity Chart */}
            <div className="admin-card-box mb-4">
              <div className="admin-card-header d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="admin-card-title mb-1">
                    <i className="fa-solid fa-chart-line text-primary me-2"></i> 30-Day Sales Velocity & Trends
                  </h3>
                  <p className="text-muted small mb-0">
                    Real-time transaction revenue aggregation directly from PostgreSQL orders
                  </p>
                </div>
                <span className="badge bg-light text-primary border px-3 py-2 fw-bold">
                  {analytics.daily_sales_trends?.length || 30} Days Monitored
                </span>
              </div>
              <div className="p-3">
                <SalesTrendChart trends={analytics.daily_sales_trends} />
              </div>
            </div>

            {/* Top Bestselling Products from Postgres Analytics */}
            {analytics.top_selling_products && analytics.top_selling_products.length > 0 && (
              <div className="admin-card-box mb-4">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <i className="fa-solid fa-trophy text-warning me-2"></i> Top 5 Bestselling Formulations
                  </h3>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th className="text-center">Units Sold</th>
                        <th className="text-end">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.top_selling_products.map((top, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold">{top.product_name}</td>
                          <td><code className="text-muted">{top.product_sku || 'N/A'}</code></td>
                          <td className="text-center"><span className="badge bg-success-subtle text-success fw-bold px-3 py-1">{top.total_quantity_sold} units</span></td>
                          <td className="text-end fw-bold text-success">₹{Number(top.total_revenue_generated || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="admin-card-box">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Recent Customer Orders</h3>
                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => setActiveTab('orders')}>
                  View All Orders <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Phone Number</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th>Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">No orders found yet</td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id}>
                          <td className="fw-bold">{ord.order_number || `#${ord.id}`}</td>
                          <td>{ord.customer_name || 'Guest'}</td>
                          <td>{ord.phone || '-'}</td>
                          <td className="fw-bold">₹{parseFloat(ord.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td><span className={`admin-badge badge-${(ord.payment_status || 'pending').toLowerCase()}`}>{(ord.payment_status || 'pending').toUpperCase()}</span></td>
                          <td><span className={`admin-badge badge-${(ord.order_status || 'pending').toLowerCase()}`}>{(ord.order_status || 'pending').toUpperCase()}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* -------------------------------------------------------------
            TAB 2: PRODUCTS CRUD
           ------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="admin-card-box">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Products Dynamic Catalog ({products.length})</h3>
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAddProduct}>
                <i className="fa-solid fa-plus me-1"></i> Add New Product
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Title & SKU</th>
                    <th>Bundle Type</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Alert</th>
                    <th>Live Active</th>
                    <th>Bestseller Status</th>
                    <th>Actions (Edit / Delete)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-5 text-muted">
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                        <div className="fw-bold">No products found in PostgreSQL catalog</div>
                        <p className="small text-muted mb-3">Click "Add New Product" to create your first toothpaste variant.</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((prod) => {
                      const threshold = prod.low_stock_threshold || 10;
                      const isLow = Number(prod.stock) <= threshold;
                      const isOut = Number(prod.stock) <= 0;
                      return (
                        <tr key={prod.id}>
                          <td>
                            <img
                              src={prod.primary_image || '/assets/tooth_paste.webp'}
                              alt={prod.title}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px' }}
                            />
                          </td>
                          <td>
                            <div className="fw-bold">{prod.title}</div>
                            <div className="small text-muted">SKU: {prod.sku}</div>
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border text-capitalize fw-bold">
                              {prod.bundle_type === '3-pack'
                                ? '3-Pack Bundle'
                                : prod.bundle_type === '2-pack'
                                ? '2-Pack Duo'
                                : prod.bundle_type === 'family'
                                ? 'Family Pack'
                                : 'Single Tube'}
                            </span>
                          </td>
                          <td><span className="badge bg-light text-dark border">{prod.category_name || 'General'}</span></td>
                          <td>
                            <div className="fw-bold text-success">₹{prod.final_price || prod.price}</div>
                            {prod.final_price && prod.final_price !== prod.price && (
                              <div className="small text-muted text-decoration-line-through">₹{prod.price}</div>
                            )}
                          </td>
                          <td>
                            {isOut ? (
                              <span className="admin-badge badge-danger">OUT OF STOCK (0)</span>
                            ) : isLow ? (
                              <span className="admin-badge badge-danger">
                                ⚠️ LOW: {prod.stock} units (min {threshold})
                              </span>
                            ) : (
                              <span className="admin-badge badge-success">{prod.stock} units</span>
                            )}
                          </td>
                          <td>
                            <div className="form-check form-switch m-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={prod.is_active !== false}
                                onChange={() => handleToggleProductActive(prod.id, prod.is_active !== false)}
                                title={prod.is_active !== false ? 'Live in store' : 'Archived/Hidden'}
                              />
                            </div>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${prod.is_bestseller ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
                              style={{ borderRadius: '20px', fontSize: '0.78rem' }}
                              onClick={() => handleToggleBestseller(prod.id, prod.is_bestseller)}
                            >
                              <i className={`fa-solid ${prod.is_bestseller ? 'fa-fire me-1' : 'fa-circle me-1'}`}></i>
                              {prod.is_bestseller ? 'Bestseller 🔥' : 'Mark Bestseller'}
                            </button>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleOpenEditProduct(prod)}>
                                <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                              </button>
                              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteProduct(prod.id, prod.title)}>
                                <i className="fa-solid fa-trash-can me-1"></i> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: CATEGORIES CRUD
           ------------------------------------------------------------- */}
        {activeTab === 'categories' && (
          <div className="admin-card-box">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Product Categories ({categories.length})</h3>
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAddCategory}>
                <i className="fa-solid fa-plus me-1"></i> Add New Category
              </button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category Name</th>
                    <th>URL Slug</th>
                    <th>Description</th>
                    <th>Actions (Edit / Delete)</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="fw-bold">#{cat.id}</td>
                      <td className="fw-bold">{cat.name}</td>
                      <td><code>/{cat.slug}</code></td>
                      <td className="text-muted">{cat.description}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleOpenEditCategory(cat)}>
                            <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteCategory(cat.id, cat.name)}>
                            <i className="fa-solid fa-trash-can me-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3.5: CUSTOMER REVIEWS MANAGER
           ------------------------------------------------------------- */}
        {activeTab === 'reviews' && (
          <div className="admin-card-box">
            <div className="admin-card-header d-flex justify-content-between align-items-center">
              <div>
                <h3 className="admin-card-title mb-1">Customer Reviews Management ({reviewsList.length})</h3>
                <p className="text-muted small mb-0">View, monitor, and delete product reviews submitted by customers.</p>
              </div>
            </div>
            <div className="admin-table-container">
              {reviewsList.length === 0 ? (
                <div className="p-4 text-center text-muted">No customer reviews submitted yet.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Rating</th>
                      <th>Review Message</th>
                      <th>Date Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewsList.map((rev) => (
                      <tr key={rev.id}>
                        <td className="fw-bold">#{rev.id}</td>
                        <td className="fw-bold text-dark">
                          {rev.product_title || `Product #${rev.product_id}`}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1">{rev.customer_name}</span>
                        </td>
                        <td>
                          <span className="text-warning fw-bold">
                            {'★'.repeat(Math.round(parseFloat(rev.rating)))} {parseFloat(rev.rating).toFixed(1)}
                          </span>
                        </td>
                        <td style={{ maxWidth: '320px' }}>
                          <span className="small text-muted d-block text-truncate" title={rev.review_text}>
                            {rev.review_text || 'No message provided'}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">{new Date(rev.created_at).toLocaleDateString()}</small>
                        </td>
                        <td>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={() => handleDeleteReviewInAdmin(rev.id)}
                            title="Delete Review"
                          >
                            <i className="fa-solid fa-trash-can me-1"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: ORDERS MANAGER & LOGISTICS AUTOMATION
           ------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="admin-card-box">
            <div className="admin-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h3 className="admin-card-title mb-1">
                  <i className="fa-solid fa-truck-fast text-primary me-2"></i> Orders & Logistics Operations ({ordersPagination.total || orders.length})
                </h3>
                <p className="text-muted small mb-0">1-click Shiprocket AWB generation, printable tax invoices, and cancellation restock.</p>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline admin-btn-sm d-flex align-items-center gap-1"
                  onClick={handleExportOrdersCsv}
                  title="Export filtered orders directly to CSV"
                >
                  <i className="fa-solid fa-file-csv text-success"></i> Export Orders (.CSV)
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-3 bg-light border-bottom d-flex flex-wrap gap-3 align-items-center justify-content-between">
              <div className="d-flex flex-grow-1 align-items-center gap-2" style={{ maxWidth: '420px' }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-2">
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm border-2"
                    placeholder="Search by order #, customer name, phone, email, AWB..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                  />
                  {orderSearchQuery && (
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setOrderSearchQuery('')}>✕</button>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <label className="small fw-bold text-muted mb-0">Status:</label>
                <select
                  className="form-select form-select-sm border-2 fw-bold"
                  style={{ width: '160px' }}
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order # & Date</th>
                    <th>Customer & Address</th>
                    <th>Total & Payment</th>
                    <th>Status</th>
                    <th>Shiprocket Logistics</th>
                    <th>Packing Slip / Invoice</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
                        <div className="fw-bold">No matching customer orders found in PostgreSQL</div>
                        <p className="small text-muted mb-0">Orders placed by customers on the storefront will appear here live.</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => {
                      const isFulfilling = fulfillingOrderId === ord.id;
                      const isCancelling = cancellingOrderId === ord.id;
                      const hasAwb = !!ord.shiprocket_awb_code;
                      const isCancelled = ord.order_status === 'cancelled';

                      return (
                        <tr key={ord.id} style={{ opacity: isCancelled ? 0.75 : 1 }}>
                          <td>
                            <div className="fw-bold text-dark">{ord.order_number || `#${ord.id}`}</div>
                            <div className="small text-muted">
                              {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              }) : 'Recent'}
                            </div>
                          </td>

                          <td>
                            <div className="fw-bold">{ord.customer_name || 'Guest User'}</div>
                            <div className="small text-muted">📞 {ord.phone || ord.customer_phone || '-'}</div>
                            <div className="small text-muted">
                              📍 {ord.shipping_city || ord.city || ''} {ord.shipping_postal_code || ord.postal_code ? `(${ord.shipping_postal_code || ord.postal_code})` : ''}
                            </div>
                          </td>

                          <td>
                            <div className="fw-bold text-success">
                              ₹{parseFloat(ord.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div>
                              <span className={`admin-badge badge-${(ord.payment_status || 'pending').toLowerCase()}`}>
                                {(ord.payment_status || 'pending').toUpperCase()}
                              </span>
                            </div>
                          </td>

                          <td>
                            <select
                              className="form-select form-select-sm fw-bold border-2"
                              value={ord.order_status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              disabled={isCancelled}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td>
                            {hasAwb ? (
                              <div>
                                <span className="badge bg-info-subtle text-info border font-monospace fw-bold px-2 py-1">
                                  AWB: {ord.shiprocket_awb_code}
                                </span>
                                {ord.shiprocket_courier_name && (
                                  <div className="small text-muted mt-1">{ord.shiprocket_courier_name}</div>
                                )}
                              </div>
                            ) : isCancelled ? (
                              <span className="badge bg-secondary-subtle text-muted">Order Cancelled</span>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3 py-1"
                                onClick={() => handleShiprocketFulfill(ord.id)}
                                disabled={isFulfilling}
                              >
                                {isFulfilling ? (
                                  <><span className="spinner-border spinner-border-sm me-1"></span> Dispatching...</>
                                ) : (
                                  <><i className="fa-solid fa-paper-plane me-1"></i> 1-Click Shiprocket</>
                                )}
                              </button>
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="admin-btn admin-btn-outline admin-btn-sm"
                              onClick={() => handleOpenInvoice(ord)}
                              title="Print dynamic invoice and packing slip"
                            >
                              <i className="fa-solid fa-receipt me-1 text-primary"></i> Invoice / Slip
                            </button>
                          </td>

                          <td>
                            {!isCancelled && (
                              <button
                                type="button"
                                className="admin-btn admin-btn-danger admin-btn-sm"
                                onClick={() => handleCancelOrderPrompt(ord)}
                                disabled={isCancelling}
                                title="Cancel order and restore product stock"
                              >
                                {isCancelling ? 'Restocking...' : <><i className="fa-solid fa-ban me-1"></i> Cancel</>}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {ordersPagination.totalPages > 1 && (
              <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  Showing Page <strong>{ordersPagination.page}</strong> of <strong>{ordersPagination.totalPages}</strong> ({ordersPagination.total} total orders)
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={ordersPagination.page <= 1}
                    onClick={() => setOrdersPagination((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={ordersPagination.page >= ordersPagination.totalPages}
                    onClick={() => setOrdersPagination((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: BLOGS CRUD
           ------------------------------------------------------------- */}
        {activeTab === 'blogs' && (
          <div className="admin-card-box">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Blog Articles & Content ({blogsList.length})</h3>
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAddBlog}>
                <i className="fa-solid fa-plus me-1"></i> Add New Blog Post
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title & Slug</th>
                    <th>Category & Tags</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogsList.map((blog) => (
                    <tr key={blog.id}>
                      <td>
                        <img 
                          src={blog.image_url || '/assets/tooth_paste.webp'} 
                          alt={blog.title} 
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px' }} 
                          onError={(e) => { e.currentTarget.src = '/assets/tooth_paste.webp'; }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold">{blog.title}</div>
                        <div className="small text-muted">/{blog.slug}</div>
                      </td>
                      <td>
                        <div className="badge bg-light text-dark border mb-1">{blog.category || 'General'}</div>
                        <div className="small text-muted" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {Array.isArray(blog.tags) ? blog.tags.map(t => `#${t}`).join(' ') : (blog.tags || '')}
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{blog.author}</div>
                        <div className="small text-muted">{blog.author_role || 'Contributor'}</div>
                      </td>
                      <td>{blog.created_at ? String(blog.created_at).split('T')[0] : 'Recent'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-btn admin-btn-outline admin-btn-sm text-decoration-none"
                            title="View published article"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                          </a>
                          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleOpenEditBlog(blog)} title="Edit Article">
                            <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteBlog(blog.id, blog.title)} title="Delete Article">
                            <i className="fa-solid fa-trash-can me-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 6: COUPONS CRUD
           ------------------------------------------------------------- */}
        {activeTab === 'coupons' && (
          <div className="admin-card-box">
            <div className="admin-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h3 className="admin-card-title mb-1">Promotional Discount Coupons ({coupons.length})</h3>
                <span className="small text-muted">Manage promotional codes, percentage vs flat discounts, minimum cart thresholds, and redemption caps.</span>
              </div>
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAddCoupon}>
                <i className="fa-solid fa-plus me-1"></i> Create Coupon Code
              </button>
            </div>

            <div className="admin-table-container">
              {coupons.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fa-solid fa-tags fa-3x mb-3 text-secondary"></i>
                  <h5 className="fw-bold text-dark">No Promotional Discount Codes</h5>
                  <p className="small mb-3">Create your first percentage or flat discount coupon to drive store sales.</p>
                  <button className="admin-btn admin-btn-primary" onClick={handleOpenAddCoupon}>
                    <i className="fa-solid fa-plus me-1"></i> Create First Coupon
                  </button>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Promo Code</th>
                      <th>Discount Offer</th>
                      <th>Min Order Value</th>
                      <th>Usage Limits</th>
                      <th>Validity Window</th>
                      <th>Live Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => {
                      const isExpired = c.valid_until && new Date() > new Date(c.valid_until);
                      const isScheduled = c.valid_from && new Date() < new Date(c.valid_from);
                      const usageLimitText = c.usage_limit ? `${c.used_count || 0} / ${c.usage_limit}` : `${c.used_count || 0} used (No limit)`;
                      const minOrder = parseFloat(c.min_order_value || c.min_cart_value || 0);

                      return (
                        <tr key={c.id}>
                          <td>
                            <code className="fw-bold fs-6 text-dark bg-light px-2 py-1 rounded border">
                              {c.code}
                            </code>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold px-2 py-1 fs-6">
                              {c.discount_type === 'flat' ? `₹${parseFloat(c.discount_value)} FLAT` : `${parseFloat(c.discount_value || c.discount_percent || 0)}% OFF`}
                            </span>
                            {c.max_discount_amount && (
                              <div className="small text-muted mt-1">Cap: ₹{c.max_discount_amount}</div>
                            )}
                          </td>
                          <td>
                            <span className="fw-bold text-dark">{minOrder > 0 ? `₹${minOrder.toFixed(2)}` : 'None (₹0)'}</span>
                          </td>
                          <td>
                            <div className="small fw-bold text-dark">{usageLimitText}</div>
                            {c.usage_limit && (
                              <div className="progress mt-1" style={{ height: '5px', width: '100px' }}>
                                <div
                                  className="progress-bar bg-primary"
                                  style={{
                                    width: `${Math.min(100, Math.round(((c.used_count || 0) / c.usage_limit) * 100))}%`,
                                  }}
                                ></div>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="small">
                              {c.valid_until ? (
                                <>
                                  <span className={isExpired ? 'text-danger fw-bold' : 'text-muted'}>
                                    Until {new Date(c.valid_until).toLocaleDateString()}
                                  </span>
                                  {isExpired && <span className="badge bg-danger ms-1 small">Expired</span>}
                                  {isScheduled && <span className="badge bg-info text-dark ms-1 small">Upcoming</span>}
                                </>
                              ) : (
                                <span className="text-muted">No Expiration</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`couponSwitch-${c.id}`}
                                checked={!!c.is_active}
                                onChange={() => handleToggleCouponActive(c.id, c.is_active)}
                              />
                              <label className="form-check-label small fw-bold" htmlFor={`couponSwitch-${c.id}`}>
                                {c.is_active ? 'Active' : 'Disabled'}
                              </label>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="admin-btn admin-btn-outline admin-btn-sm"
                                onClick={() => handleOpenEditCoupon(c)}
                                title="Edit Coupon"
                              >
                                <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                              </button>
                              <button
                                className="admin-btn admin-btn-danger admin-btn-sm"
                                onClick={() => handleDeleteCoupon(c.id, c.code)}
                                title="Delete Coupon"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: ABANDONED CARTS & REVENUE RECOVERY
           ------------------------------------------------------------- */}
        {activeTab === 'abandoned_carts' && (
          <div className="admin-card-box">
            {/* Top KPI Metrics Row */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="p-3 rounded-4 bg-white border border-danger-subtle shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted fw-bold">Potential Lost Sales</span>
                    <span className="badge bg-danger-subtle text-danger rounded-pill px-2 py-1">At Risk</span>
                  </div>
                  <h3 className="fw-bold mb-1 text-danger">₹{abandonedStats.potentialLostValue.toLocaleString()}</h3>
                  <span className="small text-muted">{abandonedStats.abandonedCount} abandoned carts pending</span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="p-3 rounded-4 bg-white border border-warning-subtle shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted fw-bold">Open Abandonments</span>
                    <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1">Drop-offs</span>
                  </div>
                  <h3 className="fw-bold mb-1 text-dark">{abandonedStats.abandonedCount}</h3>
                  <span className="small text-muted">Awaiting customer recovery outreach</span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="p-3 rounded-4 bg-white border border-success-subtle shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted fw-bold">Recovered Revenue</span>
                    <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1">Rescued</span>
                  </div>
                  <h3 className="fw-bold mb-1 text-success">₹{abandonedStats.recoveredValue.toLocaleString()}</h3>
                  <span className="small text-muted">{abandonedStats.recoveredCount} carts converted</span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="p-3 rounded-4 bg-white border border-primary-subtle shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted fw-bold">Recovery Win Rate</span>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1">Efficiency</span>
                  </div>
                  <h3 className="fw-bold mb-1 text-primary">{abandonedStats.conversionRate}%</h3>
                  <span className="small text-muted">Total conversion of drop-offs</span>
                </div>
              </div>
            </div>

            {/* Filter & Controls Bar */}
            <div className="admin-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h3 className="admin-card-title mb-1">Abandoned Cart Recovery ({abandonedTotal})</h3>
                <span className="small text-muted">Inspect drop-offs, recover abandoned orders via WhatsApp/Email, and track potential revenue.</span>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2">
                {/* Search */}
                <div className="input-group input-group-sm" style={{ width: '220px' }}>
                  <span className="input-group-text bg-light border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search name, email, phone..."
                    value={abandonedSearchQuery}
                    onChange={(e) => {
                      setAbandonedSearchQuery(e.target.value);
                      setAbandonedPage(1);
                    }}
                  />
                </div>

                {/* Status Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: '150px' }}
                  value={abandonedStatusFilter}
                  onChange={(e) => {
                    setAbandonedStatusFilter(e.target.value);
                    setAbandonedPage(1);
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="abandoned">Abandoned (Open)</option>
                  <option value="contacted">Contacted</option>
                  <option value="recovered">Recovered (Paid)</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Sort Filter - Mandatory 'Highest Potential Value' */}
                <select
                  className="form-select form-select-sm fw-bold border-warning text-dark"
                  style={{ width: '210px' }}
                  value={abandonedSort}
                  onChange={(e) => {
                    setAbandonedSort(e.target.value);
                    setAbandonedPage(1);
                  }}
                >
                  <option value="highest_value">🔥 Highest Potential Value</option>
                  <option value="recent">🕒 Most Recent Drop-off</option>
                  <option value="lowest_value">📉 Lowest Value</option>
                </select>

                <button
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  onClick={fetchAbandonedCarts}
                  title="Refresh abandoned carts"
                >
                  <i className={`fa-solid fa-arrows-rotate ${loadingAbandonedCarts ? 'fa-spin' : ''}`}></i>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="admin-table-container">
              {loadingAbandonedCarts ? (
                <SkeletonTable rows={5} />
              ) : abandonedCartsList.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fa-solid fa-cart-arrow-down fa-3x mb-3 text-secondary"></i>
                  <h5 className="fw-bold text-dark">No Abandoned Checkouts Found</h5>
                  <p className="small mb-0">Every customer who reached checkout completed their purchase or no drop-offs match your search filter.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Info & Contact</th>
                      <th>Cart Items Preview</th>
                      <th>Potential Cart Value</th>
                      <th>Drop-Off Stage & Time</th>
                      <th>Recovery Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abandonedCartsList.map((cart) => {
                      const items = Array.isArray(cart.items) ? cart.items : [];
                      const cleanPhone = (cart.phone || '').replace(/\D/g, '');
                      const isHighValue = parseFloat(cart.total_value) >= 500;

                      return (
                        <tr key={cart.id}>
                          {/* Customer Details */}
                          <td>
                            <div className="fw-bold text-dark">{cart.customer_name || 'Guest Shopper'}</div>
                            <div className="small text-muted">{cart.email || 'No email provided'}</div>
                            {cart.phone && (
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <span className="small text-muted font-monospace">{cart.phone}</span>
                                <a
                                  href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hi ${cart.customer_name || 'there'}, we noticed you left some Wooff Kids Prebiotic Toothpaste in your cart! Here is an exclusive discount code to complete your smile care: WOOFF10`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="badge bg-success text-white text-decoration-none px-2 py-1"
                                  title="Chat on WhatsApp"
                                >
                                  <i className="fa-brands fa-whatsapp me-1"></i> WhatsApp
                                </a>
                              </div>
                            )}
                          </td>

                          {/* Cart Items Preview */}
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {items.slice(0, 2).map((it, itIdx) => (
                                <div key={itIdx} className="d-flex align-items-center gap-1 border rounded p-1 bg-light small">
                                  {it.image && (
                                    <img src={it.image} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                                  )}
                                  <span className="fw-bold">{it.title || 'Product'}</span>
                                  <span className="badge bg-secondary">x{it.quantity || 1}</span>
                                </div>
                              ))}
                              {items.length > 2 && (
                                <span className="badge bg-secondary">+{items.length - 2} more</span>
                              )}
                              <button
                                className="btn btn-sm btn-link p-0 text-decoration-none small text-primary ms-1"
                                onClick={() => setViewingAbandonedCart(cart)}
                              >
                                View All ({items.length})
                              </button>
                            </div>
                          </td>

                          {/* Potential Value */}
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold fs-6 text-dark">₹{parseFloat(cart.total_value || 0).toLocaleString()}</span>
                              {isHighValue && (
                                <span className="badge bg-danger text-white small px-2 py-1">High Value</span>
                              )}
                            </div>
                          </td>

                          {/* Funnel Step & Timestamp */}
                          <td>
                            <span className="badge bg-light text-dark border small text-capitalize mb-1 d-inline-block">
                              <i className="fa-solid fa-shoe-prints me-1 text-warning"></i>
                              {String(cart.checkout_step || 'shipping_details').replace(/_/g, ' ')}
                            </span>
                            <div className="small text-muted">
                              {new Date(cart.created_at).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          {/* Recovery Status Dropdown */}
                          <td>
                            <select
                              className={`form-select form-select-sm fw-bold border-2 ${
                                cart.recovery_status === 'recovered'
                                  ? 'border-success text-success'
                                  : cart.recovery_status === 'contacted'
                                  ? 'border-primary text-primary'
                                  : 'border-warning text-warning-emphasis'
                              }`}
                              style={{ width: '135px' }}
                              value={cart.recovery_status}
                              onChange={(e) => handleUpdateCartRecoveryStatus(cart.id, e.target.value)}
                            >
                              <option value="abandoned">⚠️ Abandoned</option>
                              <option value="contacted">📞 Contacted</option>
                              <option value="recovered">✅ Recovered</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="admin-btn admin-btn-outline admin-btn-sm"
                                onClick={() => setViewingAbandonedCart(cart)}
                                title="Inspect Cart Payload"
                              >
                                <i className="fa-solid fa-eye me-1"></i> Inspect
                              </button>
                              <button
                                className="admin-btn admin-btn-danger admin-btn-sm"
                                onClick={() => handleDeleteAbandonedCart(cart.id, cart.email || cart.customer_name)}
                                title="Remove Record"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {abandonedTotalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <span className="small text-muted">
                  Showing page {abandonedPage} of {abandonedTotalPages} ({abandonedTotal} total drop-offs)
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    disabled={abandonedPage <= 1}
                    onClick={() => setAbandonedPage((p) => Math.max(1, p - 1))}
                  >
                    <i className="fa-solid fa-chevron-left me-1"></i> Previous
                  </button>
                  <button
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    disabled={abandonedPage >= abandonedTotalPages}
                    onClick={() => setAbandonedPage((p) => p + 1)}
                  >
                    Next <i className="fa-solid fa-chevron-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: IN-APP USER NOTIFICATIONS ENGINE & DISPATCH CENTER
           ------------------------------------------------------------- */}
        {activeTab === 'notifications' && (
          <div className="admin-card-box">
            {/* Top KPI Metrics Row */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="p-3 rounded-4 bg-white border border-primary-subtle shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted fw-bold">Total Dispatches</span>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1">Lifetime</span>
                  </div>
                  <h3 className="fw-bold mb-1 text-primary">{notificationStats.totalDispatched.toLocaleString()}</h3>
                  <span className="small text-muted">All-time notification alerts sent</span>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="p-3 rounded-4 bg-white border border-info-subtle shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted fw-bold">Global Broadcasts</span>
                    <span className="badge bg-info-subtle text-info rounded-pill px-2 py-1">All Users</span>
                  </div>
                  <h3 className="fw-bold mb-1 text-info">{notificationStats.totalBroadcasts.toLocaleString()}</h3>
                  <span className="small text-muted">Sent to all registered accounts</span>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="p-3 rounded-4 bg-white border border-warning-subtle shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted fw-bold">Targeted 1-on-1 Alerts</span>
                    <span className="badge bg-warning-subtle text-warning rounded-pill px-2 py-1">Specific</span>
                  </div>
                  <h3 className="fw-bold mb-1 text-warning">{notificationStats.totalTargeted.toLocaleString()}</h3>
                  <span className="small text-muted">Personalized direct alerts</span>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="p-3 rounded-4 bg-white border border-success-subtle shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted fw-bold">Total Engagement</span>
                    <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1">Reads</span>
                  </div>
                  <h3 className="fw-bold mb-1 text-success">{notificationStats.totalReads.toLocaleString()}</h3>
                  <span className="small text-muted">Customer in-app read events</span>
                </div>
              </div>
            </div>

            {/* Compose & Dispatch Alert Form Card */}
            <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: '#f8fafc' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">
                      <i className="fa-solid fa-paper-plane text-warning me-2"></i> Compose New Notification Alert
                    </h5>
                    <p className="small text-muted mb-0">
                      Instantly broadcast announcements or send targeted personal messages to a customer.
                    </p>
                  </div>
                  <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-2 fw-semibold">
                    100% Dynamic In-App Delivery
                  </span>
                </div>

                <div className="row g-4">
                  {/* Left Column: Form Controls */}
                  <div className="col-12 col-lg-7">
                    <form onSubmit={handleSendNotification}>
                      {/* Target Audience Selector */}
                      <div className="mb-3">
                        <label className="form-label fw-bold small text-dark mb-2">
                          1. Target Audience <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex gap-3">
                          <label className={`card p-3 flex-fill cursor-pointer border ${notificationForm.target_audience === 'all' ? 'border-primary bg-primary-subtle shadow-sm' : 'bg-white'}`} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="radio"
                                name="target_audience"
                                checked={notificationForm.target_audience === 'all'}
                                onChange={() => {
                                  setNotificationForm((prev) => ({ ...prev, target_audience: 'all', user_id: '' }));
                                  setSelectedCustomerPreview(null);
                                  setCustomerSearchInput('');
                                  setCustomerSearchResults([]);
                                }}
                              />
                              <div>
                                <div className="fw-bold text-dark small">📢 All Registered Users</div>
                                <div className="text-muted" style={{ fontSize: '11px' }}>Global in-app broadcast</div>
                              </div>
                            </div>
                          </label>

                          <label className={`card p-3 flex-fill cursor-pointer border ${notificationForm.target_audience === 'specific' ? 'border-primary bg-primary-subtle shadow-sm' : 'bg-white'}`} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="radio"
                                name="target_audience"
                                checked={notificationForm.target_audience === 'specific'}
                                onChange={() => setNotificationForm((prev) => ({ ...prev, target_audience: 'specific' }))}
                              />
                              <div>
                                <div className="fw-bold text-dark small">👤 Specific Customer</div>
                                <div className="text-muted" style={{ fontSize: '11px' }}>Search by name, email, or phone</div>
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Customer Search Box if Specific Audience */}
                        {notificationForm.target_audience === 'specific' && (
                          <div className="mt-3 p-3 bg-white rounded-3 border">
                            {selectedCustomerPreview ? (
                              <div className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-light border">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', fontSize: '13px' }}>
                                    {(selectedCustomerPreview.username || selectedCustomerPreview.email || 'U')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="fw-bold small text-dark">
                                      {selectedCustomerPreview.username || selectedCustomerPreview.fullName || 'User'} (ID #{selectedCustomerPreview.id})
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '11px' }}>
                                      {selectedCustomerPreview.email || selectedCustomerPreview.phone_number || 'No contact email'}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => {
                                    setSelectedCustomerPreview(null);
                                    setNotificationForm((prev) => ({ ...prev, user_id: '' }));
                                  }}
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <div>
                                <label className="form-label small text-muted mb-1">
                                  Search Customer to Target:
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text bg-light border-end-0">
                                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                                  </span>
                                  <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Type customer name, email, or phone..."
                                    value={customerSearchInput}
                                    onChange={(e) => handleSearchCustomersForNotification(e.target.value)}
                                  />
                                </div>
                                {searchingCustomers && (
                                  <div className="text-muted small mt-2">
                                    <i className="fa-solid fa-spinner fa-spin me-1"></i> Searching customers...
                                  </div>
                                )}
                                {customerSearchResults.length > 0 && (
                                  <div className="list-group mt-2 shadow-sm rounded-2 border overflow-hidden" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                    {customerSearchResults.map((cust) => (
                                      <button
                                        type="button"
                                        key={cust.id}
                                        className="list-group-item list-group-item-action text-start p-2 d-flex justify-content-between align-items-center"
                                        onClick={() => handleSelectTargetCustomer(cust)}
                                      >
                                        <div>
                                          <div className="fw-bold small text-dark">
                                            {cust.username || cust.fullName || 'User'} (ID #{cust.id})
                                          </div>
                                          <div className="text-muted" style={{ fontSize: '11px' }}>
                                            {cust.email || cust.phone_number || 'No contact'}
                                          </div>
                                        </div>
                                        <span className="badge bg-primary rounded-pill small">Select</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Notification Type & Title Row */}
                      <div className="row g-3 mb-3">
                        <div className="col-12 col-md-5">
                          <label className="form-label fw-bold small text-dark mb-1">
                            2. Notification Type <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={notificationForm.type}
                            onChange={(e) => setNotificationForm((prev) => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="promotional">🎉 Promotional & Discounts</option>
                            <option value="order_update">📦 Order & Logistics Milestone</option>
                            <option value="system">🔔 System & Brand Announcements</option>
                          </select>
                        </div>
                        <div className="col-12 col-md-7">
                          <label className="form-label fw-bold small text-dark mb-1">
                            3. Title / Heading <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Special Weekend Offer: 20% Off!"
                            value={notificationForm.title}
                            onChange={(e) => setNotificationForm((prev) => ({ ...prev, title: e.target.value }))}
                            maxLength={255}
                            required
                          />
                        </div>
                      </div>

                      {/* Message Body */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label fw-bold small text-dark mb-0">
                            4. Message Body <span className="text-danger">*</span>
                          </label>
                          <span className="text-muted" style={{ fontSize: '11px' }}>
                            {notificationForm.message.length} characters
                          </span>
                        </div>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Compose the full message content visible to the customer in their in-app notification center..."
                          value={notificationForm.message}
                          onChange={(e) => setNotificationForm((prev) => ({ ...prev, message: e.target.value }))}
                          required
                        />
                      </div>

                      {/* Dispatch Actions */}
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <button
                          type="button"
                          className="admin-btn admin-btn-outline"
                          onClick={() => {
                            setNotificationForm({
                              title: '',
                              message: '',
                              type: 'promotional',
                              target_audience: 'all',
                              user_id: '',
                            });
                            setSelectedCustomerPreview(null);
                            setCustomerSearchInput('');
                            setCustomerSearchResults([]);
                          }}
                        >
                          Clear Form
                        </button>
                        <button
                          type="submit"
                          className="admin-btn admin-btn-primary px-4"
                          disabled={sendingNotification || !notificationForm.title.trim() || !notificationForm.message.trim()}
                        >
                          {sendingNotification ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin me-2"></i> Dispatching...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-paper-plane me-2"></i> Dispatch Alert Now
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Live Interactive User Preview Card */}
                  <div className="col-12 col-lg-5">
                    <label className="form-label fw-bold small text-muted mb-2">
                      Live Customer In-App Popover Preview:
                    </label>
                    <div className="p-3 bg-white rounded-4 border shadow-sm" style={{ maxWidth: '380px', margin: '0 auto' }}>
                      <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                        <span className="small fw-bold text-dark">
                          <i className="fa-solid fa-bell text-warning me-1"></i> Notification Center
                        </span>
                        <span className="badge bg-warning-subtle text-warning" style={{ fontSize: '10px' }}>
                          1 new
                        </span>
                      </div>

                      <div className="p-2 rounded-3" style={{ background: '#fffbeb', border: '1px solid #fef3c7' }}>
                        <div className="d-flex gap-2">
                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: '32px',
                              height: '32px',
                              background:
                                notificationForm.type === 'promotional'
                                  ? '#fdf2f8'
                                  : notificationForm.type === 'order_update'
                                  ? '#eff6ff'
                                  : '#fef3c7',
                              color:
                                notificationForm.type === 'promotional'
                                  ? '#db2777'
                                  : notificationForm.type === 'order_update'
                                  ? '#2563eb'
                                  : '#d97706',
                              fontSize: '14px',
                            }}
                          >
                            {notificationForm.type === 'promotional' && <i className="fa-solid fa-gift"></i>}
                            {notificationForm.type === 'order_update' && <i className="fa-solid fa-truck-fast"></i>}
                            {notificationForm.type === 'system' && <i className="fa-solid fa-bell"></i>}
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="fw-bold small text-dark text-truncate">
                              {notificationForm.title || 'Notification Title Preview'}
                            </div>
                            <div className="text-muted mt-1" style={{ fontSize: '12px', lineHeight: '1.35', wordBreak: 'break-word' }}>
                              {notificationForm.message || 'The customer will see your message body rendered dynamically here in real time.'}
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-2" style={{ fontSize: '10px', color: '#94a3b8' }}>
                              <span>Just now</span>
                              <span>• {notificationForm.type.replace('_', ' ').toUpperCase()}</span>
                            </div>
                          </div>
                          <span className="rounded-circle" style={{ width: '7px', height: '7px', background: '#d97706', marginTop: '4px' }}></span>
                        </div>
                      </div>

                      <div className="mt-3 p-2 rounded-2 bg-light text-muted text-center" style={{ fontSize: '11px' }}>
                        <i className="fa-solid fa-shield-halved me-1"></i> Target:{' '}
                        <strong>
                          {notificationForm.target_audience === 'all'
                            ? 'All Registered Users'
                            : selectedCustomerPreview
                            ? `${selectedCustomerPreview.username || 'User'} (ID #${selectedCustomerPreview.id})`
                            : 'Specific Customer Pending Selection'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dispatch History Table Card */}
            <div className="admin-card-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h3 className="admin-card-title mb-1">
                  Dispatch History ({notificationsTotal})
                </h3>
                <p className="text-muted small mb-0">Server-side paginated log of dispatched alerts and real-time read metrics.</p>
              </div>

              {/* Filters & Search */}
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="admin-search-box">
                  <i className="fa-solid fa-magnifying-glass admin-search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search by title, message, customer..."
                    className="admin-search-input"
                    value={notificationSearchQuery}
                    onChange={(e) => {
                      setNotificationSearchQuery(e.target.value);
                      setNotificationsPage(1);
                    }}
                  />
                  {notificationSearchQuery && (
                    <button
                      className="btn btn-sm btn-link text-muted p-0 ms-1"
                      onClick={() => setNotificationSearchQuery('')}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>

                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={notificationTypeFilter}
                  onChange={(e) => {
                    setNotificationTypeFilter(e.target.value);
                    setNotificationsPage(1);
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="promotional">Promotional</option>
                  <option value="order_update">Order Update</option>
                  <option value="system">System</option>
                </select>

                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={notificationAudienceFilter}
                  onChange={(e) => {
                    setNotificationAudienceFilter(e.target.value);
                    setNotificationsPage(1);
                  }}
                >
                  <option value="all">All Audiences</option>
                  <option value="broadcast">Broadcasts Only</option>
                  <option value="specific">Targeted Only</option>
                </select>

                <button
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  onClick={fetchNotificationsHistory}
                  title="Refresh Table"
                >
                  <i className={`fa-solid fa-rotate-right ${loadingNotifications ? 'fa-spin' : ''}`}></i>
                </button>
              </div>
            </div>

            {/* Table or Empty State */}
            <div className="admin-table-container">
              {loadingNotifications ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status"></div>
                  <p className="text-muted small mt-2">Loading notification dispatches...</p>
                </div>
              ) : notificationsList.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa-regular fa-bell-slash fa-3x text-muted opacity-50 mb-3"></i>
                  <h5 className="fw-bold text-dark">No Notifications Found</h5>
                  <p className="text-muted small">
                    {notificationSearchQuery || notificationTypeFilter !== 'all' || notificationAudienceFilter !== 'all'
                      ? 'No notification dispatches match your filter criteria.'
                      : 'No notifications have been dispatched yet. Compose an alert above to get started.'}
                  </p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>ID & Type</th>
                      <th>Title & Message Content</th>
                      <th>Target Audience</th>
                      <th>Read State</th>
                      <th>Dispatched At</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notificationsList.map((notif) => {
                      const isBroadcast = notif.user_id === null;
                      return (
                        <tr key={notif.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold small text-muted">#{notif.id}</span>
                              <span
                                className={`badge ${
                                  notif.type === 'promotional'
                                    ? 'bg-danger-subtle text-danger'
                                    : notif.type === 'order_update'
                                    ? 'bg-primary-subtle text-primary'
                                    : 'bg-warning-subtle text-warning'
                                } rounded-pill`}
                                style={{ fontSize: '11px' }}
                              >
                                {notif.type}
                              </span>
                            </div>
                          </td>
                          <td style={{ maxWidth: '320px' }}>
                            <div className="fw-bold text-dark mb-1">{notif.title}</div>
                            <div
                              className="text-muted small text-truncate"
                              style={{ maxWidth: '300px' }}
                              title={notif.message}
                            >
                              {notif.message}
                            </div>
                          </td>
                          <td>
                            {isBroadcast ? (
                              <span className="badge bg-purple-subtle text-purple border rounded-pill px-2 py-1">
                                <i className="fa-solid fa-bullhorn me-1"></i> All Users (Broadcast)
                              </span>
                            ) : (
                              <div>
                                <div className="fw-bold small text-dark">
                                  <i className="fa-solid fa-user me-1 text-primary"></i>
                                  {notif.recipient_username || 'Customer'} (ID #{notif.user_id})
                                </div>
                                <div className="text-muted" style={{ fontSize: '11px' }}>
                                  {notif.recipient_phone || notif.recipient_email || 'No contact email'}
                                </div>
                              </div>
                            )}
                          </td>
                          <td>
                            {isBroadcast ? (
                              <span className="badge bg-light text-dark border rounded-pill px-2 py-1">
                                <i className="fa-solid fa-envelope-open me-1 text-muted"></i>
                                {notif.read_count || 0} user reads
                              </span>
                            ) : notif.is_read ? (
                              <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1">
                                <i className="fa-solid fa-check-double me-1"></i> Read
                              </span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning rounded-pill px-2 py-1">
                                <i className="fa-solid fa-clock me-1"></i> Unread
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="small text-dark fw-medium">
                              {new Date(notif.created_at).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>
                              {new Date(notif.created_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="d-flex align-items-center justify-content-end gap-1">
                              <button
                                className="admin-btn-action"
                                title="View Notification Payload"
                                onClick={() => setViewingNotification(notif)}
                              >
                                <i className="fa-solid fa-eye text-primary"></i>
                              </button>
                              <button
                                className="admin-btn-action text-danger"
                                title="Retract / Delete Notification"
                                onClick={() => handleDeleteNotification(notif)}
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Server-Side Pagination Footer */}
            {!loadingNotifications && notificationsList.length > 0 && (
              <div className="d-flex flex-wrap align-items-center justify-content-between p-3 border-top mt-2">
                <span className="text-muted small">
                  Showing page {notificationsPage} of {notificationsTotalPages} ({notificationsTotal} total dispatches)
                </span>
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    disabled={notificationsPage <= 1}
                    onClick={() => setNotificationsPage((p) => Math.max(1, p - 1))}
                  >
                    <i className="fa-solid fa-chevron-left me-1"></i> Previous
                  </button>
                  <button
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    disabled={notificationsPage >= notificationsTotalPages}
                    onClick={() => setNotificationsPage((p) => p + 1)}
                  >
                    Next <i className="fa-solid fa-chevron-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 7: FAQS CRUD
           ------------------------------------------------------------- */}
        {activeTab === 'faqs' && (
          <div className="admin-card-box">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Frequently Asked Questions ({faqsList.length})</h3>
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAddFaq}>
                <i className="fa-solid fa-plus me-1"></i> Add New FAQ
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Actions (Edit / Delete)</th>
                  </tr>
                </thead>
                <tbody>
                  {faqsList.map((faq) => (
                    <tr key={faq.id}>
                      <td className="fw-bold">#{faq.display_order}</td>
                      <td className="fw-bold" style={{ maxWidth: '240px' }}>{faq.question}</td>
                      <td className="text-muted" style={{ maxWidth: '340px' }}>{faq.answer}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleOpenEditFaq(faq)}>
                            <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteFaq(faq.id)}>
                            <i className="fa-solid fa-trash-can me-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 8: TERMS & STORE POLICIES CRUD
           ------------------------------------------------------------- */}
        {activeTab === 'terms' && (
          <div className="admin-card-box">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Terms & Conditions & Store Policies Editor</h3>
              <span className="small text-muted">Last Updated: {termsData.updated_at}</span>
            </div>

            <form onSubmit={handleSaveTerms}>
              <div className="mb-3">
                <label className="form-label fw-bold">Policy Title</label>
                <input
                  type="text"
                  className="form-control form-control-lg fw-bold"
                  value={termsData.title}
                  onChange={(e) => setTermsData({ ...termsData, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Policy Content (Markdown / Text)</label>
                <textarea
                  className="form-control"
                  rows="8"
                  value={termsData.content}
                  onChange={(e) => setTermsData({ ...termsData, content: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="submit" className="admin-btn admin-btn-primary">
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Store Policy Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 9: CONTACT INBOX
           ------------------------------------------------------------- */}
        {activeTab === 'contact' && (
          <div className="admin-card-box">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Customer Support Inbox ({contactMessages.length})</h3>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Subject</th>
                    <th>Contact Phone / Email</th>
                    <th>Message Details</th>
                  </tr>
                </thead>
                <tbody>
                  {contactMessages.map((msg) => (
                    <tr key={msg.id}>
                      <td className="small text-muted">{msg.created_at}</td>
                      <td className="fw-bold">{msg.name}</td>
                      <td className="fw-bold text-primary">{msg.subject}</td>
                      <td className="small">{msg.phone_number} <br /> {msg.email}</td>
                      <td style={{ maxWidth: '300px' }}>{msg.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 10: REGISTERED CUSTOMERS
           ------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="admin-card-box">
            <div className="admin-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h3 className="admin-card-title mb-1">
                  <i className="fa-solid fa-users text-primary me-2"></i> Registered Customers ({customersPagination.total || usersList.length})
                </h3>
                <p className="text-muted small mb-0">Live customer profiles, verified orders, and total lifetime spend.</p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="admin-btn admin-btn-outline admin-btn-sm d-flex align-items-center gap-1"
                  onClick={handleExportCustomersCsv}
                  title="Export customer directory to CSV"
                >
                  <i className="fa-solid fa-file-csv text-success"></i> Export Customers (.CSV)
                </button>
              </div>
            </div>

            {/* Customer Search Filter */}
            <div className="p-3 bg-light border-bottom d-flex align-items-center" style={{ maxWidth: '420px' }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-2">
                  <i className="fa-solid fa-magnifying-glass text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm border-2"
                  placeholder="Search customer username, email, phone, child..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                />
                {customerSearchQuery && (
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setCustomerSearchQuery('')}>✕</button>
                )}
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Name & Email</th>
                    <th>Phone Number</th>
                    <th>Child's Name</th>
                    <th>Total Orders</th>
                    <th>Total Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                        <div className="fw-bold">No registered customer accounts found</div>
                        <p className="small text-muted mb-0">Customer signups from the storefront will appear here dynamically.</p>
                      </td>
                    </tr>
                  ) : (
                    usersList.map((usr) => (
                      <tr key={usr.id}>
                        <td>
                          <div className="fw-bold">{usr.username}</div>
                          <div className="small text-muted">{usr.email}</div>
                        </td>
                        <td>{usr.phone_number || usr.phone || 'N/A'}</td>
                        <td><i className="fa-solid fa-child me-1 text-warning"></i> {usr.child_name || usr.childName || 'N/A'}</td>
                        <td><span className="badge bg-light text-dark border px-2 py-1">{usr.total_orders || 0} orders</span></td>
                        <td className="fw-bold text-success">₹{parseFloat(usr.total_spent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {customersPagination.totalPages > 1 && (
              <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  Showing Page <strong>{customersPagination.page}</strong> of <strong>{customersPagination.totalPages}</strong> ({customersPagination.total} total customers)
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={customersPagination.page <= 1}
                    onClick={() => setCustomersPagination((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={customersPagination.page >= customersPagination.totalPages}
                    onClick={() => setCustomersPagination((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: HERO INGREDIENTS FORMULATION CMS
           ------------------------------------------------------------- */}
        {activeTab === 'ingredients' && (
          <div className="admin-card-box">
            <div className="admin-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h3 className="admin-card-title mb-1">
                  <i className="fa-solid fa-flask-vial text-primary me-2"></i> Hero Formulation Ingredients CMS ({ingredientsList.length})
                </h3>
                <p className="text-muted small mb-0">
                  Manage active formulation ingredients (nHAp, Theobromine, Prebiotics, etc.) shown dynamically across the store.
                </p>
              </div>

              <button className="admin-btn admin-btn-primary" onClick={handleOpenAddIngredient}>
                <i className="fa-solid fa-plus me-1"></i> Add New Ingredient
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Icon</th>
                    <th>Ingredient & Tag</th>
                    <th>Subtitle</th>
                    <th>Key Formulation Benefits</th>
                    <th>Badge</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredientsList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧪</div>
                        <div className="fw-bold">No hero ingredients recorded in PostgreSQL</div>
                        <p className="small text-muted mb-3">Click "Add New Ingredient" to create active formulation entries.</p>
                      </td>
                    </tr>
                  ) : (
                    ingredientsList.map((ing) => (
                      <tr key={ing.id}>
                        <td className="fw-bold text-muted text-center" style={{ width: '50px' }}>
                          #{ing.display_order}
                        </td>
                        <td>
                          <img
                            src={ing.icon_url || '/assets/tooth_paste.webp'}
                            alt={ing.name}
                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px', background: '#f8fafc', padding: '4px' }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{ing.name}</div>
                          <div className="small"><code className="text-muted">{ing.slug}</code></div>
                          {ing.tag && <span className="badge bg-light text-primary border mt-1">{ing.tag}</span>}
                        </td>
                        <td className="small text-muted" style={{ maxWidth: '200px' }}>
                          {ing.sub_title}
                        </td>
                        <td style={{ maxWidth: '280px' }}>
                          {Array.isArray(ing.benefits) && ing.benefits.length > 0 ? (
                            <ul className="mb-0 ps-3 small text-muted">
                              {ing.benefits.map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="small text-muted">No bullet points</span>
                          )}
                        </td>
                        <td>
                          {ing.badge_text ? (
                            <span className="badge bg-warning-subtle text-dark border fw-bold px-2 py-1">
                              {ing.badge_text}
                            </span>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                        <td>
                          <div className="form-check form-switch m-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={ing.is_active !== false}
                              onChange={() => handleToggleIngredientActive(ing.id, ing.is_active !== false)}
                              title={ing.is_active !== false ? 'Active in CMS' : 'Hidden'}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="admin-btn admin-btn-outline admin-btn-sm"
                              onClick={() => handleOpenEditIngredient(ing)}
                            >
                              <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                            </button>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              onClick={() => handleDeleteIngredient(ing.id, ing.name)}
                            >
                              <i className="fa-solid fa-trash-can me-1"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: ADMIN AUDIT TRAIL ACTIVITY LOGS
           ------------------------------------------------------------- */}
        {activeTab === 'audit_logs' && (
          <div className="admin-card-box">
            <div className="admin-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h3 className="admin-card-title mb-1">
                  <i className="fa-solid fa-clipboard-list text-primary me-2"></i> Security & Activity Audit Trail ({auditLogsPagination.total || auditLogsList.length})
                </h3>
                <p className="text-muted small mb-0">Immutable records of all administrator mutations across PostgreSQL tables.</p>
              </div>

              <span className="badge bg-danger-subtle text-danger border px-3 py-2 fw-bold">
                <i className="fa-solid fa-shield-halved me-1"></i> RBAC Security Audited
              </span>
            </div>

            {/* Audit Filters */}
            <div className="p-3 bg-light border-bottom d-flex flex-wrap gap-3 align-items-center justify-content-between">
              <div className="d-flex flex-grow-1 align-items-center gap-2" style={{ maxWidth: '360px' }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-2">
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-sm border-2"
                    placeholder="Search action or entity..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                  />
                  {auditSearchQuery && (
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditSearchQuery('')}>✕</button>
                  )}
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="d-flex align-items-center gap-1">
                  <label className="small fw-bold text-muted mb-0">Action:</label>
                  <select
                    className="form-select form-select-sm border-2 fw-bold"
                    style={{ width: '160px' }}
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                  >
                    <option value="">All Actions</option>
                    <option value="CREATE_PRODUCT">CREATE_PRODUCT</option>
                    <option value="UPDATE_PRODUCT">UPDATE_PRODUCT</option>
                    <option value="DELETE_PRODUCT">DELETE_PRODUCT</option>
                    <option value="UPDATE_ORDER_STATUS">UPDATE_ORDER_STATUS</option>
                    <option value="CANCEL_ORDER">CANCEL_ORDER</option>
                    <option value="SHIPROCKET_FULFILL">SHIPROCKET_FULFILL</option>
                    <option value="CREATE_BLOG">CREATE_BLOG</option>
                    <option value="UPDATE_BLOG">UPDATE_BLOG</option>
                    <option value="DELETE_BLOG">DELETE_BLOG</option>
                    <option value="CREATE_INGREDIENT">CREATE_INGREDIENT</option>
                    <option value="UPDATE_INGREDIENT">UPDATE_INGREDIENT</option>
                    <option value="DELETE_INGREDIENT">DELETE_INGREDIENT</option>
                  </select>
                </div>

                <div className="d-flex align-items-center gap-1">
                  <label className="small fw-bold text-muted mb-0">Entity:</label>
                  <select
                    className="form-select form-select-sm border-2 fw-bold"
                    style={{ width: '140px' }}
                    value={auditEntityFilter}
                    onChange={(e) => setAuditEntityFilter(e.target.value)}
                  >
                    <option value="">All Entities</option>
                    <option value="product">Products</option>
                    <option value="order">Orders</option>
                    <option value="blog">Blogs</option>
                    <option value="ingredient">Ingredients</option>
                    <option value="category">Categories</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                    <th>Admin ID</th>
                    <th>IP Address</th>
                    <th>Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogsList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                        <div className="fw-bold">No admin audit activity logs found</div>
                        <p className="small text-muted mb-0">All future administrator mutations will be logged here with cryptographic timestamps.</p>
                      </td>
                    </tr>
                  ) : (
                    auditLogsList.map((log) => {
                      const isDanger = log.action.includes('DELETE') || log.action.includes('CANCEL');
                      const isSuccess = log.action.includes('CREATE') || log.action.includes('FULFILL');
                      const badgeClass = isDanger ? 'badge-danger' : isSuccess ? 'badge-success' : 'badge-warning';

                      return (
                        <tr key={log.id}>
                          <td className="small text-muted" style={{ whiteSpace: 'nowrap' }}>
                            {log.created_at ? new Date(log.created_at).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            }) : 'Recent'}
                          </td>
                          <td>
                            <span className={`admin-badge ${badgeClass} font-monospace fw-bold`}>
                              {log.action}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border text-uppercase">{log.entity_type}</span>
                          </td>
                          <td className="fw-bold font-monospace">#{log.entity_id}</td>
                          <td className="small text-muted">{log.admin_id ? `Admin #${log.admin_id}` : 'System'}</td>
                          <td className="small font-monospace text-muted">{log.ip_address || '127.0.0.1'}</td>
                          <td style={{ maxWidth: '340px' }}>
                            <div className="small font-monospace text-truncate" title={JSON.stringify(log.details)}>
                              {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '-')}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {auditLogsPagination.totalPages > 1 && (
              <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  Showing Page <strong>{auditLogsPagination.page}</strong> of <strong>{auditLogsPagination.totalPages}</strong> ({auditLogsPagination.total} total logs)
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={auditLogsPagination.page <= 1}
                    onClick={() => setAuditLogsPagination((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={auditLogsPagination.page >= auditLogsPagination.totalPages}
                    onClick={() => setAuditLogsPagination((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            BRAND REELS / VIDEOS MANAGEMENT
           ------------------------------------------------------------- */}
        {activeTab === 'reels' && (
          <div className="admin-card-box">
            <div className="admin-card-header d-flex justify-content-between align-items-center">
              <div>
                <h3 className="admin-card-title mb-1">Brand Video Reels ({reelsList.length})</h3>
                <p className="text-muted small mb-0">Manage video reels shown in "See what our happy smiles have to say …" section on Home page and link each reel to a product.</p>
              </div>
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAddReel}>
                <i className="fa-solid fa-plus me-1"></i> Upload New Reel Video
              </button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Video Preview</th>
                    <th>Linked Product</th>
                    <th>Price</th>
                    <th>Caption & Author</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reelsList.map((reel) => (
                    <tr key={reel.id}>
                      <td>
                        <video
                          src={reel.video_url}
                          style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {reel.product_photo && (
                            <img src={reel.product_photo} alt={reel.product_name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'contain' }} />
                          )}
                          <div>
                            <div className="fw-bold">{reel.product_name}</div>
                            <span className="small text-muted">ID: {reel.product_id || 'N/A'} | Slug: {reel.product_slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="fw-bold text-success">₹{reel.price}</td>
                      <td>
                        <div className="small fw-bold">{reel.caption}</div>
                        <div className="small text-muted">{reel.author}</div>
                      </td>
                      <td><span className="badge bg-warning text-dark">{reel.rating || '5.0 ★'} ({reel.reviews_count || '1k+'})</span></td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleOpenEditReel(reel)}>
                            <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteReel(reel.id)}>
                            <i className="fa-solid fa-trash-can me-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reelsList.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No video reels added yet. Click "Upload New Reel Video" to add one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TESTIMONIALS MANAGEMENT
           ------------------------------------------------------------- */}
        {activeTab === 'testimonials' && (
          <div className="admin-card-box">
            <div className="admin-card-header d-flex justify-content-between align-items-center">
              <div>
                <h3 className="admin-card-title mb-1">Customer Testimonials ({testimonialsList.length})</h3>
                <p className="text-muted small mb-0">Manage customer stories, dentist reviews, and quotes displayed in the Testimonials section on Home page.</p>
              </div>
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAddTestimonial}>
                <i className="fa-solid fa-plus me-1"></i> Add New Testimonial
              </button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Author / Customer Name</th>
                    <th>Rating</th>
                    <th>Testimonial Quote</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonialsList.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.author || item.author_name || item.name}</td>
                      <td>
                        <span className="badge bg-warning text-dark fw-bold">
                          <i className="fa-solid fa-star me-1"></i> {item.rating || 5} / 5
                        </span>
                      </td>
                      <td style={{ maxWidth: '400px' }} className="fst-italic text-secondary">
                        "{item.text || item.testimonial || item.review}"
                      </td>
                      <td className="small text-muted">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleOpenEditTestimonial(item)}>
                            <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteTestimonial(item.id)}>
                            <i className="fa-solid fa-trash-can me-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {testimonialsList.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No testimonials added yet. Click "Add New Testimonial" to add one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* -------------------------------------------------------------
          PRODUCT ADD/EDIT MODAL
         ------------------------------------------------------------- */}
      {showProductModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowProductModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="fw-bold mb-3" style={{ color: '#4B2E1E' }}>
              {editingProduct ? 'Edit Product' : 'Add New Prebiotic Product'}
            </h3>

            <form onSubmit={handleSaveProduct}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Product Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Natural Bubblegum Blast Prebiotic Toothpaste"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Product Category</label>
                <select
                  className="form-select"
                  value={productForm.category_id || (categories[0]?.id || 1)}
                  onChange={(e) => setProductForm({ ...productForm, category_id: parseInt(e.target.value) })}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="1">Toothpaste (Default)</option>
                  )}
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Regular Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="299"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Discount Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="249"
                    value={productForm.final_price}
                    onChange={(e) => setProductForm({ ...productForm, final_price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">SKU Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Bundle Configuration</label>
                  <select
                    className="form-select"
                    value={productForm.bundle_type || 'single'}
                    onChange={(e) => setProductForm({ ...productForm, bundle_type: e.target.value })}
                  >
                    <option value="single">Single Tube (Standard)</option>
                    <option value="bundle-2">2-Pack Bundle</option>
                    <option value="bundle-3">3-Pack Bundle</option>
                    <option value="family">Family Pack</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="10"
                    value={productForm.low_stock_threshold ?? 10}
                    onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-check form-switch mb-3 p-3 bg-light rounded-3 border">
                <input
                  className="form-check-input ms-0 me-2"
                  type="checkbox"
                  role="switch"
                  id="bestsellerSwitch"
                  checked={!!productForm.is_bestseller}
                  onChange={(e) => setProductForm({ ...productForm, is_bestseller: e.target.checked })}
                />
                <label className="form-check-label fw-bold text-dark" htmlFor="bestsellerSwitch">
                  <i className="fa-solid fa-fire text-warning me-1"></i> Mark as Bestseller Product
                </label>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Product Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe your product benefits, flavor, and ingredients..."
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Upload Product Image (.jpg, .jpeg, .png only)</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageFileUpload(e, setProductForm)}
                />
                {uploadingImage && <div className="small text-primary mt-1 fw-bold"><i className="fa-solid fa-spinner fa-spin me-1"></i> Uploading file...</div>}
                {productForm.primary_image && (
                  <div className="mt-2 text-center p-2 border rounded-3 bg-light">
                    <img src={productForm.primary_image} alt="Preview" style={{ height: '90px', borderRadius: '8px', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          BLOG ADD/EDIT MODAL (100% Dynamic Rich Editorial Control)
         ------------------------------------------------------------- */}
      {showBlogModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowBlogModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="fw-bold mb-1" style={{ color: '#4B2E1E' }}>
                  {editingBlog ? 'Edit Blog Article' : 'Create New Blog Post'}
                </h3>
                <p className="text-muted small mb-0">
                  Manage all editorial metadata, tags, author credentials, and article content dynamically.
                </p>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowBlogModal(false)}
                aria-label="Close"
              />
            </div>

            <form onSubmit={handleSaveBlog}>
              {/* Row 1: Title & Slug */}
              <div className="row g-3 mb-3">
                <div className="col-md-8">
                  <label className="form-label small fw-bold">Article Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Why Nano-Hydroxyapatite is Replacing Fluoride in Kids Dentistry"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">URL Slug (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="why-nano-hydroxyapatite"
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                  />
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>Auto-generated if left blank</small>
                </div>
              </div>

              {/* Row 2: Category, Reading Time & Tags */}
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Pediatric Dental Science"
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold">Reading Time</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5 min read"
                    value={blogForm.reading_time}
                    onChange={(e) => setBlogForm({ ...blogForm, reading_time: e.target.value })}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-bold">
                    Tags <span className="text-muted fw-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="FluorideFree, NanoHydroxyapatite, OralHealth"
                    value={blogForm.tags}
                    onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Author Info (Name, Role, Avatar) */}
              <div className="p-3 mb-3 rounded-3" style={{ background: '#FAF7F2', border: '1px solid #EBDBC8' }}>
                <div className="fw-bold mb-2 text-dark small">
                  <i className="fa-solid fa-user-doctor me-1 text-primary"></i> Author Profile & Credentials
                </div>
                <div className="row g-3 mb-2">
                  <div className="col-md-5">
                    <label className="form-label small fw-bold">Author Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Dr. Ananya Sharma"
                      value={blogForm.author}
                      onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Author Title / Role</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BDS, MDS • Pediatric Specialist"
                      value={blogForm.author_role}
                      onChange={(e) => setBlogForm({ ...blogForm, author_role: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold">Author Avatar</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={(e) => handleGenericFileUpload(e, 'author_avatar', setBlogForm)}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-bold">Author Bio</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Brief background or clinical research credentials of the author..."
                    value={blogForm.author_bio}
                    onChange={(e) => setBlogForm({ ...blogForm, author_bio: e.target.value })}
                  ></textarea>
                </div>
              </div>

              {/* Row 4: Cover Image & Caption */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Featured Cover Image</label>
                  <input
                    type="file"
                    className="form-control mb-1"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageFileUpload(e, setBlogForm)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Or enter image URL directly"
                    value={blogForm.image_url}
                    onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Featured Image Caption</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Descriptive scientific or clinical caption displayed directly under the hero image..."
                    value={blogForm.image_caption}
                    onChange={(e) => setBlogForm({ ...blogForm, image_caption: e.target.value })}
                  ></textarea>
                </div>
              </div>

              {/* Row 5: Excerpt / Lead Paragraph */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Short Introduction / Excerpt</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Compelling opening hook or summary displayed at the top of the article and in blog cards..."
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                ></textarea>
              </div>

              {/* Row 6: Main Article Content */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Main Article Content <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  rows="7"
                  placeholder="Write the full article content. Double-spacing creates distinct paragraphs..."
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  required
                ></textarea>
              </div>

              {/* Row 7: Conclusion Takeaways */}
              <div className="mb-3">
                <label className="form-label small fw-bold">Key Conclusion Takeaways <span className="text-muted fw-normal">(One takeaway per line)</span></label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="e.g.&#10;nHAp actively bonds to microscopic enamel lesions.&#10;Zero toxic warnings if swallowed.&#10;Twice-daily brushing ensures biological remineralization."
                  value={blogForm.conclusion_takeaways}
                  onChange={(e) => setBlogForm({ ...blogForm, conclusion_takeaways: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowBlogModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingBlog ? 'Save Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          PROMOTIONS & COUPON ADD/EDIT MODAL
         ------------------------------------------------------------- */}
      {showCouponModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCouponModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="fw-bold mb-3" style={{ color: '#4B2E1E' }}>
              {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Generate Promotional Discount Code'}
            </h3>

            <form onSubmit={handleSaveCoupon}>
              <div className="row g-2 mb-3">
                <div className="col-7">
                  <label className="form-label small fw-bold">Coupon Code <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control text-uppercase fw-bold font-monospace"
                    placeholder="e.g. WOOFF25"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    required
                  />
                  <span className="small text-muted">Auto-formatted in uppercase for customers.</span>
                </div>
                <div className="col-5">
                  <label className="form-label small fw-bold">Discount Type <span className="text-danger">*</span></label>
                  <select
                    className="form-select fw-bold"
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                    required
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Rate (₹ OFF)</option>
                  </select>
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">
                    {couponForm.discount_type === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={couponForm.discount_type === 'percentage' ? '100' : '100000'}
                    className="form-control fw-bold"
                    placeholder={couponForm.discount_type === 'percentage' ? '20' : '150'}
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="form-control"
                    placeholder="0 (No minimum)"
                    value={couponForm.min_order_value}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_value: e.target.value })}
                  />
                  <span className="small text-muted">Cart subtotal required to apply code.</span>
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Valid From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={couponForm.valid_from}
                    onChange={(e) => setCouponForm({ ...couponForm, valid_from: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Valid Until (Expiration Date)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={couponForm.valid_until}
                    onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
                  />
                  <span className="small text-muted">Leave empty for lifetime promo codes.</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Total Redemptions Cap (Usage Limit)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="e.g. 500 (Leave blank for unlimited)"
                  value={couponForm.usage_limit}
                  onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                />
                <span className="small text-muted">Limits maximum number of times this code can be used across all shoppers.</span>
              </div>

              <div className="form-check form-switch mb-3 p-3 bg-light rounded-3 border">
                <input
                  className="form-check-input ms-0 me-2"
                  type="checkbox"
                  role="switch"
                  id="couponActiveToggle"
                  checked={!!couponForm.is_active}
                  onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                />
                <label className="form-check-label fw-bold text-dark" htmlFor="couponActiveToggle">
                  Enable Coupon Code (Immediately Active on Storefront Checkout)
                </label>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCouponModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingCoupon ? 'Save Coupon Changes' : 'Launch Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          ABANDONED CART ITEM INSPECTION MODAL
         ------------------------------------------------------------- */}
      {viewingAbandonedCart && (
        <div className="admin-modal-backdrop" onClick={() => setViewingAbandonedCart(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="fw-bold mb-0" style={{ color: '#4B2E1E' }}>
                  <i className="fa-solid fa-cart-arrow-down text-warning me-2"></i>
                  Abandoned Cart #{viewingAbandonedCart.id}
                </h3>
                <span className="small text-muted">
                  Dropped off on {new Date(viewingAbandonedCart.created_at).toLocaleString()}
                </span>
              </div>
              <button className="btn-close" onClick={() => setViewingAbandonedCart(null)}></button>
            </div>

            {/* Customer Contact Box */}
            <div className="p-3 bg-light rounded-3 border mb-3">
              <div className="fw-bold text-dark mb-1">
                {viewingAbandonedCart.customer_name || 'Guest Shopper'}
              </div>
              <div className="small text-muted">
                <i className="fa-solid fa-envelope me-1"></i> {viewingAbandonedCart.email || 'No email entered'}
              </div>
              {viewingAbandonedCart.phone && (
                <div className="small text-muted mt-1 d-flex align-items-center gap-2">
                  <span><i className="fa-solid fa-phone me-1"></i> {viewingAbandonedCart.phone}</span>
                  <a
                    href={`https://wa.me/91${viewingAbandonedCart.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${viewingAbandonedCart.customer_name || 'there'}, your Wooff Kids Prebiotic Toothpaste cart is waiting! Use code WOOFF10 for 10% off: https://wooff.care/checkout`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="badge bg-success text-white text-decoration-none px-2 py-1"
                  >
                    <i className="fa-brands fa-whatsapp me-1"></i> WhatsApp Recovery
                  </a>
                </div>
              )}
              <div className="small text-muted mt-1">
                <i className="fa-solid fa-shoe-prints me-1 text-warning"></i> Funnel Stage: <strong className="text-capitalize">{String(viewingAbandonedCart.checkout_step || 'shipping_details').replace(/_/g, ' ')}</strong>
              </div>
            </div>

            {/* Items Table */}
            <div className="table-responsive mb-3 border rounded-3">
              <table className="table table-sm table-striped mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Product</th>
                    <th>Configuration</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(viewingAbandonedCart.items) ? viewingAbandonedCart.items : []).map((it, idx) => {
                    const price = parseFloat(it.final_price || it.price || it.unit_price || 0);
                    const qty = parseInt(it.quantity || 1, 10);
                    return (
                      <tr key={idx} className="small align-middle">
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {it.image && (
                              <img src={it.image} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                            )}
                            <span className="fw-bold">{it.title || it.name || 'Toothpaste'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border small text-capitalize">
                            {it.bundle_type || 'Single Tube'}
                          </span>
                        </td>
                        <td>{qty}</td>
                        <td>₹{price.toFixed(2)}</td>
                        <td className="text-end fw-bold">₹{(price * qty).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border mb-4">
              <span className="fw-bold text-dark">Total Potential Cart Value:</span>
              <span className="fw-bold fs-5 text-danger">₹{parseFloat(viewingAbandonedCart.total_value || 0).toLocaleString()}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="small fw-bold text-muted">Recovery Status:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '140px' }}
                  value={viewingAbandonedCart.recovery_status}
                  onChange={(e) => {
                    handleUpdateCartRecoveryStatus(viewingAbandonedCart.id, e.target.value);
                    setViewingAbandonedCart((prev) => ({ ...prev, recovery_status: e.target.value }));
                  }}
                >
                  <option value="abandoned">Abandoned</option>
                  <option value="contacted">Contacted</option>
                  <option value="recovered">Recovered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button className="admin-btn admin-btn-outline" onClick={() => setViewingAbandonedCart(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          NOTIFICATION PAYLOAD INSPECTION MODAL
         ------------------------------------------------------------- */}
      {viewingNotification && (
        <div className="admin-modal-backdrop" onClick={() => setViewingNotification(null)}>
          <div className="admin-modal-card p-4" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <span
                  className={`badge ${
                    viewingNotification.type === 'promotional'
                      ? 'bg-danger-subtle text-danger'
                      : viewingNotification.type === 'order_update'
                      ? 'bg-primary-subtle text-primary'
                      : 'bg-warning-subtle text-warning'
                  } me-2 text-uppercase`}
                  style={{ fontSize: '11px' }}
                >
                  {viewingNotification.type}
                </span>
                <span className="fw-bold small text-muted">Alert #{viewingNotification.id}</span>
              </div>
              <button
                className="btn-close"
                onClick={() => setViewingNotification(null)}
                aria-label="Close"
              ></button>
            </div>

            <h4 className="fw-bold text-dark mb-2">{viewingNotification.title}</h4>

            <div className="p-3 bg-light rounded-3 mb-3 border">
              <label className="text-muted small fw-bold mb-1 d-block">Message Content</label>
              <div className="text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                {viewingNotification.message}
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="p-2 bg-light rounded-2 border">
                  <div className="text-muted small">Target Audience</div>
                  <div className="fw-bold small text-dark mt-1">
                    {viewingNotification.user_id === null ? (
                      <span className="text-purple">📢 All Registered Users</span>
                    ) : (
                      <span>👤 {viewingNotification.recipient_username || 'User'} (ID #{viewingNotification.user_id})</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 bg-light rounded-2 border">
                  <div className="text-muted small">Engagement / Status</div>
                  <div className="fw-bold small text-dark mt-1">
                    {viewingNotification.user_id === null ? (
                      <span>{viewingNotification.read_count || 0} user read receipts</span>
                    ) : viewingNotification.is_read ? (
                      <span className="text-success"><i className="fa-solid fa-check-double me-1"></i> Read</span>
                    ) : (
                      <span className="text-warning"><i className="fa-solid fa-clock me-1"></i> Unread</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
              <span className="text-muted small">
                Dispatched: {new Date(viewingNotification.created_at).toLocaleString('en-IN')}
              </span>
              <button className="admin-btn admin-btn-outline" onClick={() => setViewingNotification(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          FAQ ADD/EDIT MODAL
         ------------------------------------------------------------- */}
      {showFaqModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowFaqModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="fw-bold mb-3" style={{ color: '#4B2E1E' }}>
              {editingFaq ? 'Edit FAQ Item' : 'Create New FAQ Item'}
            </h3>

            <form onSubmit={handleSaveFaq}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Question</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Is Wooff toothpaste safe for toddlers?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Answer</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowFaqModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingFaq ? 'Save FAQ' : 'Create FAQ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          CATEGORY ADD/EDIT MODAL
         ------------------------------------------------------------- */}
      {showCategoryModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCategoryModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="fw-bold mb-3" style={{ color: '#4B2E1E' }}>
              {editingCategory ? 'Edit Product Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleSaveCategory}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Prebiotic Toothpastes"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">URL Slug (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. prebiotic-toothpastes"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Category description..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingCategory ? 'Save Category' : 'Create Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          BRAND REEL ADD/EDIT MODAL
         ------------------------------------------------------------- */}
      {showReelModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowReelModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="fw-bold mb-3" style={{ color: '#4B2E1E' }}>
              {editingReel ? 'Edit Video Reel' : 'Upload & Add New Video Reel'}
            </h3>

            <form onSubmit={handleSaveReel}>
              
              {/* Product Selection Dropdown */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  <i className="fa-solid fa-box-open text-warning me-1"></i> Select Linked Product from Store
                </label>
                <select
                  className="form-select form-select-lg border-2 fw-bold"
                  value={reelForm.product_id}
                  onChange={(e) => handleSelectProductForReel(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} - ₹{p.final_price || p.price}
                    </option>
                  ))}
                </select>
                <span className="small text-muted d-block mt-1">Selecting a product auto-fills the product name, photo, price, and cart connection.</span>
              </div>

              {/* Video File / URL Input */}
              <div className="mb-3 p-3 bg-light rounded-3 border">
                <label className="form-label small fw-bold">Upload Video File (.mp4, .webm)</label>
                <input
                  type="file"
                  className="form-control mb-2"
                  accept="video/mp4,video/webm,video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setReelForm((prev) => ({
                        ...prev,
                        video_file: file,
                        video_url: URL.createObjectURL(file),
                      }));
                    }
                  }}
                />
                <div className="text-center text-muted small my-1">-- OR --</div>
                <label className="form-label small fw-bold">Video Direct URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://example.com/video.mp4"
                  value={reelForm.video_url}
                  onChange={(e) => setReelForm({ ...reelForm, video_url: e.target.value })}
                />
                {reelForm.video_url && (
                  <div className="mt-2 text-center">
                    <video src={reelForm.video_url} style={{ maxHeight: '140px', borderRadius: '8px' }} controls />
                  </div>
                )}
              </div>

              <div className="row g-2 mb-3">
                <div className="col-8">
                  <label className="form-label small fw-bold">Product Display Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Wooff Choco Toothpaste"
                    value={reelForm.product_name}
                    onChange={(e) => setReelForm({ ...reelForm, product_name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="349"
                    value={reelForm.price}
                    onChange={(e) => setReelForm({ ...reelForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Video Caption</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Powered by 2% Nano-HAp 🦷"
                    value={reelForm.caption}
                    onChange={(e) => setReelForm({ ...reelForm, caption: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Author Handle</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. @wooffkids"
                    value={reelForm.author}
                    onChange={(e) => setReelForm({ ...reelForm, author: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Rating Text</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="5.0 ★"
                    value={reelForm.rating}
                    onChange={(e) => setReelForm({ ...reelForm, rating: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Reviews Count</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="2.4k"
                    value={reelForm.reviews_count}
                    onChange={(e) => setReelForm({ ...reelForm, reviews_count: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowReelModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={uploadingVideo}>
                  {uploadingVideo ? <><i className="fa-solid fa-spinner fa-spin me-1"></i> Saving...</> : (editingReel ? 'Save Reel Changes' : 'Publish Reel Video')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TESTIMONIAL ADD/EDIT MODAL
         ------------------------------------------------------------- */}
      {showTestimonialModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowTestimonialModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="fw-bold mb-3" style={{ color: '#4B2E1E' }}>
              {editingTestimonial ? 'Edit Customer Testimonial' : 'Add New Testimonial'}
            </h3>

            <form onSubmit={handleSaveTestimonial}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Author Name & Title</label>
                <input
                  type="text"
                  className="form-control form-control-lg fw-bold"
                  placeholder="e.g. Dr. Julian Vance, DDS"
                  value={testimonialForm.author}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, author: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Rating (1 to 5 Stars)</label>
                <select
                  className="form-select border-2 fw-bold"
                  value={testimonialForm.rating}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: e.target.value })}
                  required
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                  <option value="3">⭐⭐⭐ 3 Stars (Good)</option>
                  <option value="2">⭐⭐ 2 Stars (Fair)</option>
                  <option value="1">⭐ 1 Star (Poor)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Testimonial Quote / Review Text</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Enter parent or dentist quote here..."
                  value={testimonialForm.text}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowTestimonialModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingTestimonial ? 'Save Testimonial' : 'Publish Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          HERO INGREDIENT ADD/EDIT MODAL (Dynamic Formulation CMS)
         ------------------------------------------------------------- */}
      {showIngredientModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowIngredientModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="fw-bold mb-3" style={{ color: '#4B2E1E' }}>
              {editingIngredient ? `Edit Ingredient: ${editingIngredient.name}` : 'Add Formulation Hero Ingredient'}
            </h3>

            <form onSubmit={handleSaveIngredient}>
              <div className="row g-2 mb-3">
                <div className="col-8">
                  <label className="form-label small fw-bold">Ingredient Name *</label>
                  <input
                    type="text"
                    className="form-control fw-bold"
                    placeholder="e.g. Nano-Hydroxyapatite (nHAp)"
                    value={ingredientForm.name}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Display Order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={ingredientForm.display_order}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, display_order: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Scientific / Brand Subtitle</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 100% Non-Toxic Fluoride Alternative"
                    value={ingredientForm.sub_title}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, sub_title: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Badge Text</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Enamel Restoration"
                    value={ingredientForm.badge_text}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, badge_text: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Category Tag</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Remineralization"
                    value={ingredientForm.tag}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, tag: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Icon / Illustration Asset</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="/assets/tooth_paste.webp"
                    value={ingredientForm.icon_url}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, icon_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Clinical & Biological Mechanism *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Explain scientific mechanism and safety benefits for kids oral care..."
                  value={ingredientForm.description}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Key Benefits (One bullet per line)</label>
                <textarea
                  className="form-control font-monospace small"
                  rows="4"
                  placeholder="Rebuilds microscopic enamel lesions&#10;Blocks tooth sensitivity naturally&#10;Safe if swallowed by toddlers"
                  value={ingredientForm.benefits}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, benefits: e.target.value })}
                ></textarea>
              </div>

              <div className="form-check form-switch mb-3 p-3 bg-light rounded-3 border">
                <input
                  className="form-check-input ms-0 me-2"
                  type="checkbox"
                  role="switch"
                  id="ingredientActiveSwitch"
                  checked={!!ingredientForm.is_active}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, is_active: e.target.checked })}
                />
                <label className="form-check-label fw-bold text-dark" htmlFor="ingredientActiveSwitch">
                  Active (Syncs dynamically with customer-facing formulation UI)
                </label>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowIngredientModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingIngredient ? 'Update Ingredient' : 'Add Hero Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          CONFIRMATION MODAL (Replacing native window.confirm)
         ------------------------------------------------------------- */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        danger={confirmConfig.danger}
        onConfirm={handleModalConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* -------------------------------------------------------------
          PRINTABLE PACKING SLIP & TAX INVOICE MODAL
         ------------------------------------------------------------- */}
      <InvoiceModal
        isOpen={invoiceModalState.isOpen}
        orderId={invoiceModalState.orderId}
        initialOrder={invoiceModalState.order}
        onClose={() => setInvoiceModalState({ isOpen: false, orderId: null, order: null })}
      />

    </div>
  );
}
