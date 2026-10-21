-- Migration 029: Update chocolate-flavoured-toothpaste blog title, excerpt, content, and faqs to match new blog content
UPDATE blogs 
SET title = 'Chocolate Flavoured Toothpaste',
    excerpt = 'Discover Wooff Chocolate Flavoured Toothpaste for a fun daily brushing experience. Make oral care enjoyable for kids with a delicious chocolate taste. Shop Now!',
    content = 'Chocolate flavoured toothpaste is toothpaste that tastes of chocolate instead of mint, usually made for children who resist brushing. To choose a good one, look past the flavour and check six things on the pack: the age range, whether it contains fluoride, the active ingredient, and how much of it, the full ingredient list, whether the claims match that list, and who makes it. This guide explains each check, so you can read a label in about a minute.',
    faqs = '[
      {"q": "What is the best chocolate flavoured toothpaste for kids?", "a": "There isn''t one best choice for every child. A good option is labelled for your child''s age and fits the fluoride decision you''ve made with your dentist. It states its active ingredients and their amounts, contains no sugar, and makes claims that match its label."},
      {"q": "Should an adult choose a chocolate flavoured toothpaste?", "a": "An adult can, if the label allows adult use. Most chocolate flavoured toothpastes are made for children and are fluoride-free. Adults who get cavities, or who have sensitive teeth or gum problems, should ask their dentist whether a fluoride or sensitivity toothpaste would suit them better."},
      {"q": "How long does a 50 g tube last?", "a": "About 100 days, if you use a pea-sized amount (roughly 0.25 g) twice a day. Larger amounts use it up faster."},
      {"q": "What does \"cocoa extract (theobromine)\" on a label mean?", "a": "Cocoa naturally contains theobromine, so the label is telling you where the theobromine comes from. Unless the pack also gives a percentage, you can''t tell how much theobromine the paste contains or compare it with the research."},
      {"q": "Why do some chocolate toothpastes contain colours?", "a": "Colours change how the paste looks. They are listed as CI numbers, such as CI 19140 (tartrazine). If you prefer to avoid added colours, choose a paste with no CI numbers in its ingredient list."},
      {"q": "Is a chocolate gel toothpaste different from a chocolate paste?", "a": "Gel and paste describe texture. Both clean with mild abrasives and contain similar sweeteners and flavours. What matters is the active ingredient, its amount and the age on the label."},
      {"q": "What if my child doesn''t like the taste?", "a": "Buy a single tube before a multipack. Opened toothpaste usually can''t be returned for hygiene reasons, and that includes ours (see our <a href=\"/refund-policy\">refund and cancellation policy</a>). If your child still resists brushing, these <a href=\"/blog/choco-toothpaste\">tips to make brushing fun</a> may help."}
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'chocolate-flavoured-toothpaste';
