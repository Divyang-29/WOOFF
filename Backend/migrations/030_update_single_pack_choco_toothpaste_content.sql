-- Migration 030: Update single pack choco-toothpaste description to match choco-toothpaste.html
UPDATE products 
SET description = 'Choco toothpaste is toothpaste with a chocolate flavour in place of mint. It cleans teeth the way any toothpaste does; the chocolate taste is there to make twice-daily brushing easier for children who find mint too strong.

Wooff Kids Choco Toothpaste is a sugar-free, fluoride-free chocolate toothpaste for children above 2 years. Its carton lists 2% nano-hydroxyapatite and 2% theobromine, and the formula also contains calcium gluconate, inulin, vitamin C, lactoferrin and coenzyme Q10.',
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'choco-toothpaste' OR id = 9;
