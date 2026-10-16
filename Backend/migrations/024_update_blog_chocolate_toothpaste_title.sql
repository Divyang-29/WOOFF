-- Migration 024: Update chocolate-toothpaste blog title and content
UPDATE blogs 
SET title = 'Chocolate Toothpaste for Kids: Is It Safe & Does It Work?',
    content = 'Chocolate toothpaste is toothpaste flavoured to taste of chocolate instead of mint, made mainly for children who resist brushing. It contains no chocolate and, in most cases, no sugar. The taste comes from cocoa extract or flavouring, and the sweetness comes from non-sugar sweeteners. Does it work? It cleans teeth like any other toothpaste, and a flavour your child enjoys can make twice-daily brushing easier.'
WHERE slug = 'chocolate-toothpaste';
