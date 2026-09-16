-- Migration: 001_commerce_foundation.sql
-- Description: Non-destructive database foundation for Wooff e-commerce system
-- Creates tables: user_addresses, cart_items, orders, order_items, payment_transactions

-- 1. User Saved Addresses Table
CREATE TABLE IF NOT EXISTS user_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL CHECK (postal_code ~ '^[1-9][0-9]{5}$'),
  landmark VARCHAR(255),
  address_type VARCHAR(20) DEFAULT 'Home' CHECK (address_type IN ('Home', 'Work', 'Other')),
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partial unique index ensuring a user has at most ONE default address
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_addresses_one_default_per_user
ON user_addresses (user_id)
WHERE is_default = true;

-- Index on user_id for fast address lookups
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses (user_id);


-- 2. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_product_cart UNIQUE (user_id, product_id)
);

-- Indexes for cart items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items (product_id);


-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (shipping_amount >= 0),
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')
  ),
  order_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (
    order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
  ),
  shipping_address_line_1 VARCHAR(255) NOT NULL,
  shipping_address_line_2 VARCHAR(255),
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20) NOT NULL,
  shipping_landmark VARCHAR(255),
  shipping_address_type VARCHAR(20) DEFAULT 'Home',
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for orders querying
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);


-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for order items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);


-- 5. Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_provider VARCHAR(50) NOT NULL DEFAULT 'razorpay',
  provider_order_id VARCHAR(255),
  provider_payment_id VARCHAR(255),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(30) NOT NULL DEFAULT 'created' CHECK (
    status IN ('created', 'pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded')
  ),
  payment_method VARCHAR(50),
  failure_code VARCHAR(100),
  failure_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions (order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_order_id ON payment_transactions (provider_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_payment_id ON payment_transactions (provider_payment_id);
