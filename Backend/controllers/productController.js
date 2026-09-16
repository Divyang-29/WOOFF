const {
  createProduct,
  getProductBySlugOrId,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addProductReview,
} = require("../models/productModel");

// Create Product Handler (Admin Only - Category Required)
const createProductHandler = async (req, res) => {
  try {
    const {
      category_id,
      title,
      slug,
      price,
      final_price,
      primary_image: bodyPrimaryImage,
      description,
      stock,
      sku,
      estimated_delivery,
      is_bestseller,
    } = req.body;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "category_id is required. Every product must be assigned to an existing category.",
      });
    }

    if (!title || !price || !final_price || !sku) {
      return res.status(400).json({
        success: false,
        message: "Title, price, final_price, and SKU are required.",
      });
    }

    // Process primary image from file upload or body URL
    let primary_image = bodyPrimaryImage || null;
    if (req.files && req.files.primary_image && req.files.primary_image[0]) {
      primary_image = req.files.primary_image[0].path || req.files.primary_image[0].secure_url;
    }

    if (!primary_image) {
      return res.status(400).json({
        success: false,
        message: "Primary image is required (upload file or provide URL).",
      });
    }

    // Process gallery images (up to 5 images)
    let images = [];
    if (req.files && req.files.images && Array.isArray(req.files.images)) {
      images = req.files.images.map((f) => f.path || f.secure_url);
    } else if (req.body.images) {
      images = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
    }

    // Process key ingredients array
    let ingredients = [];
    if (req.body.ingredients) {
      ingredients = typeof req.body.ingredients === "string" ? JSON.parse(req.body.ingredients) : req.body.ingredients;
    }

    // Process FAQs array
    let faqs = [];
    if (req.body.faqs) {
      faqs = typeof req.body.faqs === "string" ? JSON.parse(req.body.faqs) : req.body.faqs;
    }

    const product = await createProduct({
      category_id: parseInt(category_id),
      title: title.trim(),
      slug,
      price: parseFloat(price),
      final_price: parseFloat(final_price),
      primary_image,
      images,
      description: description ? description.trim() : null,
      stock: stock ? parseInt(stock) : 0,
      sku: sku.trim(),
      estimated_delivery: estimated_delivery ? estimated_delivery.trim() : "2-4 business days",
      ingredients,
      faqs,
      is_bestseller: is_bestseller === "true" || is_bestseller === true,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error.message);
    const isValidationError =
      error.message.includes("category_id") ||
      error.message.includes("Category does not exist");

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to create product.",
    });
  }
};

// Get All Products Listing with Search, Filtering, Sorting, and Pagination (Public)
const getAllProductsHandler = async (req, res) => {
  try {
    const {
      category,
      category_id,
      search,
      sort,
      page,
      limit,
      include_inactive,
    } = req.query;

    const targetCategory = category || category_id || null;
    const isAdmin = req.user && req.user.role === "admin";
    const includeInactive = isAdmin && include_inactive === "true";

    const result = await getAllProducts({
      category: targetCategory,
      search,
      sort: sort || "popular",
      page: page || 1,
      limit: limit || 20,
      includeInactive,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

// Get Product Page Details Payload (Public)
const getProductDetailsHandler = async (req, res) => {
  try {
    const { slugOrId, slug } = req.params;
    const targetIdentifier = slug || slugOrId;

    const product = await getProductBySlugOrId(targetIdentifier);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product details.",
    });
  }
};

// Update Product Handler (Admin Only)
const updateProductHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getProductBySlugOrId(id, true);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const updateData = { ...req.body };

    if (req.body.is_bestseller !== undefined) {
      updateData.is_bestseller = req.body.is_bestseller === "true" || req.body.is_bestseller === true;
    }

    if (req.files && req.files.primary_image && req.files.primary_image[0]) {
      updateData.primary_image = req.files.primary_image[0].path || req.files.primary_image[0].secure_url;
    }

    if (req.files && req.files.images && Array.isArray(req.files.images)) {
      updateData.images = req.files.images.map((f) => f.path || f.secure_url);
    }

    const updated = await updateProduct(parseInt(id), updateData);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updated,
    });
  } catch (error) {
    console.error("Update Product Error:", error.message);
    const isValidationError = error.message.includes("category_id");
    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to update product.",
    });
  }
};

// Soft Delete / Archive Product Handler (Admin Only)
const deleteProductHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProduct(parseInt(id));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product archived successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
};

// Add Customer Review Handler
const addReviewHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, rating, review_text } = req.body;

    if (!customer_name || !rating) {
      return res.status(400).json({
        success: false,
        message: "Customer name and rating (1-5) are required.",
      });
    }

    const numericRating = parseFloat(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5.",
      });
    }

    const review = await addProductReview(parseInt(id), {
      customer_name: customer_name.trim(),
      rating: numericRating,
      review_text: review_text ? review_text.trim() : null,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    console.error("Add Review Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review.",
    });
  }
};

module.exports = {
  createProductHandler,
  getAllProductsHandler,
  getProductDetailsHandler,
  updateProductHandler,
  deleteProductHandler,
  addReviewHandler,
};
