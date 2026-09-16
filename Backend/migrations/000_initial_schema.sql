-- Migration: 000_initial_schema.sql
-- Description: Non-destructive base schema setup with IF NOT EXISTS for all core tables

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  role VARCHAR(20) DEFAULT 'user',
  birthdate DATE,
  gender VARCHAR(20),
  otp VARCHAR(10),
  otp_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  final_price NUMERIC(10, 2) NOT NULL,
  primary_image VARCHAR(500) NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE NOT NULL,
  estimated_delivery VARCHAR(100) DEFAULT '2-4 business days',
  rating_avg NUMERIC(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Key Ingredients Table
CREATE TABLE IF NOT EXISTS product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  sub_title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500)
);

-- Product FAQs Table
CREATE TABLE IF NOT EXISTS product_faqs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

-- Customer Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Privacy Policy Table
CREATE TABLE IF NOT EXISTS privacy_policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Privacy Policy',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Us Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) DEFAULT '',
  phone_number VARCHAR(20) DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Terms & Conditions Table
CREATE TABLE IF NOT EXISTS terms_and_conditions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Terms & Conditions',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video Reels Table
CREATE TABLE IF NOT EXISTS video_reels (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  video_url VARCHAR(500) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_photo VARCHAR(500) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipping & Delivery Policy Table
CREATE TABLE IF NOT EXISTS shipping_policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Shipping & Delivery Policy',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refund & Return Policy Table
CREATE TABLE IF NOT EXISTS refund_policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Refund & Return Policy',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates / Badges Table
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
