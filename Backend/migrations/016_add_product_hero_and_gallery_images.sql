-- Migration: 016_add_product_hero_and_gallery_images.sql
-- Description: Add hero_image and gallery_images columns to products table

ALTER TABLE products ADD COLUMN IF NOT EXISTS hero_image VARCHAR(1000);
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Backfill from primary_image and images if already populated
UPDATE products 
SET hero_image = primary_image 
WHERE hero_image IS NULL AND primary_image IS NOT NULL;

UPDATE products 
SET gallery_images = COALESCE(images, '[]'::jsonb) 
WHERE (gallery_images IS NULL OR gallery_images = '[]'::jsonb) AND images IS NOT NULL;
