-- Migration: 004_performance_indexes.sql
-- Description: Adds performance indexes to product-related foreign keys for optimized queries

-- 1. Indexes for product sub-tables
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product_id ON product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_faqs_product_id ON product_faqs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);

-- 2. Indexes for media and certificate product relations
CREATE INDEX IF NOT EXISTS idx_certificates_product_id ON certificates(product_id);
CREATE INDEX IF NOT EXISTS idx_video_reels_product_id ON video_reels(product_id);

-- 3. Indexes for customer review sorting by creation date
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);
