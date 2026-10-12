-- Migration 020: Update single tube product slug to clean URL /product/choco-toothpaste
UPDATE products 
SET slug = 'choco-toothpaste' 
WHERE id = 9 
   OR sku = 'WOOFF-KIDS-CHOCO-50G-P1' 
   OR slug = 'wooff-kids-chocolate-flavour-toothpaste-50g-tasty-chocolate-toothpaste-for-kids-above-2-years';
