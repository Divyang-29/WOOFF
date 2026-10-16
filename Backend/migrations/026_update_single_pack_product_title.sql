-- Migration 026: Update single pack product title to Wooff Kids Choco Toothpaste 50g (Above 2 Years)
UPDATE products 
SET title = 'Wooff Kids Choco Toothpaste 50g (Above 2 Years)'
WHERE slug = 'choco-toothpaste';
