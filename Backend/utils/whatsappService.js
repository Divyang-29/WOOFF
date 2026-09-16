/**
 * WhatsApp API Utility
 * Supports sending 6-digit OTPs via Meta WhatsApp Cloud API or Twilio WhatsApp API.
 * Includes a Console/Mock fallback when credentials are not configured.
 */

const sendWhatsAppOTP = async (phoneNumber, otp) => {
  const metaToken = process.env.WHATSAPP_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  const messageText = `Your Wooff verification code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;

  // 1. Meta WhatsApp Cloud API Integration
  if (metaToken && metaPhoneId) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${metaPhoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${metaToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phoneNumber.replace(/[^0-9]/g, ""),
            type: "text",
            text: { body: messageText },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Meta WhatsApp API Error:", data);
        throw new Error(data.error?.message || "Failed to send WhatsApp message via Meta Cloud API");
      }

      console.log(`[WhatsApp API] OTP sent successfully to ${phoneNumber} via Meta Cloud API.`);
      return { success: true, provider: "Meta Cloud API", messageId: data.messages?.[0]?.id };
    } catch (error) {
      console.error("WhatsApp Cloud API Exception:", error.message);
      throw error;
    }
  }

  // 2. Twilio WhatsApp API Integration
  if (twilioSid && twilioAuthToken && twilioNumber) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");
      const params = new URLSearchParams();
      params.append("From", `whatsapp:${twilioNumber}`);
      params.append("To", `whatsapp:${phoneNumber}`);
      params.append("Body", messageText);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Twilio WhatsApp Error:", data);
        throw new Error(data.message || "Failed to send WhatsApp message via Twilio");
      }

      console.log(`[WhatsApp API] OTP sent successfully to ${phoneNumber} via Twilio.`);
      return { success: true, provider: "Twilio", messageId: data.sid };
    } catch (error) {
      console.error("Twilio WhatsApp Exception:", error.message);
      throw error;
    }
  }

  // 3. Fallback Development Mode (Logs OTP to console when no API credentials set)
  console.log("\n=======================================================");
  console.log(`[DEV MODE - WHATSAPP API] Verification OTP for ${phoneNumber}`);
  console.log(`[DEV MODE - WHATSAPP API] 6-Digit OTP Code: ${otp}`);
  console.log("=======================================================\n");

  return {
    success: true,
    provider: "Console (Dev Mode)",
    otp,
  };
};

module.exports = {
  sendWhatsAppOTP,
};
