-- Migration 006: Create and update tables for static data migration (faqs, benefits, pillars, video_reels)

-- 1. General FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Testimonials Table (ensure columns and constraints)
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Video Reels Table (ensure all display columns exist)
CREATE TABLE IF NOT EXISTS video_reels (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  video_url VARCHAR(500) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_photo VARCHAR(500) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  caption TEXT,
  author VARCHAR(255),
  rating VARCHAR(50) DEFAULT '5.0 ★',
  reviews_count VARCHAR(50) DEFAULT '1k+',
  product_slug VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE video_reels ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE video_reels ADD COLUMN IF NOT EXISTS author VARCHAR(255);
ALTER TABLE video_reels ADD COLUMN IF NOT EXISTS rating VARCHAR(50) DEFAULT '5.0 ★';
ALTER TABLE video_reels ADD COLUMN IF NOT EXISTS reviews_count VARCHAR(50) DEFAULT '1k+';
ALTER TABLE video_reels ADD COLUMN IF NOT EXISTS product_slug VARCHAR(255);

-- 4. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Brand Benefits Table
CREATE TABLE IF NOT EXISTS benefits (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  desc_text VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Brand Formulation Pillars Table
CREATE TABLE IF NOT EXISTS pillars (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  desc_text TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
