import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Banner from '../../components/Banner/Banner';
import './Products.css';

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.message || 'Failed to load products');
        }
      } catch (err) {
        setError('Error connecting to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper to render simple star rating
  const renderStars = (rating) => {
    const validRating = Number(rating) || 0;
    const fullStars = Math.round(validRating);
    const emptyStars = 5 - fullStars;
    return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
  };

  return (
    <div className="products-page-wrapper">
      <Banner breadcrumb="HOME / SHOP" title="All Products" />

      <div className="products-container">
        {loading && <div className="status-message">Loading products...</div>}
        {error && <div className="status-message error">{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div className="status-message">No products found.</div>
        )}

        <div className="products-grid">
          {products.map((product) => {
            // Calculate discount percentage
            const hasDiscount = product.price > product.final_price;
            const discountPercent = hasDiscount
              ? Math.round(((product.price - product.final_price) / product.price) * 100)
              : 0;

            return (
              <div className="wooff-clean-card" key={product.id}>

                {/* Image Section */}
                <div className="card-image-wrapper">
                  <Link to={`/product/${product.slug}`}>
                    <img src={product.primary_image} alt={product.title} />
                  </Link>
                  {hasDiscount && (
                    <span className="discount-badge">{discountPercent}% OFF</span>
                  )}
                </div>

                {/* Content Section */}
                <div className="card-content">
                  <Link to={`/product/${product.slug}`} className="card-title-link">
                    <h3 className="card-title">{product.title}</h3>
                  </Link>

                  {/* Trust: Dynamic Ratings */}
                  {product.review_count > 0 ? (
                    <div className="card-rating">
                      <span className="stars">{renderStars(product.rating_avg)}</span>
                      <span className="review-count">({product.review_count})</span>
                    </div>
                  ) : (
                    <div className="card-rating">
                      <span className="no-reviews-badge">New Arrival</span>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="card-pricing">
                    <span className="card-final-price">₹{product.final_price}</span>
                    {hasDiscount && (
                      <div className="mrp-block">
                        <span className="card-original-price">M.R.P: ₹{product.price}</span>
                        <span className="card-discount-text">({discountPercent}% off)</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <button
                    className="card-add-to-cart-btn"
                    onClick={() => addToCart(product, 1)}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
