const pool = require("../config/db");

async function seedStaticData() {
  const client = await pool.connect();
  try {
    console.log("[SEED] Starting static data migration into PostgreSQL...");
    await client.query("BEGIN");

    // 1. Seed FAQs
    console.log("[SEED] Seeding faqs table...");
    const faqsData = [
      {
        question: "Is Wooff safe if my child swallows it?",
        answer: "Absolutely! Wooff is 100% toxin-free and fluoride-free. We use safe, biocompatible Nano-hydroxyapatite (nHAp) and food-grade ingredients, making it completely safe if swallowed during brushing.",
        display_order: 1,
      },
      {
        question: "What is nHAp (Nano-hydroxyapatite)?",
        answer: "nHAp is a non-toxic mineral that makes up 97% of your tooth enamel. It naturally remineralizes and strengthens teeth just as effectively as fluoride, but without any of the associated toxicity risks.",
        display_order: 2,
      },
      {
        question: "At what age can my child start using Wooff?",
        answer: "Wooff is safe for kids of all ages! You can start using a tiny smear of our toothpaste as soon as your little one's first tooth appears.",
        display_order: 3,
      },
      {
        question: "Why chocolate flavor? Is there sugar?",
        answer: "There is zero sugar in Wooff! We use organic cocoa extract because kids love the taste (no more brushing battles!), and cocoa contains natural compounds that actually help fight plaque and protect enamel.",
        display_order: 4,
      },
      {
        question: "Do you offer a money-back guarantee?",
        answer: "Yes, we have a 30-day 'Happy Brusher' guarantee. If your child doesn't love the taste or you aren't satisfied, reach out to our pack and we'll refund your order.",
        display_order: 5,
      },
    ];

    await client.query("TRUNCATE TABLE faqs RESTART IDENTITY CASCADE;");
    for (const faq of faqsData) {
      await client.query(
        "INSERT INTO faqs (question, answer, display_order) VALUES ($1, $2, $3);",
        [faq.question, faq.answer, faq.display_order]
      );
    }
    console.log(`[SEED] Inserted ${faqsData.length} FAQs.`);

    // 2. Seed Testimonials
    console.log("[SEED] Seeding testimonials table...");
    const testimonialsData = [
      {
        rating: 5.0,
        text: "Brushing used to be a twice-daily battle of wills. With Wooff's chocolate toothpaste, our 4-year-old actually reminds ME when it's time to brush. Completely changed our bedtime routine!",
        author: "Sarah Jenkins (Mom of two)",
      },
      {
        rating: 5.0,
        text: "As a pediatric biological dentist, finding a 100% toxin-free toothpaste with 2% Nano-hydroxyapatite and prebiotic microbiome support is extraordinary. Wooff sets a new benchmark for kids oral care.",
        author: "Dr. Julian Vance, DDS",
      },
      {
        rating: 5.0,
        text: "No panic if our toddler swallows it, zero foaming detergents or artificial sweeteners, and their teeth are glossy and plaque-free. Truly the best investment for healthy gums.",
        author: "Marcus & Priya T. (Verified Parents)",
      },
      {
        rating: 5.0,
        text: "Been using Arctic Mint for a few weeks continuously and my teeth definitely look a bit whiter. What I like most is there's no sensitivity at all. The colour changing part is actually pretty fun to watch while brushing.",
        author: "Harshita (Review Collected During Trial Phase)",
      },
      {
        rating: 5.0,
        text: "My sensory-sensitive son hated every mint toothpaste we ever tried. Wooff is the only one he loves without tears or fuss. Plus, 100% clean and transparent ingredients give me total peace of mind!",
        author: "David L. (Father of three)",
      },
    ];

    await client.query("TRUNCATE TABLE testimonials RESTART IDENTITY CASCADE;");
    for (const t of testimonialsData) {
      await client.query(
        "INSERT INTO testimonials (rating, text, author) VALUES ($1, $2, $3);",
        [t.rating, t.text, t.author]
      );
    }
    console.log(`[SEED] Inserted ${testimonialsData.length} Testimonials.`);

    // 3. Seed Video Reels
    console.log("[SEED] Seeding video_reels table...");
    const reelsData = [
      {
        video_url: "/assets/jungle-loop.mp4",
        caption: "No more morning brushing battles with real cocoa! 🍫✨",
        author: "@wooffkids",
        product_name: "Wooff Choco Toothpaste",
        product_photo: "/assets/tooth_paste.png",
        price: 349.00,
        rating: "5.0 ★",
        reviews_count: "2.4k",
        product_slug: "wooff-choco-toothpaste",
      },
      {
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-little-girl-brushing-her-teeth-in-the-bathroom-43956-large.mp4",
        caption: "Powered by 2% Nano-HAp to remineralize enamel daily 🦷🛡️",
        author: "@dr_sarah_pediatric",
        product_name: "Nano-HAp Kids Formula",
        product_photo: "/assets/nHAp.png",
        price: 399.00,
        rating: "4.9 ★",
        reviews_count: "1.8k",
        product_slug: "nano-hap-kids-formula",
      },
      {
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-mother-and-daughter-brushing-their-teeth-41584-large.mp4",
        caption: "Safe if swallowed & 100% toxin-free ingredients 🍃",
        author: "@natural_mom_life",
        product_name: "Microbiome Friendly Gel",
        product_photo: "/assets/prebiotic.png",
        price: 349.00,
        rating: "5.0 ★",
        reviews_count: "950",
        product_slug: "microbiome-friendly-gel",
      },
      {
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-happy-boy-brushing-his-teeth-at-home-43957-large.mp4",
        caption: "Dessert for breakfast, dentist approved every time! 🚀",
        author: "@happy_brushers_club",
        product_name: "Wooff Morning Choco Set",
        product_photo: "/assets/choco.png",
        price: 649.00,
        rating: "5.0 ★",
        reviews_count: "3.1k",
        product_slug: "wooff-morning-choco-set",
      },
    ];

    await client.query("TRUNCATE TABLE video_reels RESTART IDENTITY CASCADE;");
    for (const r of reelsData) {
      await client.query(
        `INSERT INTO video_reels (video_url, caption, author, product_name, product_photo, price, rating, reviews_count, product_slug)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        [
          r.video_url,
          r.caption,
          r.author,
          r.product_name,
          r.product_photo,
          r.price,
          r.rating,
          r.reviews_count,
          r.product_slug,
        ]
      );
    }
    console.log(`[SEED] Inserted ${reelsData.length} Video Reels.`);

    // 4. Seed Certificates
    console.log("[SEED] Seeding certificates table...");
    const certificatesData = [
      {
        title: "FDA Registered Facility",
        slug: "fda-registered-facility",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/6/66/Conformit%C3%A9_Europ%C3%A9enne_%28logo%29.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
        description: "Manufactured in an FDA Registered facility.",
      },
      {
        title: "GMP Certified",
        slug: "gmp-certified",
        image_url: "https://www.vikalptechno.com/wp-content/uploads/2023/01/Certified-GMP-Logo-PNG-Transparent-Image.png",
        description: "Certified Good Manufacturing Practices.",
      },
      {
        title: "Dentist Approved",
        slug: "dentist-approved",
        image_url: "/assets/dr_approved.png",
        description: "Pediatric dentist approved biological formula.",
      },
      {
        title: "100% Toxin Free",
        slug: "100-toxin-free",
        image_url: "https://www.irohanature.us/wp-content/uploads/2021/11/PETA_Approved_GATP_COLOR_v1-768x512.png",
        description: "100% toxin free and cruelty free.",
      },
    ];

    await client.query("TRUNCATE TABLE certificates RESTART IDENTITY CASCADE;");
    for (const c of certificatesData) {
      await client.query(
        "INSERT INTO certificates (title, slug, image_url, description) VALUES ($1, $2, $3, $4);",
        [c.title, c.slug, c.image_url, c.description]
      );
    }
    console.log(`[SEED] Inserted ${certificatesData.length} Certificates.`);

    // 5. Seed Benefits
    console.log("[SEED] Seeding benefits table...");
    const benefitsData = [
      {
        title: "Stronger Enamel",
        desc_text: "Powered by nHAp",
        image_url: "/assets/nHAp.png",
        display_order: 1,
      },
      {
        title: "Microbiome Friendly",
        desc_text: "Prebiotics & Inulin",
        image_url: "/assets/prebiotic.png",
        display_order: 2,
      },
      {
        title: "Safe if Swallowed",
        desc_text: "100% Toxin Free",
        image_url: "/assets/Swallowed.png",
        display_order: 3,
      },
      {
        title: "Kid-Approved",
        desc_text: "Delicious Flavors",
        image_url: "/assets/choco.png",
        display_order: 4,
      },
    ];

    await client.query("TRUNCATE TABLE benefits RESTART IDENTITY CASCADE;");
    for (const b of benefitsData) {
      await client.query(
        "INSERT INTO benefits (title, desc_text, image_url, display_order) VALUES ($1, $2, $3, $4);",
        [b.title, b.desc_text, b.image_url, b.display_order]
      );
    }
    console.log(`[SEED] Inserted ${benefitsData.length} Benefits.`);

    // 6. Seed Pillars
    console.log("[SEED] Seeding pillars table...");
    const pillarsData = [
      {
        title: "Biologic Dentist Developed",
        desc_text: "Crafted in collaboration with holistic pediatric dentists prioritizing whole-body wellness.",
        icon: "fas fa-tooth",
        display_order: 1,
      },
      {
        title: "Prebiotics + Vitamins",
        desc_text: "Fortified with chicory root inulin, Vitamin C, and CoQ10 for gum cellular vitality.",
        icon: "fas fa-flask",
        display_order: 2,
      },
      {
        title: "Balances Oral Microbiome",
        desc_text: "Selectively nourishes beneficial oral flora instead of stripping the entire mouth with harsh antiseptics.",
        icon: "fas fa-shield-alt",
        display_order: 3,
      },
      {
        title: "Safe if Swallowed",
        desc_text: "100% toxin-free and food-grade ingredients provide zero-panic brushing for toddlers and kids.",
        icon: "fas fa-tint",
        display_order: 4,
      },
      {
        title: "Fluoride & SLS Free",
        desc_text: "Free of endocrine disruptors, artificial foaming detergents, and chemical warning labels.",
        icon: "fas fa-ban",
        display_order: 5,
      },
      {
        title: "Dye & GMO Free",
        desc_text: "Pure, transparent formulation with no artificial colorants, synthetics, or genetically modified fillers.",
        icon: "fas fa-seedling",
        display_order: 6,
      },
      {
        title: "Antioxidants & CoQ10",
        desc_text: "Rich in free-radical fighting nutrients supporting delicate gum tissues and tissue repair.",
        icon: "fas fa-bolt",
        display_order: 7,
      },
      {
        title: "15+ Years of Clinical Studies",
        desc_text: "Backed by extensive published research confirming nHAp’s superior remineralizing efficacy.",
        icon: "fas fa-book-medical",
        display_order: 8,
      },
      {
        title: "Whitens Teeth Naturally",
        desc_text: "Smoothes micro-scratches on enamel for a glossy, luminous finish without bleaching chemicals.",
        icon: "fas fa-star",
        display_order: 9,
      },
      {
        title: "Supports Total Body Health",
        desc_text: "Recognizes the mouth as the gateway to the gut, immunity, and overall systemic wellness.",
        icon: "fas fa-heart",
        display_order: 10,
      },
    ];

    await client.query("TRUNCATE TABLE pillars RESTART IDENTITY CASCADE;");
    for (const p of pillarsData) {
      await client.query(
        "INSERT INTO pillars (title, desc_text, icon, display_order) VALUES ($1, $2, $3, $4);",
        [p.title, p.desc_text, p.icon, p.display_order]
      );
    }
    console.log(`[SEED] Inserted ${pillarsData.length} Pillars.`);

    // 7. Seed Blogs
    console.log("[SEED] Seeding blogs table...");
    const blogsData = [
      {
        title: "Why We Swapped Fluoride for Nano-Hydroxyapatite (nHAp)",
        slug: "why-nano-hydroxyapatite",
        content: "As dentists, there was one question parents asked us constantly: what happens when our toddler swallows fluoride toothpaste? Traditional fluoride works by chemical hardening, but excessive ingestion carries fluorosis risks for little tummies. Enter Nano-hydroxyapatite (nHAp)—a biocompatible, biomimetic mineral making up 97% of natural tooth enamel. nHAp deposits real calcium and phosphate ions into micro-porosities, reversing early decay safely without harsh chemicals or warning labels.",
        image_url: "/assets/nHAp.png",
        author: "Dr. Ananya Sharma",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: "The Science of Theobromine: Can Cocoa Really Protect Teeth?",
        slug: "science-of-theobromine",
        content: "Chocolate has long been viewed as dental enemy number one—or so we were told. Inside natural cocoa beans lies a bioactive alkaloid known as Theobromine. Groundbreaking comparative dental studies revealed that theobromine catalyzes enamel crystalline restructuring at exceptional efficiency compared to traditional alternatives. By harnessing organic cocoa bean extract, Wooff transforms daily brushing into a delicious chocolate ritual that actively remineralizes teeth.",
        image_url: "/assets/choco.png",
        author: "Dr. Rohan Patel",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "The Oral Microbiome: Why Prebiotics Belong in Your Kid’s Toothpaste",
        slug: "oral-microbiome-prebiotics",
        content: "Your child’s mouth is home to over 700 species of microorganisms forming the primary line of digestive and immune defense. Traditional antimicrobial toothpastes strip away beneficial probiotic species along with harmful bacteria, leaving gums vulnerable to imbalance. Wooff incorporates pure chicory-derived inulin prebiotic fiber to nourish the mouth’s natural bacterial guardians while inhibiting cavity-causing pathogens naturally.",
        image_url: "/assets/prebiotic.png",
        author: "Wooff Clinical Team",
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Ending the Morning & Nighttime Brushing Battles for Good",
        slug: "ending-brushing-battles",
        content: "Negotiations, tantrums, running behind curtains—sound familiar? When oral care feels like an uncomfortable chore filled with harsh, stinging mint or chalky artificial fruit flavors, children naturally resist. But when brushing tastes like a rich cocoa treat formulated with zero sugar and holistic botanical antioxidants, daily dental care becomes something kids eagerly look forward to every single day.",
        image_url: "/assets/tooth_paste.png",
        author: "Pooja Mehta",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    await client.query("TRUNCATE TABLE blogs RESTART IDENTITY CASCADE;");
    for (const b of blogsData) {
      await client.query(
        "INSERT INTO blogs (title, slug, content, image_url, author, created_at) VALUES ($1, $2, $3, $4, $5, $6);",
        [b.title, b.slug, b.content, b.image_url, b.author, b.created_at]
      );
    }
    console.log(`[SEED] Inserted ${blogsData.length} Blogs.`);

    await client.query("COMMIT");
    console.log("[SEED] All static data successfully migrated and seeded into PostgreSQL!");
    process.exit(0);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[SEED ERROR] Transaction rolled back:", error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedStaticData();
