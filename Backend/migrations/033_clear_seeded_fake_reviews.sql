-- Migration 033: Remove seeded fake reviews and reset product ratings to real zero state
DELETE FROM product_reviews;

UPDATE products 
SET rating_avg = 0.00,
    review_count = 0,
    updated_at = NOW();
