import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import CartDrawer from './components/Cart/CartDrawer';
import AuthModal from './components/AuthModal/AuthModal';
import CookieConsent from './components/CookieConsent/CookieConsent';
import { prefetchProducts } from './utils/productData';
import { initGlobalImagePreloader } from './utils/imagePreloader';

// Core Storefront Pages (Eagerly bundled for instant 0ms routing)
import About from './pages/About/About';
import Blog from './pages/Blog/Blog';
import SingleBlog from './pages/Blog/SingleBlog';
import Products from './pages/Products/Products';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Ingredients from './pages/Ingredients/Ingredients';
import FAQ from './pages/FAQ/FAQ';
import ContactUs from './pages/ContactUs/ContactUs';
import Careers from './pages/Careers/Careers';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions/TermsAndConditions';
import ReturnPolicy from './pages/ReturnPolicy/ReturnPolicy';
import Checkout from './pages/Checkout/Checkout';
import TrackOrder from './pages/TrackOrder/TrackOrder';
import NotFound from './pages/NotFound/NotFound';

// Lazy load secondary/auth/admin routes
const Login = lazy(() => import('./pages/Login/Login'));
const SignUp = lazy(() => import('./pages/SignUp/SignUp'));
const Account = lazy(() => import('./pages/Account/Account'));
const Admin = lazy(() => import('./pages/Admin/Admin'));

const PageLoader = () => (
  <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
    <div className="spinner-border" role="status" style={{ color: '#e58b57' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Silently prefetch products in background after initial render
    prefetchProducts();
    // Warm up image cache for all product photos, thumbnails, and key visual assets
    initGlobalImagePreloader();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login initialMode="login" />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/account" element={<Account />} />
            <Route path="/profile" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/refund-policy" element={<ReturnPolicy />} />
            <Route path="/returns" element={<ReturnPolicy />} />
            <Route path="/refunds" element={<ReturnPolicy />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blogs" element={<Blog />} />
            <Route path="/blog/:slug" element={<SingleBlog />} />
            <Route path="/blogs/:slug" element={<SingleBlog />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/Ingredients" element={<Ingredients />} />
            <Route path="/science" element={<Ingredients />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product" element={<Products />} />
            <Route path="/shop" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/career" element={<Careers />} />
            <Route path="/jobs" element={<Careers />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/track/:order_number" element={<TrackOrder />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CartDrawer />}
      {!isAdminRoute && <CookieConsent />}
      <AuthModal />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
        <Analytics />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
