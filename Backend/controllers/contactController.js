const {
  createContactMessage,
  getAllContactMessages,
  deleteContactMessage,
} = require("../models/contactModel");

// Submit Contact Us Message (Public)
const submitContactHandler = async (req, res) => {
  try {
    const { name, email, subject, phone_number, phone, message } = req.body;
    const targetPhone = (phone_number || phone || "").trim();
    const targetSubject = (subject || "").trim();

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const contactData = await createContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: targetSubject,
      phone_number: targetPhone,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for contacting us! We have received your message and will respond shortly.",
      contact: contactData,
    });
  } catch (error) {
    console.error("Submit Contact Us Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit contact message. Please try again later.",
    });
  }
};

// Get All Contact Messages (Admin Only)
const getAllContactMessagesHandler = async (req, res) => {
  try {
    const messages = await getAllContactMessages();
    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get Contact Messages Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages",
    });
  }
};

// Delete Contact Message (Admin Only)
const deleteContactMessageHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteContactMessage(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contact Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message",
    });
  }
};

module.exports = {
  submitContactHandler,
  getAllContactMessagesHandler,
  deleteContactMessageHandler,
};
