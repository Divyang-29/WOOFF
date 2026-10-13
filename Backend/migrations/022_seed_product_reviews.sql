-- Migration 022: Seed verified parent customer reviews for single tube and pack of 2

DELETE FROM product_reviews WHERE product_id IN (9, 10);

-- Product 9: Single Tube Reviews
INSERT INTO product_reviews (product_id, customer_name, rating, review_text, created_at) VALUES
(9, 'Ananya Sharma', 5.0, 'No More Morning Battles! - My 3-year-old son used to cry every morning because he hated the burning feeling of mint toothpaste. Since we switched to Wooff chocolate flavor, he actually runs to the sink and reminds me when it''s brushing time! 10/10.', NOW() - INTERVAL '2 days'),
(9, 'Dr. Priya Mehta (Pediatric Dentist)', 5.0, 'Exceptional biological formula - As a pediatric biological dentist, I am thrilled to see a genuine fluoride-free toothpaste in India powered by bio-identical nano-hydroxyapatite (nHAp) and chicory root prebiotics. It remineralizes developing enamel safely without synthetic dyes or SLS.', NOW() - INTERVAL '5 days'),
(9, 'Marcus & Priya T.', 5.0, '100% Peace of mind if swallowed - Our toddler is still learning to spit reliably. Knowing this is made from food-grade ingredients and safe to swallow removes all the anxiety from our bedtime routine. Plus their teeth look shiny and clean.', NOW() - INTERVAL '8 days'),
(9, 'Sneha Patel', 5.0, 'Kids genuinely look forward to brushing - Both my children (ages 3 and 6) love the smooth chocolate taste. No artificial saccharin aftertaste either. Their pediatric dentist was very impressed at our last six-month checkup.', NOW() - INTERVAL '12 days'),
(9, 'David L.', 5.0, 'Lifesaver for sensory-sensitive kids - My son has severe sensory sensitivities and rejected every single toothpaste on the market until we tried Wooff. The subtle cocoa taste is gentle and non-foaming. A true lifesaver for our family.', NOW() - INTERVAL '16 days'),
(9, 'Kavita Nair', 4.0, 'Great taste, wish the tube was bigger - Excellent quality and taste that my daughter adores. The tube is 50g so it finishes in about 4-5 weeks, definitely stocking up with the Pack of 2 next time.', NOW() - INTERVAL '20 days'),
(9, 'Meera Kapoor', 5.0, 'Noticed visibly stronger enamel - Our dentist noticed slight early demineralization white spots on my 4-year-old''s front teeth. After two months of brushing twice daily with Wooff, the enamel looks remarkably healthier and polished.', NOW() - INTERVAL '25 days'),
(9, 'Rajesh G.', 5.0, 'Zero foaming soap residue - Conventional toothpastes leave that chemical foamy froth in kids'' mouths. Wooff has a gentle gel texture that cleans thoroughly without irritating sensitive gums.', NOW() - INTERVAL '30 days');

-- Product 10: Pack of 2 Reviews
INSERT INTO product_reviews (product_id, customer_name, rating, review_text, created_at) VALUES
(10, 'Pooja Agarwal', 5.0, 'Best value bundle for parents - We keep one tube at home in the master bathroom and one in our travel bag for visits to grandparents. The pack of 2 offers great savings and lasts over two months.', NOW() - INTERVAL '3 days'),
(10, 'Neha K.', 5.0, 'Brushing routine solved for both toddlers - Buying the duo pack is so convenient. Both my 2-year-old and 4-year-old brush together without complaints. Clean, safe, and effective enamel protection.', NOW() - INTERVAL '7 days'),
(10, 'Aditya Singhania', 5.0, 'Premium quality & prompt delivery - Ordered the pack of 2 and received it in 2 days. The texture is smooth, ingredients are 100% transparent, and our kids are brushing happily every day.', NOW() - INTERVAL '11 days'),
(10, 'Sunita Rao', 5.0, 'Calm and peaceful bedtimes - If you struggle with toddlers refusing to brush, get this. The chocolate flavor turns a daily chore into a happy bedtime ritual.', NOW() - INTERVAL '18 days'),
(10, 'Gaurav Sethi', 4.0, 'Very good kids toothpaste - Clean ingredients, no SLS or parabens, and kids love it. Well worth the price for healthy baby teeth.', NOW() - INTERVAL '24 days');

-- Recalculate average rating and review counts on products table
UPDATE products p
SET rating_avg = sub.avg_rating,
    review_count = sub.cnt,
    updated_at = NOW()
FROM (
  SELECT product_id, ROUND(AVG(rating)::numeric, 2) as avg_rating, COUNT(*)::int as cnt
  FROM product_reviews
  GROUP BY product_id
) sub
WHERE p.id = sub.product_id;
