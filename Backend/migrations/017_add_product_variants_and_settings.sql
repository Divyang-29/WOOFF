-- Migration: 017_add_product_variants_and_settings.sql
-- Description: Add variants, low_stock_threshold, bundle_type, and shipping dimensions to products table

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hero_image VARCHAR(1000);
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS bundle_type VARCHAR(50) DEFAULT 'single';
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg NUMERIC DEFAULT 0.1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length_cm NUMERIC DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS breadth_cm NUMERIC DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height_cm NUMERIC DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(50);
