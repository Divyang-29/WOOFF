import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import CartDrawer from './components/Cart/CartDrawer';
import AuthModal from './components/AuthModal/AuthModal';
import CookieConsent from './components/CookieConsent/CookieConsent';

// Code-split routes with React.lazy to reduce initial bundle size
const Login = lazy(() => import('./pages/Login/Login'));
const SignUp = lazy(() => import('./pages/SignUp/SignUp'));
const Account = lazy(() => import('./pages/Account/Account'));
const Admin = lazy(() => import('./pages/Admin/Admin'));
const ContactUs = lazy(() => import('./pages/ContactUs/ContactUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions/TermsAndConditions'));
const FAQ = lazy(() => import('./pages/FAQ/FAQ'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy/ReturnPolicy'));
const About = lazy(() => import('./pages/About/About'));
const Blog = lazy(() => import('./pages/Blog/Blog'));
const SingleBlog = lazy(() => import('./pages/Blog/SingleBlog'));
const Ingredients = lazy(() => import('./pages/Ingredients/Ingredients'));
const Products = lazy(() => import('./pages/Products/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const TrackOrder = lazy(() => import('./pages/TrackOrder/TrackOrder'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

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
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
