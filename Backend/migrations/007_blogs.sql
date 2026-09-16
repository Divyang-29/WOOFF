-- Migration 007: Create blogs table and seed sample posts

CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);

-- Seed with initial sample posts if table is empty
INSERT INTO blogs (title, content, image_url, author, created_at)
SELECT 
  'Why We Swapped Fluoride for Nano-Hydroxyapatite (nHAp)',
  'As dentists, there was one question parents asked us constantly: what happens when our toddler swallows fluoride toothpaste? Traditional fluoride works by chemical hardening, but excessive ingestion carries fluorosis risks for little tummies. Enter Nano-hydroxyapatite (nHAp)—a biocompatible, biomimetic mineral making up 97% of natural tooth enamel. nHAp deposits real calcium and phosphate ions into micro-porosities, reversing early decay safely without harsh chemicals or warning labels.',
  '/assets/nHAp.png',
  'Dr. Ananya Sharma',
  CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM blogs WHERE title = 'Why We Swapped Fluoride for Nano-Hydroxyapatite (nHAp)');

INSERT INTO blogs (title, content, image_url, author, created_at)
SELECT 
  'The Science of Theobromine: Can Cocoa Really Protect Teeth?',
  'Chocolate has long been viewed as dental enemy number one—or so we were told. Inside natural cocoa beans lies a bioactive alkaloid known as Theobromine. Groundbreaking comparative dental studies revealed that theobromine catalyzes enamel crystalline restructuring at exceptional efficiency compared to traditional alternatives. By harnessing organic cocoa bean extract, Wooff transforms daily brushing into a delicious chocolate ritual that actively remineralizes teeth.',
  '/assets/choco.png',
  'Dr. Rohan Patel',
  CURRENT_TIMESTAMP - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM blogs WHERE title = 'The Science of Theobromine: Can Cocoa Really Protect Teeth?');

INSERT INTO blogs (title, content, image_url, author, created_at)
SELECT 
  'The Oral Microbiome: Why Prebiotics Belong in Your Kid’s Toothpaste',
  'Your child’s mouth is home to over 700 species of microorganisms forming the primary line of digestive and immune defense. Traditional antimicrobial toothpastes strip away beneficial probiotic species along with harmful bacteria, leaving gums vulnerable to imbalance. Wooff incorporates pure chicory-derived inulin prebiotic fiber to nourish the mouth’s natural bacterial guardians while inhibiting cavity-causing pathogens naturally.',
  '/assets/prebiotic.png',
  'Wooff Clinical Team',
  CURRENT_TIMESTAMP - INTERVAL '6 days'
WHERE NOT EXISTS (SELECT 1 FROM blogs WHERE title = 'The Oral Microbiome: Why Prebiotics Belong in Your Kid’s Toothpaste');

INSERT INTO blogs (title, content, image_url, author, created_at)
SELECT 
  'Ending the Morning & Nighttime Brushing Battles for Good',
  'Negotiations, tantrums, running behind curtains—sound familiar? When oral care feels like an uncomfortable chore filled with harsh, stinging mint or chalky artificial fruit flavors, children naturally resist. But when brushing tastes like a rich cocoa treat formulated with zero sugar and holistic botanical antioxidants, daily dental care becomes something kids eagerly look forward to every single day.',
  '/assets/tooth_paste.png',
  'Pooja Mehta',
  CURRENT_TIMESTAMP - INTERVAL '10 days'
WHERE NOT EXISTS (SELECT 1 FROM blogs WHERE title = 'Ending the Morning & Nighttime Brushing Battles for Good');
