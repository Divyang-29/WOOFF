-- Migration 034: Update single pack product title to Choco Toothpaste
UPDATE products 
SET title = 'Choco Toothpaste'
WHERE slug = 'choco-toothpaste' OR id = 9;
