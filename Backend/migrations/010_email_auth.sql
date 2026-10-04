-- Migration: 010_email_auth.sql
-- Description: Add email authentication columns to users table and make phone_number optional

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS child_name VARCHAR(100);
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;
