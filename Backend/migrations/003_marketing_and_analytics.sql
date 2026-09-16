-- Migration: 003_marketing_and_analytics.sql
-- Description: Creates coupons table, adds coupon_code to orders, and sets up indexes for analytics

-- 1. Create Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_cart_value NUMERIC(10, 2) DEFAULT 0.00 CHECK (min_cart_value >= 0),
  max_discount_amount NUMERIC(10, 2),
  is_active BOOLEAN DEFAULT true NOT NULL,
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0 NOT NULL CHECK (used_count >= 0),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

-- 2. Add coupon_code column to orders table if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);