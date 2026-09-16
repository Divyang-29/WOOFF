-- Migration 008: Add slug column to blogs table and backfill seed data

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Backfill slugs for existing sample posts
UPDATE blogs 
SET slug = 'why-nano-hydroxyapatite' 
WHERE title ILIKE '%Nano-Hydroxyapatite%' AND (slug IS NULL OR slug = '');

UPDATE blogs 
SET slug = 'science-of-theobromine' 
WHERE title ILIKE '%Theobromine%' AND (slug IS NULL OR slug = '');

UPDATE blogs 
SET slug = 'oral-microbiome-prebiotics' 
WHERE title ILIKE '%Oral Microbiome%' AND (slug IS NULL OR slug = '');

UPDATE blogs 
SET slug = 'ending-brushing-battles' 
WHERE title ILIKE '%Brushing Battles%' AND (slug IS NULL OR slug = '');

-- Fallback slug generation for any remaining posts
UPDATE blogs 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) 
WHERE slug IS NULL OR slug = '';

-- Ensure index for rapid lookup
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
