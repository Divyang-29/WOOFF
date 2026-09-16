const {
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../models/blogModel");

// Get All Blogs (Public) - ordered newest first
const getAllBlogsHandler = async (req, res) => {
  try {
    const blogs = await getAllBlogs();
    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("Get Blogs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message,
    });
  }
};

// Get Blog By Slug (Public) - GET /api/blogs/:slug
const getBlogBySlugHandler = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug parameter is required",
      });
    }

    let blog = await getBlogBySlug(slug);

    // Fallback if parameter is numeric ID
    if (!blog && /^\d+$/.test(slug)) {
      blog = await getBlogById(slug);
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Get Blog By Slug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

// Get Blog By ID (Public)
const getBlogByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Get Blog By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

// Create Blog Handler
const createBlogHandler = async (req, res) => {
  try {
    const { title, slug, content, image_url, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and author are required fields",
      });
    }

    const newBlog = await createBlog({
      title: title.trim(),
      slug: slug ? slug.trim() : null,
      content: content.trim(),
      image_url: image_url || null,
      author: author.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Create Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

// Update Blog Handler
const updateBlogHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getBlogById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const updated = await updateBlog(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog: updated,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

// Delete Blog Handler
const deleteBlogHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteBlog(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBlogsHandler,
  getBlogBySlugHandler,
  getBlogByIdHandler,
  createBlogHandler,
  updateBlogHandler,
  deleteBlogHandler,
};
