-- Migration 011: Add rich editorial fields to blogs table

ALTER TABLE blogs
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Dental Health',
ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT 'OralCare, KidsWellness, Wooff',
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS reading_time VARCHAR(50) DEFAULT '5 min read',
ADD COLUMN IF NOT EXISTS author_role VARCHAR(255) DEFAULT 'Pediatric Dental Specialist',
ADD COLUMN IF NOT EXISTS author_avatar VARCHAR(500) DEFAULT '/assets/wooff-logo.png',
ADD COLUMN IF NOT EXISTS author_bio TEXT,
ADD COLUMN IF NOT EXISTS image_caption TEXT,
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS conclusion_takeaways JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
