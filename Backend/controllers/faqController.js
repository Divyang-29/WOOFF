const {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
} = require("../models/faqModel");

// Get All FAQs (Public)
const getAllFaqsHandler = async (req, res) => {
  try {
    const faqs = await getAllFaqs();
    return res.status(200).json({
      success: true,
      count: faqs.length,
      faqs,
    });
  } catch (error) {
    console.error("Get FAQs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
    });
  }
};

// Get FAQ By ID
const getFaqByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await getFaqById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      faq,
    });
  } catch (error) {
    console.error("Get FAQ By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ",
    });
  }
};

// Create FAQ Handler (Admin)
const createFaqHandler = async (req, res) => {
  try {
    const { question, answer, display_order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Both question and answer are required",
      });
    }

    const newFaq = await createFaq({
      question: question.trim(),
      answer: answer.trim(),
      display_order: display_order ? parseInt(display_order, 10) : 0,
    });

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      faq: newFaq,
    });
  } catch (error) {
    console.error("Create FAQ Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create FAQ",
    });
  }
};

// Update FAQ Handler (Admin)
const updateFaqHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getFaqById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    const updated = await updateFaq(id, req.body);

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      faq: updated,
    });
  } catch (error) {
    console.error("Update FAQ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ",
    });
  }
};

// Delete FAQ Handler (Admin)
const deleteFaqHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteFaq(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete FAQ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ",
    });
  }
};

module.exports = {
  getAllFaqsHandler,
  getFaqByIdHandler,
  createFaqHandler,
  updateFaqHandler,
  deleteFaqHandler,
};
