// Comprehensive editorial data & enrichment helper for Wooff Journal

export const RICH_ARTICLES = {
  'choco-toothpaste': {
    title: 'Choco Flavoured Toothpaste: Make Brushing a Treat',
    meta_title: 'Choco Flavoured Toothpaste: Fun Brushing for Kids | Wooff',
    meta_description: 'Choco flavoured toothpaste that kids ask for. See how Wooff turns brushing into a routine children enjoy.',
    category: 'Kids Routine & Science',
    tags: ['ChocoToothpaste', 'KidsRoutine', 'NanoHydroxyapatite', 'ParentingTips', 'BrushHappily'],
    updated_at: '2026-10-12T12:00:00Z',
    reading_time: '3 min read',
    image_url: '/assets/choco-toothpaste-pieces.jpg',
    excerpt: 'Choco flavoured toothpaste turns a daily chore into something kids look forward to. Wooff is built for that.',
    image_caption: 'Wooff 100% natural choco flavoured kids toothpaste with bio-identical nano-hydroxyapatite and organic cocoa theobromine.',
    author: {
      name: 'Wooff Team',
      role: 'Pediatric Oral Care Team',
      avatar: '/assets/wooff-logo.png',
      bio: "Written by the Wooff team. Reviewed for accuracy; check with your child's dentist for personal advice. Toothpaste is not a substitute for regular dental visits.",
    },
    toc: [
      { id: 'in-brief', title: '1. In Brief' },
      { id: 'four-ways', title: '2. Four Ways to Get Kids Brushing Happily' },
      { id: 'what-makes-wooff-different', title: '3. What Makes Wooff Different' },
      { id: 'faq-section', title: '4. Frequently Asked Questions' },
      { id: 'next-steps', title: '5. Explore the Range' },
    ],
    sections: [
      {
        id: 'in-brief',
        title: 'In Brief',
        paragraphs: [
          'Choco flavoured toothpaste turns a daily chore into something kids look forward to. Wooff is built for that.',
          'Mornings and bedtimes are often marked by negotiations, stalled routines, and reluctant brushers. Replacing spicy or sharp mint with a gentle, delectable chocolate flavor transforms oral care into a daily treat that children actively request.',
        ],
        quote: '“When brushing tastes like an indulgent cocoa treat without sugar or artificial sweeteners, resistance turns into excitement.”',
      },
      {
        id: 'four-ways',
        title: 'Four Ways to Get Kids Brushing Happily',
        paragraphs: [
          'Developing lifelong dental habits does not have to be a battle of wills. Here are four dentist-tested strategies to make brushing time smooth and joyful:',
        ],
        subsections: [
          {
            title: 'Let Them Choose the Moment',
            content: 'Give a choice between brushing before or after the bedtime story. Choice reduces pushback.',
          },
          {
            title: 'Use a Timer',
            content: 'Play a two-minute song. Kids brush longer when time feels like a game.',
          },
          {
            title: 'Brush Together',
            content: 'Children copy adults. Brush alongside them.',
          },
          {
            title: 'Pick a Taste They Like',
            content: 'A choco flavour removes the biggest barrier: dislike of strong mint.',
          },
        ],
      },
      {
        id: 'what-makes-wooff-different',
        title: 'What Makes Wooff Different',
        paragraphs: [
          "Wooff combines nano-hydroxyapatite and calcium gluconate with theobromine, inulin, vitamin C, lactoferrin and coenzyme Q10 in one kids' formula.",
          'Rather than stripping the oral microbiome with harsh foaming agents and synthetic dyes, Wooff nourishes beneficial oral flora, remineralizes developing enamel safely, and makes every brush stroke 100% safe to swallow.',
        ],
        callout: {
          title: 'The Wooff Super-Blend',
          text: 'Bio-identical Nano-Hydroxyapatite (nHAp) + Calcium Gluconate + Theobromine + Inulin Prebiotics + Vitamin C + Lactoferrin + CoQ10.',
        },
      },
      {
        id: 'next-steps',
        title: 'Explore the Range',
        paragraphs: [
          'Ready to transform your child’s daily brushing routine into joyful smiles?',
        ],
        customLinks: [
          { text: 'See the product page', url: '/products' },
          { text: 'Browse all kids toothpaste', url: '/products' },
        ],
      },
    ],
    faqs: [
      {
        q: 'How much should my child use?',
        a: 'A pea-sized amount, with an adult watching.',
      },
      {
        q: 'How often?',
        a: 'Twice daily, morning and night.',
      },
      {
        q: 'Is it suitable for toddlers?',
        a: 'Follow the age guidance on the pack and consult a dentist for very young children.',
      },
      {
        q: 'Does it taste like real chocolate?',
        a: 'It has a cocoa-style flavour, made to be mild and kid-friendly.',
      },
    ],
    conclusion_takeaways: [
      'Choco flavoured toothpaste turns twice-daily brushing into something children look forward to.',
      'Giving simple choices and brushing together builds confidence and routine.',
      "Wooff pairs kid-loved cocoa flavor with dentist-backed nHAp, prebiotic inulin, and botanicals.",
    ],
    disclaimer: "Written by the Wooff team. Reviewed for accuracy; check with your child's dentist for personal advice. Toothpaste is not a substitute for regular dental visits.",
    related_slugs: [],
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
    disclaimer: baseBlog.disclaimer || richData.disclaimer || null,
    meta_title: richData.meta_title || null,
    meta_description: richData.meta_description || null,
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
