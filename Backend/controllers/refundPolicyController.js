const {
  getRefundPolicy,
  upsertRefundPolicy,
} = require("../models/refundPolicyModel");

// Get Refund Policy (Public)
const getRefundPolicyHandler = async (req, res) => {
  try {
    const policy = await getRefundPolicy();

    if (!policy) {
      return res.status(200).json({
        success: true,
        policy: {
          title: "Refund & Return Policy",
          content: "No refund policy content has been published yet.",
          updated_at: new Date(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    console.error("Get Refund Policy Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch refund policy",
    });
  }
};

// Create or Update Refund Policy (Admin Only)
const upsertRefundPolicyHandler = async (req, res) => {
  try {
    const { title, content, policy: policyText } = req.body;
    const policyContent = content || policyText;

    if (!policyContent) {
      return res.status(400).json({
        success: false,
        message: "Policy content is required",
      });
    }

    const updatedPolicy = await upsertRefundPolicy({
      title: title ? title.trim() : undefined,
      content: policyContent.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Refund policy updated successfully",
      policy: updatedPolicy,
    });
  } catch (error) {
    console.error("Upsert Refund Policy Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update refund policy",
    });
  }
};

module.exports = {
  getRefundPolicyHandler,
  upsertRefundPolicyHandler,
};
