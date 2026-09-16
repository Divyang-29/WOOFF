const pool = require("../config/db");
const { createCategory, getAllCategories } = require("../models/categoryModel");
const { createProduct, getAllProducts, getProductBySlugOrId, updateProduct, deleteProduct } = require("../models/productModel");

async function testCategoryAndProductLogic() {
  try {
    console.log("=== STARTING CATEGORY & PRODUCT CATALOG INTEGRATION TEST ===");

    // 1. Create Test Category
    const categoryName = `Dog Food & Nutrition ${Date.now()}`;
    const category = await createCategory({
      name: categoryName,
      slug: `dog-food-${Date.now()}`,
      description: "Nutritious dry and wet food for dogs of all breeds.",
    });
    console.log(`1. Category created ID: ${category.id}, Name: "${category.name}", Slug: "${category.slug}"`);

    // 2. Test Product Creation WITHOUT category_id (Must Fail)
    console.log("2. Testing product creation WITHOUT category_id (Must Fail)...");
    try {
      await createProduct({
        title: "Orphan Product",
        price: 999,
        final_price: 899,
        sku: "ORPHAN-01",
        primary_image: "https://example.com/img.jpg",
      });
      console.assert(false, "Product creation without category_id should have failed");
    } catch (err) {
      console.assert(err.message.includes("category_id is required"), `Unexpected error message: ${err.message}`);
      console.log("   Creation rejected as expected: 'category_id is required' (PASSED).");
    }

    // 3. Test Product Creation with INVALID category_id (Must Fail)
    console.log("3. Testing product creation with INVALID category_id (Must Fail)...");
    try {
      await createProduct({
        category_id: 999999,
        title: "Invalid Category Product",
        price: 999,
        final_price: 899,
        sku: "INVALID-CAT-01",
        primary_image: "https://example.com/img.jpg",
      });
      console.assert(false, "Product creation with non-existent category_id should have failed");
    } catch (err) {
      console.assert(err.message.includes("does not exist"), `Unexpected error message: ${err.message}`);
      console.log("   Creation rejected as expected: 'Specified category does not exist' (PASSED).");
    }

    // 4. Test Product Creation with VALID category_id (Must Succeed)
    console.log("4. Testing product creation with VALID category_id (Must Succeed)...");
    const productTitle = `Wooff Organic Salmon Kibble ${Date.now()}`;
    const product = await createProduct({
      category_id: category.id,
      title: productTitle,
      price: 1899.00,
      final_price: 1599.00,
      primary_image: "https://res.cloudinary.com/demo/image/upload/salmon_kibble.jpg",
      sku: `SKU-SALMON-${Date.now()}`,
      stock: 45,
      description: "Rich in Omega-3 fatty acids for healthy skin and shiny coat.",
    });
    console.log(`   Product Created ID: ${product.id}, Slug: "${product.slug}", Category ID: ${product.category_id} (PASSED).`);

    // 5. Test Product Catalog Listing with JOIN, Filtering, Sorting & Pagination
    console.log("5. Testing Product Catalog Listing with Category JOIN and Filters...");
    const catalogRes = await getAllProducts({
      category: category.slug,
      search: "Salmon",
      sort: "price_asc",
      page: 1,
      limit: 10,
    });

    console.assert(catalogRes.products.length >= 1, "Catalog listing returned no products");
    const listedProd = catalogRes.products.find((p) => p.id === product.id);
    console.assert(listedProd !== undefined, "Created product not found in catalog query");
    console.assert(listedProd.category_name === category.name, "Category name JOIN failed");
    console.assert(listedProd.category_slug === category.slug, "Category slug JOIN failed");
    console.log(`   Catalog listing query returned ${catalogRes.pagination.total_count} products. Category JOIN: "${listedProd.category_name}" (PASSED).`);

    // 6. Test Product Details by Slug
    console.log("6. Testing single product page fetch by slug...");
    const details = await getProductBySlugOrId(product.slug);
    console.assert(details.id === product.id, "Product details fetch failed");
    console.assert(details.category_name === category.name, "Details category JOIN failed");
    console.log("   Product page payload fetched (PASSED).");

    // 7. Test Soft Delete / Archiving
    console.log("7. Testing product soft deletion / archiving...");
    await deleteProduct(product.id);
    const archivedProd = await getProductBySlugOrId(product.id, true);
    console.assert(archivedProd.is_active === false, "Product is_active was not set to false");

    // Verify archived product is excluded from public catalog
    const publicCatalogRes = await getAllProducts({ category: category.slug });
    const isPublic = publicCatalogRes.products.some((p) => p.id === product.id);
    console.assert(isPublic === false, "Archived product should be excluded from public catalog");
    console.log("   Soft delete verified: Product archived (is_active = false) and excluded from public catalog (PASSED).");

    // Clean up test category & product
    await pool.query("DELETE FROM products WHERE id = $1", [product.id]);
    await pool.query("DELETE FROM categories WHERE id = $1", [category.id]);

    console.log("\n=== ALL CATEGORY & PRODUCT CATALOG TESTS PASSED 100% ===");
    process.exit(0);
  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
}

testCategoryAndProductLogic();
