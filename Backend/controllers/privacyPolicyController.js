const {
  getPrivacyPolicy,
  upsertPrivacyPolicy,
} = require("../models/privacyPolicyModel");

// Get Privacy Policy (Public)
const getPrivacyPolicyHandler = async (req, res) => {
  try {
    const policy = await getPrivacyPolicy();

    if (!policy) {
      return res.status(200).json({
        success: true,
        policy: {
          title: "Privacy Policy",
          content: "No privacy policy content has been published yet.",
          updated_at: new Date(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    console.error("Get Privacy Policy Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch privacy policy",
    });
  }
};

// Create or Update Privacy Policy (Admin Only)
const upsertPrivacyPolicyHandler = async (req, res) => {
  try {
    const { title, content, policy: policyText } = req.body;
    const policyContent = content || policyText;

    if (!policyContent) {
      return res.status(400).json({
        success: false,
        message: "Policy content is required",
      });
    }

    const updatedPolicy = await upsertPrivacyPolicy({
      title: title ? title.trim() : undefined,
      content: policyContent.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Privacy policy updated successfully",
      policy: updatedPolicy,
    });
  } catch (error) {
    console.error("Upsert Privacy Policy Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update privacy policy",
    });
  }
};

module.exports = {
  getPrivacyPolicyHandler,
  upsertPrivacyPolicyHandler,
};
