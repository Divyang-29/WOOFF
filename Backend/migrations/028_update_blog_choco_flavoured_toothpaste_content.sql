-- Migration 028: Update choco-flavoured-toothpaste blog title, excerpt, content, and faqs to match new blog content
UPDATE blogs 
SET title = 'Choco Flavoured Toothpaste',
    excerpt = 'Make brushing fun with Wooff Choco Flavoured Toothpaste! Enjoy a delicious chocolate flavour and a refreshing brushing experience every day.',
    content = 'Choco flavoured toothpaste is toothpaste that tastes of chocolate instead of mint. For a child who refuses to brush because mint feels sharp or "spicy", switching to a chocolate flavour can take away one reason for the daily battle. On its own, though, it won''t build the habit. A steady routine, the right amount of toothpaste and an adult who stays involved do most of that work. This guide covers how to make the switch, a brushing routine for each age, and practical ways to make brushing something your child looks forward to.',
    faqs = '[
      {"q": "My child hates brushing. Will choco flavoured toothpaste help?", "a": "It can, if the taste of mint is the problem. If your child resists the brush itself, the routine or being told what to do, use the other tips in this guide alongside the change of flavour."},
      {"q": "Should I let my child choose the toothpaste?", "a": "Yes, within limits. Let them choose between options that suit their age and your dentist''s advice. Picking the brush colour or the flavour can make them more willing to brush."},
      {"q": "How long should my child brush?", "a": "For about 2 minutes, twice a day, including last thing at night before bed. A timer or a two-minute song helps."},
      {"q": "Should my child rinse after brushing?", "a": "With a fluoride toothpaste, the NHS advises spitting out and not rinsing, so the fluoride keeps working. For other toothpastes, follow the directions on the pack."},
      {"q": "How do I teach my child to spit out toothpaste?", "a": "Show them how you do it, practise with a little water, and praise every try. Until they can spit reliably, keep the amount small and supervise."},
      {"q": "When can my child brush on their own?", "a": "NHS guidance says children aged 7 and over should be able to brush their own teeth, but it''s still a good idea to watch and check."},
      {"q": "Is it OK to reward brushing with chocolate?", "a": "Stickers, praise or extra play time work better as rewards. If your child does have chocolate, keep it to mealtimes and never after the bedtime brush."}
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'choco-flavoured-toothpaste' OR slug = 'choco-toothpaste';
