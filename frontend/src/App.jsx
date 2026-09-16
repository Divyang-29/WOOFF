import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import Login from './pages/Login/Login';
import ContactUs from './pages/ContactUs/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions/TermsAndConditions';
import FAQ from './pages/FAQ/FAQ';
import ReturnPolicy from './pages/ReturnPolicy/ReturnPolicy';
import About from './pages/About/About';
import Blog from './pages/Blog/Blog';
import SingleBlog from './pages/Blog/SingleBlog';
import Ingredients from './pages/Ingredients/Ingredients';
import Products from './pages/Products/Products';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/Cart/CartDrawer';

function App() {
  return (
    <CartProvider>
      <div className="d-flex flex-column min-vh-100">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/returns" element={<ReturnPolicy />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blogs" element={<Blog />} />
            <Route path="/blog/:slug" element={<SingleBlog />} />
            <Route path="/blogs/:slug" element={<SingleBlog />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/science" element={<Ingredients />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

export default App;
