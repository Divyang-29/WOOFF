-- Migration 019: Update pack of 2 product slug to clean URL /product/choco-toothpaste-pack-of-2
UPDATE products 
SET slug = 'choco-toothpaste-pack-of-2' 
WHERE id = 10 
   OR sku = 'WOOFF-KIDS-CHOCO-50G-P2' 
   OR slug = 'wooff-kids-chocolate-flavour-toothpaste-50g-pack-of-2-chocolate-toothpaste-for-kids-above-2-years';
