const {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} = require("../models/testimonialModel");

// Create Testimonial Handler (Rating, Text, Author)
const createTestimonialHandler = async (req, res) => {
  try {
    const { rating, text, testimonial, review, author, author_name } = req.body;
    const targetText = text || testimonial || review;
    const targetAuthor = author || author_name;

    if (!targetText || !targetAuthor) {
      return res.status(400).json({
        success: false,
        message: "Both 'text' and 'author' are required",
      });
    }

    const numericRating = rating !== undefined ? parseFloat(rating) : 5.0;
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    const newTestimonial = await createTestimonial({
      rating: numericRating,
      text: targetText.trim(),
      author: targetAuthor.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      testimonial: newTestimonial,
    });
  } catch (error) {
    console.error("Create Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create testimonial",
    });
  }
};

// Get All Testimonials (Public)
const getAllTestimonialsHandler = async (req, res) => {
  try {
    const testimonials = await getAllTestimonials();
    return res.status(200).json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error("Get Testimonials Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
    });
  }
};

// Update Testimonial Handler (Admin)
const updateTestimonialHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getTestimonialById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const updated = await updateTestimonial(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial: updated,
    });
  } catch (error) {
    console.error("Update Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update testimonial",
    });
  }
};

// Delete Testimonial Handler (Admin)
const deleteTestimonialHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTestimonial(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Delete Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
    });
  }
};

module.exports = {
  createTestimonialHandler,
  getAllTestimonialsHandler,
  updateTestimonialHandler,
  deleteTestimonialHandler,
};
