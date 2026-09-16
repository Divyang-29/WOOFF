const {
  getTermsAndConditions,
  upsertTermsAndConditions,
} = require("../models/termsModel");

// Get Terms & Conditions (Public)
const getTermsHandler = async (req, res) => {
  try {
    const terms = await getTermsAndConditions();

    if (!terms) {
      return res.status(200).json({
        success: true,
        terms: {
          title: "Terms & Conditions",
          content: "No terms & conditions content has been published yet.",
          updated_at: new Date(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      terms,
    });
  } catch (error) {
    console.error("Get Terms & Conditions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch terms & conditions",
    });
  }
};

// Create or Update Terms & Conditions (Admin Only)
const upsertTermsHandler = async (req, res) => {
  try {
    const { title, content, terms: termsText } = req.body;
    const termsContent = content || termsText;

    if (!termsContent) {
      return res.status(400).json({
        success: false,
        message: "Terms content is required",
      });
    }

    const updatedTerms = await upsertTermsAndConditions({
      title: title ? title.trim() : undefined,
      content: termsContent.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Terms & Conditions updated successfully",
      terms: updatedTerms,
    });
  } catch (error) {
    console.error("Upsert Terms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update terms & conditions",
    });
  }
};

module.exports = {
  getTermsHandler,
  upsertTermsHandler,
};
