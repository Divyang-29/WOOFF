import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../api';
import './Admin.css';

export default function Admin() {
  const { user } = useAuth();

  // Admin Security Access Key State
  const [adminAccessGranted, setAdminAccessGranted] = useState(() => {
    return localStorage.getItem('wooff_admin_access') === 'true';
  });
  const [adminSecretPin, setAdminSecretPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Tab: 'dashboard' | 'products' | 'categories' | 'orders' | 'blogs' | 'coupons' | 'faqs' | 'terms' | 'contact' | 'users'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Loading & Alert Notifications
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState({ type: '', text: '' });

  // -------------------------------------------------------------------
  // DATASETS STATE
  // -------------------------------------------------------------------
  const [analytics, setAnalytics] = useState({
    total_revenue: 12450.00,
    active_orders_count: 8,
    total_customers: 142,
    top_selling_products: [],
  });

  const [products, setProducts] = useState([
    {
      id: 1,
      title: "Natural Bubblegum Blast Prebiotic Toothpaste",
      slug: "natural-bubblegum-blast",
      sku: "WF-BB-01",
      category_name: "Prebiotic Toothpaste",
      category_id: 1,
      price: "299.00",
      final_price: "249.00",
      stock: 35,
      primary_image: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=300&q=80",
      description: "100% enamel safe prebiotic kids toothpaste.",
    },
    {
      id: 2,
      title: "Wild Strawberry Smiles Kids Gel",
      slug: "wild-strawberry-smiles",
      sku: "WF-SS-02",
      category_name: "Prebiotic Toothpaste",
      category_id: 1,
      price: "349.00",
      final_price: "299.00",
      stock: 4, // Low stock!
      primary_image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=300&q=80",
      description: "Delicious natural strawberry flavor with xylitol.",
    },
    {
      id: 3,
      title: "Super Minty Shield Prebiotic Care",
      slug: "super-minty-shield",
      sku: "WF-MS-03",
      category_name: "Oral Care",
      category_id: 2,
      price: "279.00",
      final_price: "239.00",
      stock: 18,
      primary_image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
      description: "Gentle minty freshness for older kids.",
    }
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: "Prebiotic Toothpaste", slug: "prebiotic-toothpaste", description: "100% enamel safe prebiotic gels" },
    { id: 2, name: "Oral Care Kits", slug: "oral-care-kits", description: "Complete oral health bundles for kids" },
    { id: 3, name: "Eco Toothbrushes", slug: "eco-toothbrushes", description: "Ultra soft bamboo & silicone brushes" }
  ]);

  const [orders, setOrders] = useState([
    { id: "ORD-1092", customer_name: "Sarah Jenkins", phone: "+91 9876543210", total_amount: "498.00", payment_status: "paid", order_status: "processing", created_at: "2026-09-21" },
    { id: "ORD-1091", customer_name: "Alex Morgan", phone: "+91 9812345678", total_amount: "249.00", payment_status: "paid", order_status: "shipped", created_at: "2026-09-20" },
    { id: "ORD-1090", customer_name: "Michael Chang", phone: "+91 9765432109", total_amount: "747.00", payment_status: "pending", order_status: "pending", created_at: "2026-09-20" }
  ]);

  const [blogsList, setBlogsList] = useState([
    {
      id: 1,
      title: "Why Prebiotics Are Revolutionary for Kids' Dental Microbiome",
      slug: "why-prebiotics-for-kids",
      author: "Dr. Elena Vance",
      content: "Prebiotics nourish friendly oral bacteria, keeping cavities and bad breath naturally at bay without harsh chemicals.",
      image_url: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=300&q=80",
      created_at: "2026-09-18"
    },
    {
      id: 2,
      title: "5 Fun Ways to Make Brushing Time Enjoyable for Toddlers",
      slug: "fun-brushing-tips-toddlers",
      author: "Wooff Smiles Team",
      content: "Turn 2 minutes of brushing into a fun daily adventure with reward charts and delicious natural flavors.",
      image_url: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=300&q=80",
      created_at: "2026-09-10"
    }
  ]);

  const [coupons, setCoupons] = useState([
    { id: 1, code: "WOOFFKIDS20", discount_percent: 20, expiry_date: "2026-12-31", is_active: true },
    { id: 2, code: "SMILE10", discount_percent: 10, expiry_date: "2026-10-15", is_active: true }
  ]);

  const [faqsList, setFaqsList] = useState([
    { id: 1, question: "Is Wooff toothpaste safe if swallowed by toddlers?", answer: "Yes! Wooff is 100% natural, fluoride-free, and safe if swallowed in small quantities.", display_order: 1 },
    { id: 2, question: "What are prebiotics in toothpaste?", answer: "Prebiotics are natural plant fibers that feed good oral bacteria while inhibiting harmful cavity-causing bacteria.", display_order: 2 },
    { id: 3, question: "What age range is Wooff designed for?", answer: "Wooff is formulated specifically for kids aged 6 months to 12 years.", display_order: 3 }
  ]);

  const [termsData, setTermsData] = useState({
    title: "Terms & Conditions",
    content: "Welcome to Wooff Kids! By accessing or using our website, purchasing our prebiotic toothpastes, or subscribing to our products, you agree to be bound by these Terms & Conditions. All products are formulated for kids' oral hygiene. Orders are shipped within 2-4 business days.",
    updated_at: "2026-09-21"
  });

  const [contactMessages, setContactMessages] = useState([
    { id: 1, name: "Priya Sharma", email: "priya@example.com", phone_number: "+91 98765 11111", subject: "Subscription Inquiry", message: "Is the bubblegum flavor safe for toddlers aged 3?", created_at: "2026-09-21", status: "unread" },
    { id: 2, name: "David Miller", email: "david@example.com", phone_number: "+91 98765 22222", subject: "Bulk Order Discount", message: "Do you offer wholesale discounts for pediatric dental clinics?", created_at: "2026-09-19", status: "read" }
  ]);

  const [usersList, setUsersList] = useState([
    { id: 1, username: "Sarah Jenkins", phone_number: "+919876543210", childName: "Leo", role: "user", created_at: "2026-09-15" },
    { id: 2, username: "Admin Superuser", phone_number: "+919999999999", childName: "Maya", role: "admin", created_at: "2026-09-01" }
  ]);

  // -------------------------------------------------------------------
  // MODAL & FORM STATES FOR FULL CRUD
  // -------------------------------------------------------------------
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '', category_id: 1, price: '', final_price: '', stock: '', sku: '', primary_image: '', description: '', is_bestseller: false,
  });

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
  const [couponForm, setCouponForm] = useState({ code: '', discount_percent: 15, expiry_date: '', is_active: true });

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

  // Fetch Live Analytics & Data from Backend APIs on Mount
  useEffect(() => {
    if (!adminAccessGranted) return;

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // Analytics
        const analyticsRes = await fetch(API_ENDPOINTS.ADMIN.ANALYTICS);
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          if (data.analytics) setAnalytics(data.analytics);
        }
        // Products
        const productsRes = await fetch(API_ENDPOINTS.PRODUCTS);
        if (productsRes.ok) {
          const pData = await productsRes.json();
          const list = Array.isArray(pData) ? pData : pData?.products || [];
          if (Array.isArray(list)) setProducts(list);
        }
        // Categories
        const categoriesRes = await fetch(API_ENDPOINTS.CATEGORIES);
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          const list = Array.isArray(catData) ? catData : catData?.categories || [];
          if (Array.isArray(list)) setCategories(list);
        }
        // Video Reels
        const reelsRes = await fetch('/api/videos');
        if (reelsRes.ok) {
          const rData = await reelsRes.json();
          const list = rData?.videos || (Array.isArray(rData) ? rData : []);
          if (Array.isArray(list)) setReelsList(list);
        }
        // Testimonials
        const testimonialsRes = await fetch('/api/testimonials');
        if (testimonialsRes.ok) {
          const tData = await testimonialsRes.json();
          const list = Array.isArray(tData) ? tData : tData?.testimonials || tData?.data || [];
          if (Array.isArray(list)) setTestimonialsList(list);
        }
        // Reviews
        const reviewsRes = await fetch('/api/products/reviews/all');
        if (reviewsRes.ok) {
          const rData = await reviewsRes.json();
          if (rData.success && Array.isArray(rData.reviews)) setReviewsList(rData.reviews);
        }
        // Blogs
        const blogsRes = await fetch(API_ENDPOINTS.BLOGS);
        if (blogsRes.ok) {
          const bData = await blogsRes.json();
          const list = Array.isArray(bData) ? bData : bData?.blogs || [];
          if (Array.isArray(list)) setBlogsList(list);
        }
        // Coupons
        const couponsRes = await fetch(API_ENDPOINTS.COUPONS, {
          headers: { 'x-admin-passcode': 'admin123' },
        });
        if (couponsRes.ok) {
          const cData = await couponsRes.json();
          const list = Array.isArray(cData) ? cData : cData?.coupons || [];
          if (Array.isArray(list)) setCoupons(list);
        }
        // FAQs
        const faqsRes = await fetch(API_ENDPOINTS.FAQS);
        if (faqsRes.ok) {
          const fData = await faqsRes.json();
          const list = Array.isArray(fData) ? fData : fData?.faqs || [];
          if (Array.isArray(list)) setFaqsList(list);
        }
        // Terms
        const termsRes = await fetch(API_ENDPOINTS.TERMS);
        if (termsRes.ok) {
          const tData = await termsRes.json();
          if (tData?.terms) setTermsData(tData.terms);
        }
      } catch (err) {
        console.warn('Backend API note: Synchronized with local state.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [adminAccessGranted]);

  // Image Upload Handler (.jpg, .png, .jpeg, .webp only)
  const handleImageFileUpload = async (e, targetFormSetter) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExtensions = /\.(jpg|jpeg|png|webp)$/i;

    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      showToast('danger', 'Invalid file format! Only JPG, JPEG, PNG, and WEBP image files are allowed.');
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.url) {
        targetFormSetter((prev) => ({ ...prev, primary_image: data.url, image_url: data.url }));
        showToast('success', `Uploaded "${file.name}" successfully!`);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          targetFormSetter((prev) => ({ ...prev, primary_image: reader.result, image_url: reader.result }));
          showToast('success', `Loaded "${file.name}"`);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        targetFormSetter((prev) => ({ ...prev, primary_image: reader.result, image_url: reader.result }));
        showToast('success', `Loaded "${file.name}"`);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Generic File Upload Handler for custom fields (e.g. author_avatar)
  const handleGenericFileUpload = async (e, fieldName, targetFormSetter) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExtensions = /\.(jpg|jpeg|png|webp)$/i;

    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      showToast('danger', 'Invalid file format! Only JPG, JPEG, PNG, and WEBP image files are allowed.');
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.url) {
        targetFormSetter((prev) => ({ ...prev, [fieldName]: data.url }));
        showToast('success', `Uploaded "${file.name}" successfully!`);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          targetFormSetter((prev) => ({ ...prev, [fieldName]: reader.result }));
          showToast('success', `Loaded "${file.name}"`);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        targetFormSetter((prev) => ({ ...prev, [fieldName]: reader.result }));
        showToast('info', `Loaded "${file.name}" locally`);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Admin Key Unlock
  const handleAdminKeyLogin = (e) => {
    e.preventDefault();
    setPinError('');

    if (adminSecretPin.trim() === 'admin123' || (user && user.role === 'admin')) {
      localStorage.setItem('wooff_admin_access', 'true');
      setAdminAccessGranted(true);
      showToast('success', 'Admin Control Center Unlocked!');
    } else {
      setPinError('Invalid Admin Passcode. Hint: Use demo passcode "admin123"');
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('wooff_admin_access');
    setAdminAccessGranted(false);
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
          'x-admin-passcode': 'admin123',
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
      } else {
        if (isEdit) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? { ...c, ...categoryForm } : c))
          );
        } else {
          const newCat = {
            id: Date.now(),
            ...categoryForm,
            slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          };
          setCategories((prev) => [...prev, newCat]);
        }
      }
    } catch (err) {
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...categoryForm } : c))
        );
      } else {
        const newCat = {
          id: Date.now(),
          ...categoryForm,
          slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        };
        setCategories((prev) => [...prev, newCat]);
      }
    }

    showToast('success', `Category "${categoryForm.name}" saved successfully!`);
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': 'admin123',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn('API delete category note: update local state', err);
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('success', `Category "${name}" deleted.`);
  };

  // ===================================================================
  // 1. PRODUCTS CRUD HANDLERS
  // ===================================================================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      category_id: categories[0]?.id || 1,
      price: '',
      final_price: '',
      stock: 25,
      sku: `WF-PROD-${Math.floor(100 + Math.random() * 900)}`,
      primary_image: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=300&q=80',
      description: '100% Prebiotic & Natural Kids Toothpaste',
      is_bestseller: false,
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      category_id: prod.category_id || 1,
      price: prod.price,
      final_price: prod.final_price,
      stock: prod.stock,
      sku: prod.sku,
      primary_image: prod.primary_image,
      description: prod.description || '',
      is_bestseller: !!prod.is_bestseller,
    });
    setShowProductModal(true);
  };

  const handleToggleBestseller = async (id, currentVal) => {
    const newVal = !currentVal;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': 'admin123',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ is_bestseller: newVal }),
      });
    } catch (err) {
      console.warn('Backend update note: Syncing local state', err);
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_bestseller: newVal } : p))
    );
    showToast('success', `Product Bestseller status updated!`);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price) {
      showToast('danger', 'Please enter title and price.');
      return;
    }

    try {
      const isEdit = !!editingProduct;
      const url = isEdit
        ? `${API_ENDPOINTS.PRODUCTS}/${editingProduct.id}`
        : API_ENDPOINTS.PRODUCTS;
      const method = isEdit ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': 'admin123',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(productForm),
      });

      if (res.ok) {
        const data = await res.json();
        const savedProd = data.product || data;
        if (isEdit) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? { ...p, ...savedProd } : p))
          );
        } else {
          setProducts((prev) => [savedProd, ...prev]);
        }
      } else {
        // Fallback local state update
        if (isEdit) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editingProduct.id
                ? { ...p, ...productForm, category_name: categories.find((c) => c.id == productForm.category_id)?.name || 'General' }
                : p
            )
          );
        } else {
          const newProd = {
            id: Date.now(),
            ...productForm,
            slug: productForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category_name: categories.find((c) => c.id == productForm.category_id)?.name || 'General',
          };
          setProducts((prev) => [newProd, ...prev]);
        }
      }
    } catch (err) {
      // Local fallback
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productForm } : p))
        );
      } else {
        const newProd = { id: Date.now(), ...productForm };
        setProducts((prev) => [newProd, ...prev]);
      }
    }

    showToast('success', `Product "${productForm.title}" saved successfully!`);
    setShowProductModal(false);
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete product "${title}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': 'admin123',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn('API delete note: update local state', err);
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('success', `Product "${title}" deleted.`);
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
          'x-admin-passcode': 'admin123',
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
      } else {
        if (isEdit) {
          setBlogsList((prev) =>
            prev.map((b) => (b.id === editingBlog.id ? { ...b, ...payload } : b))
          );
        } else {
          const newBlog = {
            id: Date.now(),
            ...payload,
            created_at: new Date().toISOString().split('T')[0],
          };
          setBlogsList((prev) => [newBlog, ...prev]);
        }
      }
    } catch (err) {
      if (editingBlog) {
        setBlogsList((prev) =>
          prev.map((b) => (b.id === editingBlog.id ? { ...b, ...payload } : b))
        );
      } else {
        const newBlog = { id: Date.now(), ...payload, created_at: new Date().toISOString().split('T')[0] };
        setBlogsList((prev) => [newBlog, ...prev]);
      }
    }

    showToast('success', `Blog article "${blogForm.title}" saved!`);
    setShowBlogModal(false);
  };

  const handleDeleteBlog = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete article "${title}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.BLOGS}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': 'admin123',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn('API delete note: update local state', err);
    }
    setBlogsList((prev) => prev.filter((b) => b.id !== id));
    showToast('success', `Article "${title}" deleted.`);
  };

  // ===================================================================
  // 3. COUPONS CRUD HANDLERS
  // ===================================================================
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({ code: '', discount_percent: 20, expiry_date: '2026-12-31', is_active: true });
    setShowCouponModal(true);
  };

  const handleOpenEditCoupon = (c) => {
    setEditingCoupon(c);
    setCouponForm({ code: c.code, discount_percent: c.discount_percent, expiry_date: c.expiry_date, is_active: c.is_active });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code) return;

    try {
      const isEdit = !!editingCoupon;
      const url = isEdit ? `${API_ENDPOINTS.COUPONS}/${editingCoupon.id}` : API_ENDPOINTS.COUPONS;
      const method = isEdit ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      const payload = {
        code: couponForm.code.toUpperCase(),
        discount_type: 'percentage',
        discount_value: parseFloat(couponForm.discount_percent),
        expires_at: couponForm.expiry_date,
        is_active: couponForm.is_active,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': 'admin123',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      } else {
        if (isEdit) {
          setCoupons((prev) =>
            prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...couponForm, code: couponForm.code.toUpperCase() } : c))
          );
        } else {
          const newCoupon = { id: Date.now(), ...couponForm, code: couponForm.code.toUpperCase() };
          setCoupons((prev) => [newCoupon, ...prev]);
        }
      }
    } catch (err) {
      if (editingCoupon) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...couponForm } : c))
        );
      } else {
        const newCoupon = { id: Date.now(), ...couponForm };
        setCoupons((prev) => [newCoupon, ...prev]);
      }
    }

    showToast('success', `Coupon "${couponForm.code.toUpperCase()}" saved!`);
    setShowCouponModal(false);
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.COUPONS}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': 'admin123',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn('API delete note: update local state', err);
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('success', `Coupon "${code}" deleted.`);
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
    if (!faqForm.question || !faqForm.answer) return;

    try {
      const isEdit = !!editingFaq;
      const url = isEdit ? `${API_ENDPOINTS.FAQS}/${editingFaq.id}` : API_ENDPOINTS.FAQS;
      const method = isEdit ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': 'admin123',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      } else {
        if (isEdit) {
          setFaqsList((prev) =>
            prev.map((f) => (f.id === editingFaq.id ? { ...f, ...faqForm } : f))
          );
        } else {
          const newFaq = { id: Date.now(), ...faqForm };
          setFaqsList((prev) => [...prev, newFaq]);
        }
      }
    } catch (err) {
      if (editingFaq) {
        setFaqsList((prev) =>
          prev.map((f) => (f.id === editingFaq.id ? { ...f, ...faqForm } : f))
        );
      } else {
        const newFaq = { id: Date.now(), ...faqForm };
        setFaqsList((prev) => [...prev, newFaq]);
      }
    }

    showToast('success', 'FAQ saved successfully!');
    setShowFaqModal(false);
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ entry?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.FAQS}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': 'admin123',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn('API delete note: update local state', err);
    }
    setFaqsList((prev) => prev.filter((f) => f.id !== id));
    showToast('success', 'FAQ deleted.');
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
          'x-admin-passcode': 'admin123',
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
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, order_status: newStatus } : ord))
    );
    showToast('success', `Order ${orderId} status updated to "${newStatus.toUpperCase()}"!`);
  };


  const handleDeleteReviewInAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      const res = await fetch(`/api/products/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passcode': 'admin123' },
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
          'x-admin-passcode': 'admin123',
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

  const handleDeleteReel = async (id) => {
    if (!window.confirm('Delete this video reel?')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passcode': 'admin123' },
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
          'x-admin-passcode': 'admin123',
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

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passcode': 'admin123' },
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
  };

  // If Admin Lock Active, render Passcode Screen
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
            Enter secret Admin Passcode to access inventory, blogs, FAQs, coupons & analytics.
          </p>

          {pinError && (
            <div className="alert alert-danger py-2 small mb-3 rounded-3 fw-bold">
              {pinError}
            </div>
          )}

          <form onSubmit={handleAdminKeyLogin}>
            <div className="mb-3 text-start">
              <label className="form-label small fw-bold text-muted">Admin Secret Passcode</label>
              <input
                type="password"
                className="form-control form-control-lg rounded-3 border-2"
                placeholder="Enter passcode (Demo: admin123)"
                value={adminSecretPin}
                onChange={(e) => setAdminSecretPin(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary w-100 py-3 text-center justify-content-center fw-bold"
            >
              Unlock Control Center <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </form>

          <div className="mt-4 pt-3 border-top">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
              <i className="fa-solid fa-lightbulb me-1"></i> Demo Passcode: <strong>admin123</strong>
            </span>
          </div>
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
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fa-solid fa-users width-20"></i> Customers
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
              {activeTab === 'reels' && <><i className="fa-solid fa-video text-warning me-2"></i> Brand Video Reels Manager</>}
              {activeTab === 'testimonials' && <><i className="fa-solid fa-quote-left text-warning me-2"></i> Real Smiles & Stories Testimonials</>}
              {activeTab === 'reviews' && <><i className="fa-solid fa-star text-warning me-2"></i> Customer Reviews Management</>}
              {activeTab === 'orders' && <><i className="fa-solid fa-truck-fast text-warning me-2"></i> Customer Orders & Shipments</>}
              {activeTab === 'blogs' && <><i className="fa-solid fa-newspaper text-warning me-2"></i> Articles & Blog Posts CRUD</>}
              {activeTab === 'coupons' && <><i className="fa-solid fa-tags text-warning me-2"></i> Discount Coupons CRUD</>}
              {activeTab === 'faqs' && <><i className="fa-solid fa-circle-question text-warning me-2"></i> Frequently Asked Questions CRUD</>}
              {activeTab === 'terms' && <><i className="fa-solid fa-file-contract text-warning me-2"></i> Terms & Conditions Policies</>}
              {activeTab === 'contact' && <><i className="fa-solid fa-comments text-warning me-2"></i> Support Inbox</>}
              {activeTab === 'users' && <><i className="fa-solid fa-users text-warning me-2"></i> Registered Customers</>}
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
                  <h3 className="stat-value">₹{analytics.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                  <div className="stat-subtext">↑ 18% this month</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-wrapper"><i className="fa-solid fa-box"></i></div>
                <div className="stat-details">
                  <div className="stat-label">Active Orders</div>
                  <h3 className="stat-value">{orders.length} Orders</h3>
                  <div className="stat-subtext">8 Ready for shipment</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-wrapper"><i className="fa-solid fa-users"></i></div>
                <div className="stat-details">
                  <div className="stat-label">Registered Customers</div>
                  <h3 className="stat-value">{analytics.total_customers || usersList.length} Customers</h3>
                  <div className="stat-subtext">Active customer accounts</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon-wrapper" style={{ background: '#FCE8E6', color: '#C5221F' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div className="stat-details">
                  <div className="stat-label">Low Stock Warning</div>
                  <h3 className="stat-value" style={{ color: '#C5221F' }}>
                    {products.filter((p) => p.stock <= 10).length} Items
                  </h3>
                  <div className="stat-subtext text-danger">Stock below 10 units</div>
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
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="fw-bold">{ord.id}</td>
                        <td>{ord.customer_name}</td>
                        <td>{ord.phone}</td>
                        <td className="fw-bold">₹{ord.total_amount}</td>
                        <td><span className={`admin-badge badge-${ord.payment_status}`}>{ord.payment_status.toUpperCase()}</span></td>
                        <td><span className={`admin-badge badge-${ord.order_status}`}>{ord.order_status.toUpperCase()}</span></td>
                      </tr>
                    ))}
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
                    <th>Category</th>
                    <th>Price</th>
                    <th>Discount Price</th>
                    <th>Stock</th>
                    <th>Bestseller Status</th>
                    <th>Actions (Edit / Delete)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <img src={prod.primary_image} alt={prod.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px' }} />
                      </td>
                      <td>
                        <div className="fw-bold">{prod.title}</div>
                        <div className="small text-muted">SKU: {prod.sku}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{prod.category_name}</span></td>
                      <td>₹{prod.price}</td>
                      <td className="fw-bold text-success">₹{prod.final_price}</td>
                      <td><span className={`admin-badge ${prod.stock <= 10 ? 'badge-danger' : 'badge-success'}`}>{prod.stock} units</span></td>
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
                  ))}
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
            TAB 4: ORDERS MANAGER
           ------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="admin-card-box">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Customer Orders Management</h3>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Total</th>
                    <th>Payment Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="fw-bold">{ord.id}</td>
                      <td>{ord.customer_name}</td>
                      <td>{ord.phone}</td>
                      <td className="fw-bold">₹{ord.total_amount}</td>
                      <td><span className={`admin-badge badge-${ord.payment_status}`}>{ord.payment_status.toUpperCase()}</span></td>
                      <td>
                        <select className="form-select form-select-sm fw-bold border-2" value={ord.order_status} onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                          src={blog.image_url || '/assets/tooth_paste.png'} 
                          alt={blog.title} 
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px' }} 
                          onError={(e) => { e.currentTarget.src = '/assets/tooth_paste.png'; }}
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
            <div className="admin-card-header">
              <h3 className="admin-card-title">Promotional Discount Coupons ({coupons.length})</h3>
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAddCoupon}>
                <i className="fa-solid fa-plus me-1"></i> Create Coupon
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Promo Code</th>
                    <th>Discount %</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions (Edit / Delete)</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td><code className="fw-bold fs-6">{c.code}</code></td>
                      <td className="fw-bold text-success">{c.discount_percent}% OFF</td>
                      <td>{c.expiry_date}</td>
                      <td>
                        <span className={`admin-badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleOpenEditCoupon(c)}>
                            <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                          </button>
                          <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteCoupon(c.id, c.code)}>
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
            <div className="admin-card-header">
              <h3 className="admin-card-title">Registered Customers ({usersList.length})</h3>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Phone Number</th>
                    <th>Child's Name</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr.id}>
                      <td className="fw-bold">{usr.username}</td>
                      <td>{usr.phone_number || 'N/A'}</td>
                      <td><i className="fa-solid fa-child me-1 text-warning"></i> {usr.childName || 'N/A'}</td>
                      <td><span className={`admin-badge ${usr.role === 'admin' ? 'badge-paid' : 'badge-pending'}`}>{usr.role.toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <p className="text-muted small mb-0">Manage video reels shown in "See It In Action" section on Home page and link each reel to a product.</p>
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
                <p className="text-muted small mb-0">Manage customer stories, dentist reviews, and quotes displayed in "Real Smiles & Stories" section on Home page.</p>
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
          COUPON ADD/EDIT MODAL
         ------------------------------------------------------------- */}
      {showCouponModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCouponModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="fw-bold mb-3" style={{ color: '#4B2E1E' }}>
              {editingCoupon ? 'Edit Coupon' : 'Create Discount Coupon'}
            </h3>

            <form onSubmit={handleSaveCoupon}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Coupon Code</label>
                <input
                  type="text"
                  className="form-control text-uppercase fw-bold"
                  placeholder="e.g. SMILE25"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Discount %</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="20"
                    value={couponForm.discount_percent}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_percent: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Expiry Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={couponForm.expiry_date}
                    onChange={(e) => setCouponForm({ ...couponForm, expiry_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setShowCouponModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingCoupon ? 'Save Coupon' : 'Create Coupon'}</button>
              </div>
            </form>
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

    </div>
  );
}
