const {
  createCertificate,
  getAllCertificates,
  getCertificateBySlugOrId,
  updateCertificate,
  deleteCertificate,
} = require("../models/certificateModel");

// Create Certificate Handler (Admin)
const createCertificateHandler = async (req, res) => {
  try {
    const { title, slug, product_id, product_slug, description } = req.body;
    let image_url = req.body.image_url || req.body.image;

    // Handle image upload from multer/Cloudinary
    if (req.file) {
      image_url = req.file.path || req.file.secure_url;
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Certificate title is required",
      });
    }

    if (!image_url) {
      return res.status(400).json({
        success: false,
        message: "Certificate image is required (upload file or provide image_url)",
      });
    }

    const certificate = await createCertificate({
      title: title.trim(),
      slug: slug ? slug.trim() : undefined,
      product_id: product_id ? parseInt(product_id, 10) : undefined,
      product_slug: product_slug ? product_slug.trim() : undefined,
      image_url,
      description: description ? description.trim() : null,
    });

    return res.status(201).json({
      success: true,
      message: "Certificate created successfully",
      certificate,
    });
  } catch (error) {
    console.error("Create Certificate Error:", error);
    if (error.code === "23505") { // Unique violation for slug
      return res.status(400).json({
        success: false,
        message: "A certificate with this slug or title already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create certificate",
    });
  }
};

// Get All Certificates (Public, supports filtering by product_id or product_slug)
const getAllCertificatesHandler = async (req, res) => {
  try {
    const { product_id, product_slug } = req.query;
    const certificates = await getAllCertificates({ product_id, product_slug });
    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Get Certificates Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
    });
  }
};

// Get Certificate By Slug or ID (Public, for SEO routing)
const getCertificateBySlugOrIdHandler = async (req, res) => {
  try {
    const identifier = req.params.slugOrId || req.params.id;
    const certificate = await getCertificateBySlugOrId(identifier);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    return res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Get Certificate By Slug/ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificate",
    });
  }
};

// Update Certificate Handler (Admin)
const updateCertificateHandler = async (req, res) => {
  try {
    const identifier = req.params.slugOrId || req.params.id;
    const existing = await getCertificateBySlugOrId(identifier);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const { title, slug, product_id, product_slug, description } = req.body;
    let image_url = req.body.image_url || req.body.image;
    if (req.file) {
      image_url = req.file.path || req.file.secure_url;
    }

    const updated = await updateCertificate(existing.id, {
      title: title !== undefined ? title.trim() : undefined,
      slug: slug !== undefined ? slug.trim() : undefined,
      product_id: product_id !== undefined ? (product_id ? parseInt(product_id, 10) : null) : undefined,
      product_slug: product_slug !== undefined ? (product_slug ? product_slug.trim() : null) : undefined,
      image_url: image_url !== undefined ? image_url : undefined,
      description: description !== undefined ? description.trim() : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Certificate updated successfully",
      certificate: updated,
    });
  } catch (error) {
    console.error("Update Certificate Error:", error);
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "A certificate with this slug or title already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update certificate",
    });
  }
};

// Delete Certificate Handler (Admin)
const deleteCertificateHandler = async (req, res) => {
  try {
    const identifier = req.params.slugOrId || req.params.id;
    const existing = await getCertificateBySlugOrId(identifier);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const deleted = await deleteCertificate(existing.id);

    return res.status(200).json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Delete Certificate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete certificate",
    });
  }
};

module.exports = {
  createCertificateHandler,
  getAllCertificatesHandler,
  getCertificateBySlugOrIdHandler,
  updateCertificateHandler,
  deleteCertificateHandler,
};
