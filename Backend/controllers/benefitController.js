const {
  getAllBenefits,
  getBenefitById,
  createBenefit,
  updateBenefit,
  deleteBenefit,
} = require("../models/benefitModel");

// Get All Benefits (Public)
const getAllBenefitsHandler = async (req, res) => {
  try {
    const benefits = await getAllBenefits();
    return res.status(200).json({
      success: true,
      count: benefits.length,
      benefits,
    });
  } catch (error) {
    console.error("Get Benefits Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch benefits",
    });
  }
};

// Get Benefit By ID
const getBenefitByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const benefit = await getBenefitById(id);

    if (!benefit) {
      return res.status(404).json({
        success: false,
        message: "Benefit not found",
      });
    }

    return res.status(200).json({
      success: true,
      benefit,
    });
  } catch (error) {
    console.error("Get Benefit By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch benefit",
    });
  }
};

// Create Benefit (Admin)
const createBenefitHandler = async (req, res) => {
  try {
    const { title, desc, desc_text, image, image_url, display_order } = req.body;
    const targetDesc = desc_text || desc;
    const targetImage = image_url || image;

    if (!title || !targetDesc || !targetImage) {
      return res.status(400).json({
        success: false,
        message: "Title, desc, and image are required",
      });
    }

    const newBenefit = await createBenefit({
      title: title.trim(),
      desc_text: targetDesc.trim(),
      image_url: targetImage.trim(),
      display_order: display_order ? parseInt(display_order, 10) : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Benefit created successfully",
      benefit: newBenefit,
    });
  } catch (error) {
    console.error("Create Benefit Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create benefit",
    });
  }
};

// Update Benefit (Admin)
const updateBenefitHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getBenefitById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Benefit not found",
      });
    }

    const updated = await updateBenefit(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Benefit updated successfully",
      benefit: updated,
    });
  } catch (error) {
    console.error("Update Benefit Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update benefit",
    });
  }
};

// Delete Benefit (Admin)
const deleteBenefitHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteBenefit(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Benefit not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Benefit deleted successfully",
    });
  } catch (error) {
    console.error("Delete Benefit Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete benefit",
    });
  }
};

module.exports = {
  getAllBenefitsHandler,
  getBenefitByIdHandler,
  createBenefitHandler,
  updateBenefitHandler,
  deleteBenefitHandler,
};
