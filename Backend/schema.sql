-- Reset and initialize complete database schema
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS refund_policies CASCADE;
DROP TABLE IF EXISTS shipping_policies CASCADE;
DROP TABLE IF EXISTS video_reels CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS terms_and_conditions CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS privacy_policies CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS product_faqs CASCADE;
DROP TABLE IF EXISTS product_ingredients CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
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
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Key Ingredients Table
CREATE TABLE product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  sub_title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500)
);

-- Product FAQs Table
CREATE TABLE product_faqs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

-- Customer Reviews Table
CREATE TABLE product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Privacy Policy Table
CREATE TABLE privacy_policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Privacy Policy',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Us Messages Table
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) DEFAULT '',
  phone_number VARCHAR(20) DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Terms & Conditions Table
CREATE TABLE terms_and_conditions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Terms & Conditions',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials Table
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video Reels Table
CREATE TABLE video_reels (
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

-- Shipping & Delivery Policy Table
CREATE TABLE shipping_policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Shipping & Delivery Policy',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refund & Return Policy Table
CREATE TABLE refund_policies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Refund & Return Policy',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates / Badges Table
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- General FAQs Table
CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brand Benefits Table
CREATE TABLE benefits (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  desc_text VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brand Formulation Pillars Table
CREATE TABLE pillars (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  desc_text TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blogs Table
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
