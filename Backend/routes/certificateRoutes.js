const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createCertificateHandler,
  getAllCertificatesHandler,
  getCertificateBySlugOrIdHandler,
  updateCertificateHandler,
  deleteCertificateHandler,
} = require("../controllers/certificateController");

const router = express.Router();

// Middleware to normalize upload.fields to req.file for convenience
const handleFileUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

const normalizeFile = (req, res, next) => {
  if (req.files) {
    req.file =
      req.files.image?.[0] ||
      req.files.certificate?.[0] ||
      req.files.file?.[0] ||
      null;
  }
  next();
};

// Public routes
router.get("/", getAllCertificatesHandler);
router.get("/:slugOrId", getCertificateBySlugOrIdHandler);

// Protected Admin routes
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  handleFileUpload,
  normalizeFile,
  createCertificateHandler
);

router.put(
  "/:slugOrId",
  authMiddleware,
  adminMiddleware,
  handleFileUpload,
  normalizeFile,
  updateCertificateHandler
);

router.delete("/:slugOrId", authMiddleware, adminMiddleware, deleteCertificateHandler);

module.exports = router;
