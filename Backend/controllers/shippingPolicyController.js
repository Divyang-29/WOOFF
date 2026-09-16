const {
  getShippingPolicy,
  upsertShippingPolicy,
} = require("../models/shippingPolicyModel");

// Get Shipping Policy (Public)
const getShippingPolicyHandler = async (req, res) => {
  try {
    const policy = await getShippingPolicy();

    if (!policy) {
      return res.status(200).json({
        success: true,
        policy: {
          title: "Shipping & Delivery Policy",
          content: "No shipping policy content has been published yet.",
          updated_at: new Date(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    console.error("Get Shipping Policy Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipping policy",
    });
  }
};

// Create or Update Shipping Policy (Admin Only)
const upsertShippingPolicyHandler = async (req, res) => {
  try {
    const { title, content, policy: policyText } = req.body;
    const policyContent = content || policyText;

    if (!policyContent) {
      return res.status(400).json({
        success: false,
        message: "Policy content is required",
      });
    }

    const updatedPolicy = await upsertShippingPolicy({
      title: title ? title.trim() : undefined,
      content: policyContent.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Shipping policy updated successfully",
      policy: updatedPolicy,
    });
  } catch (error) {
    console.error("Upsert Shipping Policy Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shipping policy",
    });
  }
};

module.exports = {
  getShippingPolicyHandler,
  upsertShippingPolicyHandler,
};
