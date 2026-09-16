const {
  createVideoReel,
  getAllVideoReels,
  getVideoReelById,
  updateVideoReel,
  deleteVideoReel,
} = require("../models/videoModel");
const { getProductBySlugOrId } = require("../models/productModel");

// Create Video Reel Handler (Admin)
const createVideoReelHandler = async (req, res) => {
  try {
    const { product_id, video_url: bodyVideoUrl, product_name, product_photo: bodyProductPhoto, price } = req.body;

    let targetVideoUrl = bodyVideoUrl || null;
    let targetPhoto = bodyProductPhoto || null;
    let targetName = product_name || null;
    let targetPrice = price !== undefined ? parseFloat(price) : null;
    let targetProductId = product_id ? parseInt(product_id) : null;

    // Handle file upload for video if present
    if (req.files && req.files.video && req.files.video[0]) {
      targetVideoUrl = req.files.video[0].path || req.files.video[0].secure_url;
    }

    // Handle file upload for product photo thumbnail if present
    if (req.files && req.files.product_photo && req.files.product_photo[0]) {
      targetPhoto = req.files.product_photo[0].path || req.files.product_photo[0].secure_url;
    }

    // Auto-fill from product if product_id is provided
    if (targetProductId) {
      const linkedProduct = await getProductBySlugOrId(targetProductId);
      if (linkedProduct) {
        if (!targetName) targetName = linkedProduct.title;
        if (!targetPhoto) targetPhoto = linkedProduct.primary_image;
        if (targetPrice === null || isNaN(targetPrice)) targetPrice = parseFloat(linkedProduct.final_price || linkedProduct.price);
      }
    }

    if (!targetVideoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video file upload or video_url is required",
      });
    }

    if (!targetName || !targetPhoto || targetPrice === null || isNaN(targetPrice)) {
      return res.status(400).json({
        success: false,
        message: "Product name, product photo, and price are required",
      });
    }

    const videoReel = await createVideoReel({
      product_id: targetProductId,
      video_url: targetVideoUrl,
      product_name: targetName.trim(),
      product_photo: targetPhoto,
      price: targetPrice,
    });

    return res.status(201).json({
      success: true,
      message: "Video reel created successfully",
      video: videoReel,
    });
  } catch (error) {
    console.error("Create Video Reel Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create video reel",
    });
  }
};

// Get All Video Reels (Public)
const getAllVideoReelsHandler = async (req, res) => {
  try {
    const videos = await getAllVideoReels();
    return res.status(200).json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("Get Video Reels Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch video reels",
    });
  }
};

// Update Video Reel Handler (Admin)
const updateVideoReelHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getVideoReelById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Video reel not found",
      });
    }

    const updateData = { ...req.body };

    if (req.files && req.files.video && req.files.video[0]) {
      updateData.video_url = req.files.video[0].path || req.files.video[0].secure_url;
    }

    if (req.files && req.files.product_photo && req.files.product_photo[0]) {
      updateData.product_photo = req.files.product_photo[0].path || req.files.product_photo[0].secure_url;
    }

    const updated = await updateVideoReel(id, updateData);

    return res.status(200).json({
      success: true,
      message: "Video reel updated successfully",
      video: updated,
    });
  } catch (error) {
    console.error("Update Video Reel Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update video reel",
    });
  }
};

// Delete Video Reel Handler (Admin)
const deleteVideoReelHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteVideoReel(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Video reel not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Video reel deleted successfully",
    });
  } catch (error) {
    console.error("Delete Video Reel Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete video reel",
    });
  }
};

module.exports = {
  createVideoReelHandler,
  getAllVideoReelsHandler,
  updateVideoReelHandler,
  deleteVideoReelHandler,
};
