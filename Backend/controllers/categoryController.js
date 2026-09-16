const {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = require("../models/categoryModel");

// Helper to generate slug from name
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// Create Category (Admin Only)
const createCategoryHandler = async (req, res) => {
  try {
    const { name, description } = req.body;
    let { slug } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!slug) {
      slug = generateSlug(name);
    } else {
      slug = generateSlug(slug);
    }

    // Check if category or slug exists
    const existingSlug = await getCategoryBySlug(slug);
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Category with this name or slug already exists",
      });
    }

    // Handle optional image upload (from Cloudinary/multer)
    const image_url = req.file ? (req.file.path || req.file.secure_url) : null;

    const category = await createCategory({
      name: name.trim(),
      slug,
      description: description ? description.trim() : null,
      image_url,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

// Get All Categories (Public)
const getAllCategoriesHandler = async (req, res) => {
  try {
    const categories = await getAllCategories();
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get All Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// Get Category By ID (Public)
const getCategoryByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get Category By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

// Update Category (Admin Only)
const updateCategoryHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    let { slug } = req.body;

    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (slug) {
      slug = generateSlug(slug);
    } else if (name) {
      slug = generateSlug(name);
    }

    const image_url = req.file ? (req.file.path || req.file.secure_url) : undefined;

    const updated = await updateCategory(id, {
      name: name ? name.trim() : undefined,
      slug,
      description,
      image_url,
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updated,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// Delete Category (Admin Only)
const deleteCategoryHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

module.exports = {
  createCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
};
