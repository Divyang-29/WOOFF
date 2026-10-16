-- Migration 023: Update choco-toothpaste blog slug to choco-flavoured-toothpaste and update title & content
UPDATE blogs 
SET slug = 'choco-flavoured-toothpaste',
    title = 'Choco Flavoured Toothpaste: 8 Tips to End Brushing Fights',
    content = 'Choco flavoured toothpaste is toothpaste that tastes of chocolate instead of mint. For a child who refuses to brush because mint feels sharp or "spicy", switching to a chocolate flavour can take away one reason for the daily battle. On its own, though, it won''t build the habit. A steady routine, the right amount of toothpaste and an adult who stays involved do most of that work.'
WHERE slug = 'choco-toothpaste'
   OR title ILIKE '%Choco Flavoured Toothpaste%';
