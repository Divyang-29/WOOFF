-- Migration: 012_shiprocket_loyalty.sql
-- Description: Create loyalty accounts and points blocking tables for Shiprocket Loyalty integration

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id SERIAL PRIMARY KEY,
  mobile_number VARCHAR(30) UNIQUE NOT NULL,
  points INTEGER DEFAULT 500 NOT NULL CHECK (points >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_blocks (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(30) NOT NULL,
  points_blocked INTEGER NOT NULL,
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(30) DEFAULT 'blocked' CHECK (status IN ('blocked', 'redeemed', 'unblocked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_mobile ON loyalty_accounts (mobile_number);
CREATE INDEX IF NOT EXISTS idx_loyalty_blocks_order_id ON loyalty_blocks (order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_blocks_mobile ON loyalty_blocks (mobile_number);
