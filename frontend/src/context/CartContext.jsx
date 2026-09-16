import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wooff_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wooff_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  // Sync with Backend API if token exists
  useEffect(() => {
    const fetchBackendCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (result.success && Array.isArray(result.cart)) {
          setCartItems(result.cart);
        }
      } catch (err) {
        console.error('Fetch backend cart error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendCart();
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = async (product, qty = 1) => {
    const quantityToAdd = Math.max(1, parseInt(qty) || 1);
    
    // Normalize product structure
    const productId = product.id || product.product_id;
    const title = product.title || product.name || 'Toothpaste Product';
    const price = parseFloat(product.final_price || product.price || 649);
    const originalPrice = parseFloat(product.price || price);
    const image = product.primary_image || product.image || '/images/hero_tubes.jpg';

    // Update local state first for instant smooth UI
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => (item.product_id || item.id) === productId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantityToAdd
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: productId,
            product_id: productId,
            title,
            final_price: price,
            price: originalPrice,
            primary_image: image,
            quantity: quantityToAdd
          }
        ];
      }
    });

    // Auto open drawer when adding to cart
    openCart();

    // Sync to backend API if user is authenticated
    const token = localStorage.getItem('token');
    if (token && productId) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: productId,
            quantity: quantityToAdd
          })
        });
      } catch (err) {
        console.error('Backend add to cart error:', err);
      }
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    const targetQty = parseInt(newQuantity);
    if (isNaN(targetQty) || targetQty <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item.id === id || item.product_id === id)
          ? { ...item, quantity: targetQty }
          : item
      )
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`/api/cart/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: targetQty })
        });
      } catch (err) {
        console.error('Backend update quantity error:', err);
      }
    }
  };

  const removeFromCart = async (id) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== id && item.product_id !== id)
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`/api/cart/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Backend remove item error:', err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('wooff_cart_items');

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Backend clear cart error:', err);
      }
    }
  };

  // Computed Values (In INR ₹)
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + (parseFloat(item.final_price || item.price || 0) * item.quantity),
    0
  );

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const freeShippingThreshold = 999;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const hasFreeShipping = cartSubtotal >= freeShippingThreshold;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        loading,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartCount,
        freeShippingThreshold,
        amountForFreeShipping,
        hasFreeShipping
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
