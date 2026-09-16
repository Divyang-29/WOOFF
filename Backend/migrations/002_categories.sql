-- Migration: 002_categories.sql
-- Description: Non-destructive category foundation and product soft-delete columns/indexes

-- 1. Ensure Categories Table exists
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on categories slug
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 2. Add is_active column to products for soft-deletion / archiving if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- 3. Indexes for product catalog filtering, searching, and sorting
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(final_price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
