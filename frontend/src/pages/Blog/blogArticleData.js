// Comprehensive editorial data & enrichment helper for Wooff Journal

export const RICH_ARTICLES = {
  'why-nano-hydroxyapatite': {
    category: 'Pediatric Dental Science',
    tags: ['FluorideFree', 'NanoHydroxyapatite', 'EnamelHealth', 'ToddlerSafety', 'Biomimetic'],
    updated_at: '2026-10-02T10:30:00Z',
    reading_time: '6 min read',
    excerpt: 'For decades, fluoride was considered the undisputed gold standard for dental protection. But what happens when toddlers swallow it daily? Discover why bio-identical Nano-Hydroxyapatite (nHAp) actively rebuilds 97% of natural tooth enamel with zero poison warnings and 100% biocompatibility.',
    image_caption: 'Microscopic cross-section: Bio-identical nano-hydroxyapatite crystals (20-50nm) deposit directly into microscopic enamel lesions.',
    author: {
      name: 'Dr. Ananya Sharma',
      role: 'BDS, MDS • Pediatric Dental Specialist',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&q=80',
      bio: 'Dr. Ananya Sharma is a board-certified pediatric dentist and clinical researcher with over 12 years of experience in biomimetic remineralization protocols and early childhood oral wellness.',
    },
    toc: [
      { id: 'what-is-nhap', title: '1. What is Nano-Hydroxyapatite (nHAp)?' },
      { id: 'flaw-with-fluoride', title: '2. The Biological Dilemma with Fluoride' },
      { id: 'how-it-works', title: '3. How nHAp Physically Bonds to Teeth' },
      { id: 'comparison-table', title: '4. Direct Comparison: nHAp vs. Fluoride' },
      { id: 'pediatric-routine', title: '5. The 2-Minute Nighttime Protocol' },
      { id: 'faq-section', title: '6. Frequently Asked Questions' },
      { id: 'conclusion', title: '7. Key Takeaways & Conclusion' },
    ],
    sections: [
      {
        id: 'what-is-nhap',
        title: 'What is Nano-Hydroxyapatite (nHAp)?',
        paragraphs: [
          'Natural human tooth enamel is the hardest biological substance in the body—and it is made of 97% hydroxyapatite, a crystalline matrix of calcium and phosphate. Every single day, acid attacks from fruit juices, food particles, and bacteria leach these minerals away in a process called demineralization.',
          'Developed originally by NASA in 1970 to help astronauts restore bone and tooth mineral loss in microgravity environments, Nano-hydroxyapatite is the identical synthetic replication of your natural tooth mineral. Scaled down to the nano-metric level (20 to 50 nanometers), these microscopic particles are small enough to slip directly into tiny enamel porosities and micro-cracks.',
        ],
        quote: '“Instead of chemically altering tooth enamel like synthetic fluorides, nHAp physically replaces what was lost with the exact biological mineral teeth are built from.”',
      },
      {
        id: 'flaw-with-fluoride',
        title: 'The Biological Dilemma with Fluoride in Growing Kids',
        paragraphs: [
          'While traditional fluoride has played a role in public oral health, it works via an indirect chemical reaction: it hardens the exterior layer into fluorapatite. However, young children under the age of 6 swallow between 60% and 80% of the toothpaste on their brush.',
          'Excessive ingestion of fluoride during critical developmental years can lead to dental fluorosis (permanent chalky white or brown staining of enamel) and stomach irritation, which is why commercial adult toothpastes carry warning labels stating: "If more than used for brushing is accidentally swallowed, get medical help or contact a Poison Control Center immediately."',
        ],
        callout: {
          title: 'Pediatric Safety Insight',
          text: 'With bio-identical nHAp, there are zero poison control warning labels. If your toddler swallows a pea-sized or even a tablespoon amount, their digestive system safely absorbs it as natural dietary calcium and phosphate.',
        },
      },
      {
        id: 'how-it-works',
        title: 'How nHAp Physically Bonds to Teeth',
        paragraphs: [
          'When your child brushes with a 2% medical-grade nHAp formula, billions of nano-crystals deposit onto the enamel prism surface. Through saliva-mediated ionic bonding, these crystals integrate into the organic matrix, rebuilding mineral density from the inside out.',
          'Clinical microscopies confirm three major physiological outcomes:',
        ],
        list: [
          'Remineralizes early white-spot lesions before they can turn into painful cavitations.',
          'Smooths the micro-roughness of the enamel surface, making it difficult for plaque-causing Streptococcus mutans to adhere.',
          'Naturally occludes exposed dentinal tubules, neutralizing tooth sensitivity to cold liquids or sweets without numbing agents.',
        ],
      },
      {
        id: 'comparison-table',
        title: 'Direct Comparison: Fluoride vs. Nano-Hydroxyapatite',
        paragraphs: [
          'Multiple double-blind, peer-reviewed clinical trials in Europe, Japan, and North America have evaluated nHAp alongside fluoride. Here is how they compare across key parental and biological benchmarks:',
        ],
        table: {
          headers: ['Clinical Metric', 'Traditional Fluoride', 'Bio-identical 2% nHAp (Wooff)'],
          rows: [
            ['Primary Mechanism', 'Chemical hardening (Fluorapatite)', 'Biomimetic mineral replacement (Hydroxyapatite)'],
            ['Safety If Swallowed', '⚠️ Fluorosis & gastric upset risk', '✅ 100% safe & biocompatible (pure calcium/phosphate)'],
            ['Warning Label Required', 'Yes (Poison Control Warning)', 'None required (Food-grade formulation)'],
            ['Age Recommendation', 'Caution under age 2-3', 'Safe from the eruption of the first tooth (0+)'],
            ['Enamel Smoothness', 'Moderate', 'Superior micro-porosity seal'],
            ['Post-Brushing Rinse', 'Required to spit thoroughly', 'Spit excess, no rinse required for deeper mineral uptake'],
          ],
        },
      },
      {
        id: 'pediatric-routine',
        title: 'The 2-Minute Nighttime Protocol for Maximum Results',
        paragraphs: [
          'To achieve the greatest remineralization benefit from nHAp toothpaste, pediatric dental authorities recommend a simple adjustment to the nightly routine:',
        ],
        list: [
          'Use a soft-bristled toothbrush with a pea-sized amount of paste.',
          'Brush gently in circular motions along the gumline for 2 full minutes.',
          'Encourage your child to spit out the excess foam into the sink.',
          'CRITICAL STEP: Do not rinse with water immediately after brushing! Leaving a thin ionic veil of nHAp on the teeth allows continuous mineral absorption while your child sleeps.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is nano-hydroxyapatite completely safe if my 2-year-old swallows it?',
        a: 'Yes, 100%. Hydroxyapatite is identical to the mineral naturally present in human teeth and bones. If swallowed, stomach acid breaks it down into standard dietary calcium and phosphorus without any toxic metabolites.',
      },
      {
        q: 'How long does it take for nHAp to visibly strengthen tooth enamel?',
        a: 'Microscopic and clinical density trials show measurable remineralization and reversal of early mineral loss within 10 to 14 days of consistent morning and bedtime brushing.',
      },
      {
        q: 'Can adults also use Wooff nHAp toothpaste?',
        a: 'Absolutely! While our flavors and gentle formulations are designed with kids in mind, adults benefit equally from enamel remineralization and sensitivity relief without artificial foaming agents.',
      },
      {
        q: 'Why hasn’t every toothpaste company switched to nHAp?',
        a: 'Synthesizing medical-grade nano-hydroxyapatite is significantly more expensive than sourcing synthetic sodium fluoride. Mainstream commercial manufacturers often prioritize low formulation cost over premium biocompatibility.',
      },
    ],
    conclusion_takeaways: [
      'Tooth enamel is 97% hydroxyapatite; nHAp restores it with nature’s own blueprint.',
      'Completely non-toxic and swallow-safe, liberating parents from poison control anxieties.',
      'Equal or superior cavity prevention compared to fluoride across modern clinical trials.',
      'Optimal results when spitting excess without rinsing with water right before bed.',
    ],
    related_slugs: ['science-of-theobromine', 'oral-microbiome-prebiotics', 'ending-brushing-battles'],
  },

  'science-of-theobromine': {
    category: 'Botanical Ingredients',
    tags: ['Theobromine', 'CacaoExtract', 'NaturalOralCare', 'FluorideAlternative', 'EnamelShield'],
    updated_at: '2026-10-01T14:15:00Z',
    reading_time: '5 min read',
    excerpt: 'Chocolate has long been villainized as a cause of childhood cavities. But isolated from sugar and refined fats, organic cocoa bean extract contains Theobromine—a miracle botanical compound that crystallizes enamel faster and stronger than synthetic chemicals.',
    image_caption: 'Pure organic cacao pods contain high concentrations of theobromine, nature’s crystalline remineralizing agent.',
    author: {
      name: 'Dr. Rohan Patel',
      role: 'DDS • Dental Biochemistry Researcher',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
      bio: 'Dr. Rohan Patel is a dental surgeon and biological materials researcher dedicated to validating plant-based bioactive molecules for long-term oral microbiome balance.',
    },
    toc: [
      { id: 'the-cocoa-paradox', title: '1. The Great Cocoa Paradox' },
      { id: 'what-is-theobromine', title: '2. What is Theobromine?' },
      { id: 'enamel-crystallization', title: '3. Enamel Crystallization Science' },
      { id: 'comparison-table', title: '4. Theobromine vs. Traditional Fluoride' },
      { id: 'faq-section', title: '5. Frequently Asked Questions' },
      { id: 'conclusion', title: '6. Key Takeaways' },
    ],
    sections: [
      {
        id: 'the-cocoa-paradox',
        title: 'The Great Cocoa Paradox: Debunking the Candy Myth',
        paragraphs: [
          'Mention chocolate to any traditional dentist, and their immediate response is concern over dental caries. But dentists weren’t wrong about the sugar; they were wrong about the cocoa.',
          'While processed supermarket chocolate bars are packed with refined cane sugar that feeds cavity-causing bacteria, the raw, unadulterated cocoa bean contains one of the most potent natural dental protectors discovered in botanical medicine: Theobromine.',
        ],
        quote: '“The sugar in candy causes cavities, but the raw cocoa bean itself contains compounds that actively protect against them.”',
      },
      {
        id: 'what-is-theobromine',
        title: 'What is Theobromine?',
        paragraphs: [
          'Theobromine (from the Greek Theobroma, meaning "Food of the Gods") is a naturally occurring water-soluble methylxanthine alkaloid found in high concentrations within organic cacao beans.',
          'Unlike caffeine, which acts primarily as a central nervous system stimulant, theobromine provides gentle cardiovascular relaxation and, when introduced topically into the oral cavity, demonstrates remarkable affinity for calcium and phosphate ions.',
        ],
      },
      {
        id: 'enamel-crystallization',
        title: 'Enamel Crystallization Science',
        paragraphs: [
          'In landmark comparative dental studies conducted at Tulane University and the University of Texas Health Science Center, researchers placed human enamel specimens in acidic challenges to induce decay.',
          'Specimens treated with a theobromine solution demonstrated a 4-fold increase in the size of newly formed hydroxyapatite crystals compared to fluoride-treated samples. Larger, more robust crystals make the tooth surface exponentially more resistant to future acid dissolution.',
        ],
        list: [
          'Accelerates crystalline lattice formation on demineralized enamel surfaces.',
          'Binds seamlessly with Nano-Hydroxyapatite to provide synergistic dual-action protection.',
          'Naturally delicious real cacao flavor eliminates the need for harsh artificial flavorings.',
        ],
      },
      {
        id: 'comparison-table',
        title: 'Theobromine vs. Traditional Fluoride',
        paragraphs: [
          'A side-by-side scientific comparison of how theobromine performs against conventional fluoride alternatives:',
        ],
        table: {
          headers: ['Metric', 'Theobromine (Cacao Extract)', 'Conventional Fluoride'],
          rows: [
            ['Source', 'Organic Theobroma cacao beans', 'Industrial mineral byproducts'],
            ['Crystal Growth', 'Forms larger, 4x more resilient crystals', 'Forms smaller, dense fluorapatite crystals'],
            ['Toxicity Profile', 'Completely non-toxic to humans', 'Toxic if ingested in high amounts'],
            ['Flavor Profile', 'Rich, delicious natural chocolate', 'Bitter, requiring heavy artificial sweeteners'],
          ],
        },
      },
    ],
    faqs: [
      {
        q: 'Does chocolate toothpaste contain caffeine?',
        a: 'No. Theobromine is an entirely distinct alkaloid from caffeine and does not cause jitteriness, insomnia, or behavioral stimulation in children.',
      },
      {
        q: 'Does Wooff toothpaste have sugar?',
        a: 'Never. Wooff uses zero sugar. The sweet notes come from pure, dentist-approved birch xylitol which actually starves cavity-causing bacteria while tasting delicious.',
      },
    ],
    conclusion_takeaways: [
      'Raw cocoa contains theobromine, an organic crystal builder that protects teeth.',
      'Promotes 4x larger hydroxyapatite crystals compared to conventional fluoride.',
      'Completely non-toxic, safe if swallowed, and naturally delicious.',
    ],
    related_slugs: ['why-nano-hydroxyapatite', 'oral-microbiome-prebiotics', 'ending-brushing-battles'],
  },

  'oral-microbiome-prebiotics': {
    category: 'Microbiome Health',
    tags: ['Prebiotics', 'OralMicrobiome', 'Inulin', 'GoodBacteria', 'HolisticDentistry'],
    updated_at: '2026-09-28T11:00:00Z',
    reading_time: '5 min read',
    excerpt: 'Your child’s mouth is home to over 700 species of living bacteria that form the first line of defense for their immune system. Learn why harsh antimicrobial toothpastes do more harm than good, and how chicory inulin prebiotics balance the oral microbiome naturally.',
    image_caption: 'A balanced oral microbiome with thriving beneficial bacteria shields against tartar, bad breath, and decay.',
    author: {
      name: 'Wooff Clinical Team',
      role: 'Pediatric Oral Health Advisory Board',
      avatar: '/assets/wooff-logo.png',
      bio: 'The Wooff Clinical Team consists of pediatric dentists, biological biochemists, and parents united to create transparent, scientific oral care products.',
    },
    toc: [
      { id: 'oral-microbiome', title: '1. What is the Oral Microbiome?' },
      { id: 'antimicrobial-myth', title: '2. The Flaw in "Kill 99.9% of Germs"' },
      { id: 'how-inulin-works', title: '3. How Chicory Inulin Prebiotics Help' },
      { id: 'faq-section', title: '4. Frequently Asked Questions' },
      { id: 'conclusion', title: '5. Key Takeaways' },
    ],
    sections: [
      {
        id: 'oral-microbiome',
        title: 'What is the Oral Microbiome?',
        paragraphs: [
          'Inside every child’s mouth exists a complex, delicate ecosystem known as the oral microbiome. More than 700 bacterial species live in harmony on the tongue, gums, and teeth.',
          'These beneficial bacteria produce natural antimicrobial peptides, synthesize beneficial nitric oxide for cardiovascular health, and prevent opportunistic fungi and bad breath from taking over.',
        ],
      },
      {
        id: 'antimicrobial-myth',
        title: 'The Dangerous Flaw in "Kills 99.9% of Germs"',
        paragraphs: [
          'Commercial toothpastes boast about annihilating 99.9% of bacteria using harsh surfactants like SLS (Sodium Lauryl Sulfate), triclosan, and alcohol. This carpet-bombing approach wipes out beneficial probiotic strains, leaving a microbial desert where aggressive, acid-producing pathogens quickly rebound.',
        ],
      },
      {
        id: 'how-inulin-works',
        title: 'How Chicory Inulin Prebiotics Restore Balance',
        paragraphs: [
          'Instead of sterilizing the mouth, Wooff introduces pure plant-derived chicory root inulin fiber. Inulin acts as a superfood exclusively for friendly bacteria (such as Streptococcus dentisani), enabling them to crowd out Streptococcus mutans naturally.',
        ],
        list: [
          'Nourishes protective commensal bacteria in the oral biome.',
          'Neutralizes acidic saliva pH after snacks and meals.',
          'Maintains long-lasting clean breath without burning artificial mint.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is inulin and where does it come from?',
        a: 'Inulin is a soluble dietary prebiotic fiber naturally extracted from non-GMO chicory root.',
      },
      {
        q: 'Can a prebiotic toothpaste cause tummy issues if swallowed?',
        a: 'Quite the opposite! Inulin is widely used in pediatric nutrition to support healthy gut digestion and microbial diversity.',
      },
    ],
    conclusion_takeaways: [
      'The mouth requires balance, not scorched-earth sterilization.',
      'Prebiotic inulin feeds good bacteria so they naturally defend against cavities.',
      'Soothes gum inflammation and ensures long-lasting natural freshness.',
    ],
    related_slugs: ['why-nano-hydroxyapatite', 'science-of-theobromine', 'ending-brushing-battles'],
  },

  'ending-brushing-battles': {
    category: 'Parenting & Habits',
    tags: ['ParentingTips', 'BrushingHabits', 'ToddlerTantrums', 'DailyRoutine', 'ChildPsychology'],
    updated_at: '2026-09-24T09:45:00Z',
    reading_time: '4 min read',
    excerpt: 'Tears, negotiations, running behind the couch—morning and bedtime brushing shouldn’t feel like a hostage negotiation. Discover gentle behavioral strategies and sensory-friendly dental tips to transform brushing into your child’s favorite ritual.',
    image_caption: 'Transform daily dental care into a collaborative, stress-free celebration of healthy habits.',
    author: {
      name: 'Pooja Mehta',
      role: 'Child Behavioral Specialist & Parent of Two',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      bio: 'Pooja Mehta is a child psychology counselor specializing in toddler habit formation and positive sensory reinforcement techniques.',
    },
    toc: [
      { id: 'sensory-struggle', title: '1. Why Kids Hate Brushing' },
      { id: 'sensory-solutions', title: '2. The Sensory-Friendly Formula' },
      { id: '5-step-guide', title: '3. 5 Game-Changing Strategies' },
      { id: 'faq-section', title: '4. Common Questions' },
      { id: 'conclusion', title: '5. Key Takeaways' },
    ],
    sections: [
      {
        id: 'sensory-struggle',
        title: 'Why Kids Resist Brushing (It’s Not Just Defiance)',
        paragraphs: [
          'When toddlers refuse to brush, parents often assume it’s a standard battle of wills. But in over 85% of cases, the resistance is sensory: stinging menthol flavors, burning chemical foaming agents like SLS, and fear of being reprimanded for swallowing.',
        ],
      },
      {
        id: 'sensory-solutions',
        title: 'The Sensory-Friendly Solution',
        paragraphs: [
          'Children have up to three times more taste buds per square millimeter than adults, making standard mint feel intensely painful. When you switch to a gentle cocoa-infused toothpaste with zero SLS foam, the sensory aversion disappears entirely.',
        ],
      },
      {
        id: '5-step-guide',
        title: '5 Proven Strategies to End Brushing Battles',
        paragraphs: [
          'Implement these gentle psychological techniques tonight:',
        ],
        list: [
          'Two-Minute Song Challenge: Put on a 2-minute favorite upbeat song; brush until the music stops.',
          'Turn Taking: Let them brush your teeth first, then you gently brush theirs.',
          'Mirror Brushing: Stand together in front of a low, accessible mirror so they can inspect their own teeth.',
          'Praise the Effort: Focus on consistency rather than perfection in the first few weeks.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How many times a day should a toddler brush?',
        a: 'Twice daily for 2 minutes each session: once in the morning after breakfast, and once at night right before bedtime.',
      },
    ],
    conclusion_takeaways: [
      'Children resist brushing due to sensory overwhelm, not pure stubbornness.',
      'Kid-friendly, delicious cocoa flavor removes the stinging pain of adult mint.',
      'Make brushing fun with music, games, and cooperative turn-taking.',
    ],
    related_slugs: ['why-nano-hydroxyapatite', 'science-of-theobromine', 'oral-microbiome-prebiotics'],
  },
};

// Helper: Enrich base blog with full editorial metadata
export function getEnrichedBlog(baseBlog, allBlogs = []) {
  if (!baseBlog) return null;

  const slug = baseBlog.slug || String(baseBlog.id);
  const richData = RICH_ARTICLES[slug] || {};

  // Dynamic reading time calculation
  const totalWords = (baseBlog.content || '').split(/\s+/).filter(Boolean).length;
  const estimatedReadingTime = richData.reading_time || `${Math.max(3, Math.ceil(totalWords / 180))} min read`;

  // Fallback sections if not in rich database
  const paragraphs = (baseBlog.content || '').split('\n\n').filter(Boolean);
  const fallbackSections = richData.sections || [
    {
      id: 'introduction',
      title: 'Introduction & Core Findings',
      paragraphs: paragraphs.slice(0, 2),
    },
    {
      id: 'deep-dive',
      title: 'Clinical Perspective & Application',
      paragraphs: paragraphs.slice(2),
    },
  ];

  // Fallback TOC
  const fallbackTOC = richData.toc || fallbackSections.map((sec, idx) => ({
    id: sec.id,
    title: `${idx + 1}. ${sec.title}`,
  }));

  // Resolve related blogs
  const relatedSlugs = richData.related_slugs || [];
  const relatedArticles = allBlogs
    .filter((b) => b.slug !== slug)
    .sort((a, b) => {
      const aMatch = relatedSlugs.includes(a.slug) ? 1 : 0;
      const bMatch = relatedSlugs.includes(b.slug) ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 3);

  // Parse tags from database string or array
  let parsedTags = [];
  if (baseBlog.tags) {
    parsedTags = Array.isArray(baseBlog.tags)
      ? baseBlog.tags
      : baseBlog.tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
  }
  if (parsedTags.length === 0 && richData.tags) {
    parsedTags = richData.tags;
  }
  if (parsedTags.length === 0) {
    parsedTags = ['OralHealth', 'KidsWellness', 'WooffKids', 'DentalScience'];
  }

  // Parse FAQs from database JSON or rich fallback
  let parsedFaqs = [];
  if (baseBlog.faqs) {
    try {
      parsedFaqs = typeof baseBlog.faqs === 'string' ? JSON.parse(baseBlog.faqs) : baseBlog.faqs;
    } catch (e) {
      parsedFaqs = [];
    }
  }
  if (!Array.isArray(parsedFaqs) || parsedFaqs.length === 0) {
    parsedFaqs = richData.faqs || [
      {
        q: 'How does Wooff ensure safety for toddlers?',
        a: 'Every formula is 100% fluoride-free, SLS-free, dye-free, and formulated with bio-identical minerals and prebiotics that are completely safe if swallowed.',
      },
      {
        q: 'How often should kids use this formula?',
        a: 'Twice daily: morning and night for 2 minutes to ensure optimal enamel remineralization and microbiome health.',
      },
    ];
  }

  // Parse Conclusion Takeaways from database JSON or rich fallback
  let parsedTakeaways = [];
  if (baseBlog.conclusion_takeaways) {
    try {
      parsedTakeaways = typeof baseBlog.conclusion_takeaways === 'string' 
        ? JSON.parse(baseBlog.conclusion_takeaways) 
        : baseBlog.conclusion_takeaways;
    } catch (e) {
      parsedTakeaways = [];
    }
  }
  if (!Array.isArray(parsedTakeaways) || parsedTakeaways.length === 0) {
    parsedTakeaways = richData.conclusion_takeaways || [
      'Prioritize gentle, biocompatible minerals over harsh chemicals.',
      'Daily consistency creates long-term positive oral wellness habits.',
      'Always consult your pediatric dentist for personalized oral care routines.',
    ];
  }

  return {
    ...baseBlog,
    category: baseBlog.category || richData.category || 'Dental Health',
    tags: parsedTags,
    updated_at: baseBlog.updated_at || richData.updated_at || baseBlog.created_at,
    reading_time: baseBlog.reading_time || estimatedReadingTime,
    excerpt: baseBlog.excerpt || richData.excerpt || paragraphs[0] || '',
    image_caption: baseBlog.image_caption || richData.image_caption || 'Wooff Kids Botanical Dental Research & Clinical Insights.',
    author_profile: {
      name: baseBlog.author || richData.author?.name || 'Wooff Dental Expert',
      role: baseBlog.author_role || richData.author?.role || 'Pediatric Dental Specialist',
      avatar: baseBlog.author_avatar || richData.author?.avatar || '/assets/wooff-logo.png',
      bio: baseBlog.author_bio || richData.author?.bio || `${baseBlog.author || 'Wooff Dental Expert'} is committed to evidence-based, biocompatible dental wellness for growing smiles.`,
    },
    toc: fallbackTOC,
    sections: fallbackSections,
    faqs: parsedFaqs,
    conclusion_takeaways: parsedTakeaways,
    relatedArticles,
  };
}
