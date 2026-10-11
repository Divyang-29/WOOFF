-- Migration: 013_shiprocket_fulfillment.sql
-- Description: Add Shiprocket fulfillment tracking columns to orders table and physical dimension/weight columns to products table

-- 1. Add Shiprocket and customer_email columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_awb_code VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_courier_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_status VARCHAR(50) DEFAULT 'unfulfilled';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_response JSONB DEFAULT '{}'::jsonb;

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id ON orders (shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_status ON orders (shiprocket_status);

-- 2. Add product dimensions, weight, and HSN code to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(6, 3) DEFAULT 0.150;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length_cm NUMERIC(6, 2) DEFAULT 15.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS breadth_cm NUMERIC(6, 2) DEFAULT 5.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height_cm NUMERIC(6, 2) DEFAULT 4.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20) DEFAULT '33061020';

-- Update existing products to ensure default packaging specs
UPDATE products 
SET 
  weight_kg = COALESCE(weight_kg, 0.150),
  length_cm = COALESCE(length_cm, 15.00),
  breadth_cm = COALESCE(breadth_cm, 5.00),
  height_cm = COALESCE(height_cm, 4.00),
  hsn_code = COALESCE(hsn_code, '33061020')
WHERE weight_kg IS NULL OR hsn_code IS NULL;
