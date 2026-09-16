const {
  getAllPillars,
  getPillarById,
  createPillar,
  updatePillar,
  deletePillar,
} = require("../models/pillarModel");

// Get All Pillars (Public)
const getAllPillarsHandler = async (req, res) => {
  try {
    const pillars = await getAllPillars();
    return res.status(200).json({
      success: true,
      count: pillars.length,
      pillars,
    });
  } catch (error) {
    console.error("Get Pillars Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pillars",
    });
  }
};

// Get Pillar By ID
const getPillarByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const pillar = await getPillarById(id);

    if (!pillar) {
      return res.status(404).json({
        success: false,
        message: "Pillar not found",
      });
    }

    return res.status(200).json({
      success: true,
      pillar,
    });
  } catch (error) {
    console.error("Get Pillar By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pillar",
    });
  }
};

// Create Pillar (Admin)
const createPillarHandler = async (req, res) => {
  try {
    const { title, desc, desc_text, icon, display_order } = req.body;
    const targetDesc = desc_text || desc;

    if (!title || !targetDesc || !icon) {
      return res.status(400).json({
        success: false,
        message: "Title, desc, and icon are required",
      });
    }

    const newPillar = await createPillar({
      title: title.trim(),
      desc_text: targetDesc.trim(),
      icon: icon.trim(),
      display_order: display_order ? parseInt(display_order, 10) : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Pillar created successfully",
      pillar: newPillar,
    });
  } catch (error) {
    console.error("Create Pillar Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create pillar",
    });
  }
};

// Update Pillar (Admin)
const updatePillarHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getPillarById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Pillar not found",
      });
    }

    const updated = await updatePillar(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Pillar updated successfully",
      pillar: updated,
    });
  } catch (error) {
    console.error("Update Pillar Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update pillar",
    });
  }
};

// Delete Pillar (Admin)
const deletePillarHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deletePillar(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Pillar not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pillar deleted successfully",
    });
  } catch (error) {
    console.error("Delete Pillar Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete pillar",
    });
  }
};

module.exports = {
  getAllPillarsHandler,
  getPillarByIdHandler,
  createPillarHandler,
  updatePillarHandler,
  deletePillarHandler,
};
