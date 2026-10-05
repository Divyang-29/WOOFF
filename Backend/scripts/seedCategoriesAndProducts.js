const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://wooff_test_user:ciu9UFu7WzI1Iio9qi8VwuG0ldbhYmiX@dpg-db0voo5g1s2s73fsu250-a.oregon-postgres.render.com/wooff_test",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Seeding categories into live Render DB...");

    const categories = [
      { id: 1, name: "Toothpaste", slug: "toothpaste", description: "Prebiotic & nano-hydroxyapatite toothpastes for kids" },
      { id: 2, name: "Toothbrushes", slug: "toothbrushes", description: "Ultra-soft ergonomic toothbrushes for little hands" },
      { id: 3, name: "Combos & Bundles", slug: "combos-bundles", description: "Starter packs and value brushing bundles" },
    ];

    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (id, name, slug, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, description = $4`,
        [cat.id, cat.name, cat.slug, cat.description]
      );
    }

    await client.query(`SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));`);
    console.log("Categories seeded successfully.");

    console.log("Seeding initial products into live Render DB...");
    const products = [
      {
        id: 8,
        category_id: 1,
        title: "Wooff Choco Toothpaste",
        slug: "wooff-choco-toothpaste",
        price: 399.00,
        final_price: 349.00,
        primary_image: "/assets/tooth_paste.png",
        images: JSON.stringify(["/assets/tooth_paste.png"]),
        description: "India's 1st prebiotic chocolate toothpaste for kids. Infused with real cocoa and 2% Nano-hydroxyapatite to actively rebuild enamel, strengthen gums, and make brushing delicious.",
        stock: 250,
        sku: "WOOFF-TP-CHOCO-01",
        estimated_delivery: "2-4 business days",
        rating_avg: 5.00,
        review_count: 24,
        is_active: true,
        is_bestseller: true,
      },
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO products (
          id, category_id, title, slug, price, final_price, primary_image, images,
          description, stock, sku, estimated_delivery, rating_avg, review_count, is_active, is_bestseller
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          category_id = $2, title = $3, slug = $4, price = $5, final_price = $6,
          primary_image = $7, images = $8::jsonb, description = $9, stock = $10,
          sku = $11, is_active = $15, is_bestseller = $16`,
        [
          p.id,
          p.category_id,
          p.title,
          p.slug,
          p.price,
          p.final_price,
          p.primary_image,
          p.images,
          p.description,
          p.stock,
          p.sku,
          p.estimated_delivery,
          p.rating_avg,
          p.review_count,
          p.is_active,
          p.is_bestseller,
        ]
      );
    }

    await client.query(`SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 8) FROM products));`);
    console.log("Products seeded successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
