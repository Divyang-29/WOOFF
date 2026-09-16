const pool = require("../config/db");

// Get User Cart Items Joined with Products
const getUserCart = async (userId) => {
  const query = `
    SELECT 
      c.id as cart_item_id,
      c.user_id,
      c.product_id,
      c.quantity,
      c.created_at,
      c.updated_at,
      p.title as product_name,
      p.slug as product_slug,
      p.price,
      p.final_price,
      p.primary_image,
      p.stock,
      p.sku
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `;

  const result = await pool.query(query, [userId]);
  
  let subtotal = 0;
  let totalItems = 0;

  const items = result.rows.map((row) => {
    const unitPrice = parseFloat(row.final_price || row.price);
    const lineTotal = unitPrice * row.quantity;
    subtotal += lineTotal;
    totalItems += row.quantity;

    return {
      cart_item_id: row.cart_item_id,
      product_id: row.product_id,
      product_name: row.product_name,
      product_slug: row.product_slug,
      primary_image: row.primary_image,
      unit_price: unitPrice,
      original_price: parseFloat(row.price),
      quantity: row.quantity,
      line_total: lineTotal,
      stock: row.stock,
      sku: row.sku,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    total_items: totalItems,
  };
};

// Add Item to Cart (Upsert: Increment quantity on conflict)
const addToCart = async (userId, productId, quantity = 1) => {
  const query = `
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET 
      quantity = cart_items.quantity + EXCLUDED.quantity,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  const result = await pool.query(query, [userId, productId, quantity]);
  return result.rows[0];
};

// Update Cart Item Quantity
const updateCartItemQuantity = async (cartItemId, userId, quantity) => {
  const query = `
    UPDATE cart_items
    SET quantity = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND user_id = $3
    RETURNING *
  `;

  const result = await pool.query(query, [quantity, cartItemId, userId]);
  return result.rows[0];
};

// Delete Single Cart Item
const removeCartItem = async (cartItemId, userId) => {
  const query = `
    DELETE FROM cart_items
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [cartItemId, userId]);
  return result.rows[0];
};

// Clear All Cart Items for User
const clearUserCart = async (userId) => {
  const query = `
    DELETE FROM cart_items
    WHERE user_id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = {
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearUserCart,
};
