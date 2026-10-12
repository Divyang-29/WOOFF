-- Migration: 018_hero_ingredients.sql
-- Description: Create hero_ingredients table and seed default formulation ingredients

CREATE TABLE IF NOT EXISTS hero_ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  sub_title VARCHAR(255) DEFAULT '',
  tag VARCHAR(100) DEFAULT '',
  description TEXT NOT NULL,
  benefits JSONB DEFAULT '[]'::jsonb,
  badge_text VARCHAR(100) DEFAULT 'Clinically Backed',
  icon_url VARCHAR(500) DEFAULT '/images/ingredients/nhap_clean.png',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed core hero ingredients if table is empty
INSERT INTO hero_ingredients (name, slug, sub_title, tag, description, benefits, badge_text, icon_url, display_order, is_active)
SELECT 
  'Nano-Hydroxyapatite', 
  'nano-hydroxyapatite', 
  'Enamel Mineral Support', 
  'Rebuilds Enamel', 
  'A biomimetic mineral that closely resembles the mineral naturally found in teeth. It helps support enamel remineralization safely without harsh chemicals or warning labels.', 
  '["Deposits calcium and phosphate ions into micro-porosities", "Rebuilds and protects tooth enamel", "100% biocompatible and safe if swallowed"]'::jsonb, 
  'Enamel Protector', 
  '/images/ingredients/nhap_clean.png', 
  1, 
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_ingredients WHERE slug = 'nano-hydroxyapatite');

INSERT INTO hero_ingredients (name, slug, sub_title, tag, description, benefits, badge_text, icon_url, display_order, is_active)
SELECT 
  'Theobromine', 
  'theobromine', 
  'Enamel Strength Support', 
  'Natural Cacao Extract', 
  'Derived from natural cacao, theobromine has been studied for its potential to support enamel remineralization and crystal growth alongside Nano-hydroxyapatite.', 
  '["Strengthens crystalline enamel structure", "Non-toxic natural cacao component", "Synergizes with Nano-Hydroxyapatite"]'::jsonb, 
  'Clinically Studied', 
  '/images/ingredients/theobromine_clean.png', 
  2, 
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_ingredients WHERE slug = 'theobromine');

INSERT INTO hero_ingredients (name, slug, sub_title, tag, description, benefits, badge_text, icon_url, display_order, is_active)
SELECT 
  'Inulin', 
  'prebiotics-inulin', 
  'Prebiotic Oral Care', 
  'Microbiome Balance', 
  'A naturally derived prebiotic included to nourish beneficial oral bacteria and support a healthy, balanced oral environment.', 
  '["Nourishes protective oral flora", "Suppresses harmful acid-producing bacteria", "Supports whole-mouth wellness"]'::jsonb, 
  'Prebiotic Care', 
  '/images/ingredients/inulin_clean.png', 
  3, 
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_ingredients WHERE slug = 'prebiotics-inulin');

INSERT INTO hero_ingredients (name, slug, sub_title, tag, description, benefits, badge_text, icon_url, display_order, is_active)
SELECT 
  'Vitamin C', 
  'vitamin-c', 
  'Antioxidant & Gum Support', 
  'Collagen Support', 
  'Vitamin C is a vital antioxidant that contributes to the health of oral tissues and supports a strong, healthy gum environment.', 
  '["Supports healthy collagen production in gums", "Potent antioxidant defence against inflammation", "Nourishes delicate oral tissues"]'::jsonb, 
  'Gum Support', 
  '/images/ingredients/vitaminc_clean.png', 
  4, 
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_ingredients WHERE slug = 'vitamin-c');

INSERT INTO hero_ingredients (name, slug, sub_title, tag, description, benefits, badge_text, icon_url, display_order, is_active)
SELECT 
  'Lactoferrin', 
  'lactoferrin', 
  'Natural Oral Defence', 
  'Salivary Protein', 
  'A naturally occurring protein found in saliva and mother’s milk, lactoferrin provides natural antimicrobial defence against unwanted mouth bacteria.', 
  '["Bio-mimetic salivary protection", "Maintains oral microbiome equilibrium", "Gentle on developing gums"]'::jsonb, 
  'Natural Defence', 
  '/images/ingredients/lactoferrin_clean.png', 
  5, 
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_ingredients WHERE slug = 'lactoferrin');

INSERT INTO hero_ingredients (name, slug, sub_title, tag, description, benefits, badge_text, icon_url, display_order, is_active)
SELECT 
  'Coenzyme Q10', 
  'coenzyme-q10', 
  'Antioxidant Gum Care', 
  'Cellular Energy', 
  'A naturally occurring cellular antioxidant widely studied in periodontal and gum tissue care for cellular vitality.', 
  '["Enhances periodontal cellular vitality", "Fights oxidative stress in gum pockets", "Promotes gum healing and resilience"]'::jsonb, 
  'Periodontal Care', 
  '/images/ingredients/coq10_clean.png', 
  6, 
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_ingredients WHERE slug = 'coenzyme-q10');

INSERT INTO hero_ingredients (name, slug, sub_title, tag, description, benefits, badge_text, icon_url, display_order, is_active)
SELECT 
  'Calcium Gluconate', 
  'calcium-gluconate', 
  'Tooth Enamel Support', 
  'Mineral Building Block', 
  'Calcium is an essential building block of tooth enamel, working synergistically with nHAp to keep growing teeth mineral-dense and resilient.', 
  '["Provides essential bio-available calcium ions", "Enhances remineralization synergy", "Gentle and non-abrasive"]'::jsonb, 
  'Essential Mineral', 
  '/images/ingredients/calcium_clean.png', 
  7, 
  true
WHERE NOT EXISTS (SELECT 1 FROM hero_ingredients WHERE slug = 'calcium-gluconate');
