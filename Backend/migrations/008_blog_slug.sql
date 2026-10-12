-- Migration 008: Add slug column to blogs table and backfill seed data

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Fallback slug generation for any remaining posts
UPDATE blogs 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) 
WHERE slug IS NULL OR slug = '';

-- Ensure index for rapid lookup
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
