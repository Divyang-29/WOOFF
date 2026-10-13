-- Migration 021: Update single tube and pack of 2 product titles for clean SEO & user experience
UPDATE products 
SET title = 'Wooff Kids Chocolate Flavour Toothpaste, 50 g (Above 2 Years)' 
WHERE id = 9 
   OR sku = 'WOOFF-KIDS-CHOCO-50G-P1' 
   OR slug = 'choco-toothpaste';

UPDATE products 
SET title = 'Wooff Kids Chocolate Flavour Toothpaste, Pack of 2 (50 g each)' 
WHERE id = 10 
   OR sku = 'WOOFF-KIDS-CHOCO-50G-P2' 
   OR slug = 'choco-toothpaste-pack-of-2';
