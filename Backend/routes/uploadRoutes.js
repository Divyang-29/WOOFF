const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration with unguessable random names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `asset-${Date.now()}-${randomHex}${ext}`);
  },
});

// File Filter: Strictly JPG, JPEG, PNG, WEBP (SVG explicitly forbidden due to XSS vectors)
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (ALLOWED_EXTENSIONS.has(ext) && ALLOWED_MIME_TYPES.has(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP image files are allowed. SVG and executable formats are strictly forbidden.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (sufficient for high-res 3D assets/photos)
});

const cloudinary = require('../config/cloudinary');

// Upload Single Image Endpoint POST /api/upload (Protected by Auth & Admin Role)
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading image file',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file was provided. Please select a JPG, JPEG, PNG, or WEBP file.',
      });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    let imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    // If Cloudinary credentials exist, upload to Cloudinary CDN for persistent global delivery
    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinary) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'wooff_assets',
          resource_type: 'image',
        });
        if (uploadResult && uploadResult.secure_url) {
          imageUrl = uploadResult.secure_url;
        }
      } catch (cloudErr) {
        console.warn('[Upload] Cloudinary upload notice, serving locally:', cloudErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Asset uploaded successfully!',
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  });
});

module.exports = router;
