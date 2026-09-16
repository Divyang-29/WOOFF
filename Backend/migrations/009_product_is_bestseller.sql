-- Migration 009: Add is_bestseller column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;
