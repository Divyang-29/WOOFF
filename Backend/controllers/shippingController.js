const { getShiprocketAuthToken } = require("../services/shiprocketFulfillmentService");

const SHIPROCKET_SERVICEABILITY_URL =
  "https://apiv2.shiprocket.in/v1/external/courier/serviceability/";

/**
 * Controller to estimate delivery timeline via Shiprocket Courier Serviceability API
 * Route: GET /api/shipping/estimate/:pincode
 */
async function getDeliveryEstimateHandler(req, res) {
  try {
    const rawPincode = req.params.pincode;
    const destinationPincode = String(rawPincode || "")
      .trim()
      .replace(/\D/g, "");

    // Validate 6-digit Indian postal code format
    if (!/^[1-9][0-9]{5}$/.test(destinationPincode)) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: "Please enter a valid 6-digit postal pincode.",
      });
    }

    const pickupPincode =
      process.env.SHIPROCKET_PICKUP_PINCODE || "382481";
    const weight = req.query.weight ? parseFloat(req.query.weight) : 0.15;
    const cod = 0;

    // Fetch cached or fresh Shiprocket JWT
    const token = await getShiprocketAuthToken();
    if (!token) {
      return res.status(500).json({
        success: false,
        serviceable: false,
        message: "Logistics authentication unavailable. Please check credentials.",
      });
    }

    // Build URL with query params
    const serviceabilityUrl = new URL(SHIPROCKET_SERVICEABILITY_URL);
    serviceabilityUrl.searchParams.set("pickup_postcode", pickupPincode);
    serviceabilityUrl.searchParams.set("delivery_postcode", destinationPincode);
    serviceabilityUrl.searchParams.set("weight", String(weight));
    serviceabilityUrl.searchParams.set("cod", String(cod));

    const apiResponse = await fetch(serviceabilityUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await apiResponse.json().catch(() => ({}));

    // Check if Shiprocket returned courier serviceability list
    const couriers = data?.data?.available_courier_companies;

    if (!apiResponse.ok || !Array.isArray(couriers) || couriers.length === 0) {
      const errorMsg =
        data?.message ||
        data?.error ||
        "Delivery is not currently available for this pincode.";
      return res.status(200).json({
        success: false,
        serviceable: false,
        pincode: destinationPincode,
        message: errorMsg,
      });
    }

    // Filter couriers with valid delivery info and sort to find fastest ETD
    const validCouriers = couriers.filter(
      (c) => c && (c.etd || c.etd_hours || c.estimated_delivery_days)
    );

    if (validCouriers.length === 0) {
      return res.status(200).json({
        success: false,
        serviceable: false,
        pincode: destinationPincode,
        message: "No active courier schedules available for this pincode.",
      });
    }

    validCouriers.sort((a, b) => {
      const aHours =
        Number(a.etd_hours) ||
        (Number(a.estimated_delivery_days) ? Number(a.estimated_delivery_days) * 24 : 9999);
      const bHours =
        Number(b.etd_hours) ||
        (Number(b.estimated_delivery_days) ? Number(b.estimated_delivery_days) * 24 : 9999);
      return aHours - bHours;
    });

    const fastest = validCouriers[0];
    const estimatedDays =
      Number(fastest.estimated_delivery_days) ||
      (fastest.etd_hours ? Math.round(Number(fastest.etd_hours) / 24) : null);

    // Calculate delivery buffer range (+3 days to +5 days buffer for unexpected courier delays)
    // E.g. if expected date is 2, displays 5 to 7 (or "Oct 14 to 16, 2026")
    const bufferedEtd = formatBufferedDeliveryWindow(fastest.etd, estimatedDays);

    return res.status(200).json({
      success: true,
      serviceable: true,
      pincode: destinationPincode,
      etd: bufferedEtd,
      raw_etd: fastest.etd,
      estimated_delivery_days: estimatedDays ? estimatedDays + 3 : null,
      courier_name: fastest.courier_name,
      city: fastest.city,
      state: fastest.state,
      message: `Expected delivery: ${bufferedEtd}`,
    });
  } catch (error) {
    console.error("[Shipping Estimate Error]:", error);
    return res.status(500).json({
      success: false,
      serviceable: false,
      message: "Unable to calculate delivery estimate at this time. Please try again later.",
      error: error.message,
    });
  }
}

/**
 * Calculates buffered delivery window to account for transit delays
 * @param {string} baseEtdStr - E.g. "Oct 11, 2026"
 * @param {number} baseDays - Estimated business days
 * @returns {string} E.g. "Oct 14 to 16, 2026"
 */
function formatBufferedDeliveryWindow(baseEtdStr, baseDays) {
  let baseDate = null;
  if (baseEtdStr) {
    const parsed = new Date(baseEtdStr);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
  }

  if (!baseDate) {
    baseDate = new Date();
    const daysToAdd = Number(baseDays) || 2;
    baseDate.setDate(baseDate.getDate() + daysToAdd);
  }

  const minDate = new Date(baseDate);
  minDate.setDate(minDate.getDate() + 3);

  const maxDate = new Date(baseDate);
  maxDate.setDate(maxDate.getDate() + 5);

  const startMonth = minDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = maxDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = minDate.getDate();
  const endDay = maxDate.getDate();
  const year = maxDate.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} to ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} to ${endMonth} ${endDay}, ${year}`;
}

module.exports = {
  getDeliveryEstimateHandler,
};
