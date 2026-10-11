-- Migration: 014_promotions_and_abandoned_carts.sql
-- Description: Phase 3 Promotions Engine (coupons) and Abandoned Cart Recovery

-- 1. Ensure coupons table has all Phase 3 required fields
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC(10,2) NOT NULL,
    min_order_value NUMERIC(10,2) DEFAULT 0.00,
    min_cart_value NUMERIC(10,2) DEFAULT 0.00,
    max_discount_amount NUMERIC(10,2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure newly required columns exist if coupons was created earlier
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS min_order_value NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Backfill min_order_value from min_cart_value if missing
UPDATE coupons 
SET min_order_value = COALESCE(min_cart_value, 0.00) 
WHERE min_order_value IS NULL OR min_order_value = 0.00;

-- Backfill valid_until from expires_at if missing
UPDATE coupons 
SET valid_until = expires_at 
WHERE valid_until IS NULL AND expires_at IS NOT NULL;

-- Index on coupon code and active status
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- 2. Create abandoned_carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    items JSONB NOT NULL DEFAULT '[]',
    total_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    recovery_status VARCHAR(50) NOT NULL DEFAULT 'abandoned' CHECK (recovery_status IN ('abandoned', 'recovered', 'contacted', 'cancelled')),
    checkout_step VARCHAR(50) DEFAULT 'shipping_details',
    recovery_notes TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast filtering and recovery sorting
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_phone ON abandoned_carts(phone);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_total_value ON abandoned_carts(total_value DESC);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON abandoned_carts(recovery_status);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created ON abandoned_carts(created_at DESC);
