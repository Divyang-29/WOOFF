const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary Storage Config supporting Images and Videos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video");
    return {
      folder: "wooff_media",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? ["mp4", "mov", "webm", "mkv", "avi"]
        : ["jpg", "png", "jpeg", "webp"],
    };
  },
});

// Multer Upload Middleware with 50MB limit to accommodate video uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

module.exports = upload;