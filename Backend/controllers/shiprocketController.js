const crypto = require("crypto");
const https = require("https");
const pool = require("../config/db");

const SHIPROCKET_API_KEY = process.env.SHIPROCKET_CHECKOUT_API_KEY || "bZfz2R7b6m8ukacm";
const SHIPROCKET_SECRET_KEY = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY || "YcssswKA3BhRv3k93XwhgAkOS2dh9uub";
const SHIPROCKET_API_HOST = "checkout-api.shiprocket.com";

/**
 * Helper to make signed HTTPS request to Shiprocket Checkout API
 */
function sendShiprocketRequest(endpoint, bodyObj) {
  return new Promise((resolve, reject) => {
    const rawBody = JSON.stringify(bodyObj);
    const hmac = crypto
      .createHmac("sha256", SHIPROCKET_SECRET_KEY)
      .update(rawBody)
      .digest("base64");

    const options = {
      hostname: SHIPROCKET_API_HOST,
      path: endpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": SHIPROCKET_API_KEY,
        "X-Api-HMAC-SHA256": hmac,
        "Content-Length": Buffer.byteLength(rawBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(rawBody);
    req.end();
  });
}

/**
 * 1. Fetch Products Catalog for Shiprocket Sync
 * GET /api/shiprocket/catalog/products?page=1&limit=100
 */
exports.getProductsCatalog = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(250, parseInt(req.query.limit, 10) || 100));
    const offset = (page - 1) * limit;

    const countRes = await pool.query("SELECT COUNT(*) FROM products");
    const total = parseInt(countRes.rows[0].count, 10);

    const productsRes = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       ORDER BY p.id ASC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const baseUrl = process.env.FRONTEND_URL || "https://wooff-frontend.onrender.com";

    const mappedProducts = productsRes.rows.map((p) => {
      let imageUrl = p.primary_image || "";
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
      }

      const priceStr = parseFloat(p.final_price || p.price || 0).toFixed(2);
      const comparePriceStr = parseFloat(p.price || p.final_price || 0).toFixed(2);
      const createdAt = p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString();
      const updatedAt = p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString();

      return {
        id: p.id,
        title: p.title || "",
        body_html: p.description ? `<p>${p.description}</p>` : "",
        vendor: "Wooff",
        product_type: p.category_name || "Pet Care",
        created_at: createdAt,
        handle: p.slug || `product-${p.id}`,
        updated_at: updatedAt,
        tags: "Pet Care, Toothpaste, Dental",
        status: "active",
        variants: [
          {
            id: p.id,
            title: p.title || "Default Title",
            price: priceStr,
            compare_at_price: comparePriceStr,
            sku: p.sku || `WOOFF-${p.id}`,
            quantity: p.stock !== null && p.stock !== undefined ? Number(p.stock) : 100,
            created_at: createdAt,
            updated_at: updatedAt,
            taxable: true,
            option_values: {
              Title: "Default",
            },
            grams: 100,
            image: {
              src: imageUrl,
            },
            weight: 0.1,
            weight_unit: "kg",
          },
        ],
        image: {
          src: imageUrl,
        },
        options: [
          {
            name: "Title",
            values: ["Default"],
          },
        ],
      };
    });

    return res.status(200).json({
      data: {
        total,
        products: mappedProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Fetch Collections Catalog for Shiprocket Sync
 * GET /api/shiprocket/catalog/collections?page=1&limit=100
 */
exports.getCollectionsCatalog = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(250, parseInt(req.query.limit, 10) || 100));
    const offset = (page - 1) * limit;

    const countRes = await pool.query("SELECT COUNT(*) FROM categories");
    const total = parseInt(countRes.rows[0].count, 10);

    const catRes = await pool.query(
      `SELECT * FROM categories ORDER BY id ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const baseUrl = process.env.FRONTEND_URL || "https://wooff-frontend.onrender.com";

    const mappedCollections = catRes.rows.map((c) => {
      let imageUrl = c.image_url || "";
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
      }

      return {
        id: c.id,
        updated_at: c.updated_at ? new Date(c.updated_at).toISOString() : new Date().toISOString(),
        body_html: c.description ? `<p>${c.description}</p>` : "",
        handle: c.slug || `category-${c.id}`,
        image: {
          src: imageUrl,
        },
        title: c.name || "",
        created_at: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return res.status(200).json({
      data: {
        total,
        collections: mappedCollections,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Fetch Products by Collection for Shiprocket Sync
 * GET /api/shiprocket/catalog/collection-products?collection_id=1234&page=1&limit=100
 */
exports.getProductsByCollection = async (req, res, next) => {
  try {
    const collectionId = req.query.collection_id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(250, parseInt(req.query.limit, 10) || 100));
    const offset = (page - 1) * limit;

    let countQuery = "SELECT COUNT(*) FROM products";
    let prodQuery = `SELECT p.*, c.name as category_name, c.slug as category_slug 
                     FROM products p 
                     LEFT JOIN categories c ON p.category_id = c.id`;
    const params = [];

    if (collectionId) {
      countQuery += " WHERE category_id = $1";
      prodQuery += " WHERE p.category_id = $1";
      params.push(collectionId);
    }

    const countRes = await pool.query(countQuery, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const queryParams = collectionId ? [collectionId, limit, offset] : [limit, offset];
    const limitClause = collectionId ? " ORDER BY p.id ASC LIMIT $2 OFFSET $3" : " ORDER BY p.id ASC LIMIT $1 OFFSET $2";

    const productsRes = await pool.query(prodQuery + limitClause, queryParams);
    const baseUrl = process.env.FRONTEND_URL || "https://wooff-frontend.onrender.com";

    const mappedProducts = productsRes.rows.map((p) => {
      let imageUrl = p.primary_image || "";
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
      }

      const priceStr = parseFloat(p.final_price || p.price || 0).toFixed(2);
      const comparePriceStr = parseFloat(p.price || p.final_price || 0).toFixed(2);
      const createdAt = p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString();
      const updatedAt = p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString();

      return {
        id: p.id,
        title: p.title || "",
        body_html: p.description ? `<p>${p.description}</p>` : "",
        vendor: "Wooff",
        product_type: p.category_name || "Pet Care",
        created_at: createdAt,
        handle: p.slug || `product-${p.id}`,
        updated_at: updatedAt,
        tags: "Pet Care, Toothpaste, Dental",
        status: "active",
        variants: [
          {
            id: p.id,
            title: p.title || "Default Title",
            price: priceStr,
            compare_at_price: comparePriceStr,
            sku: p.sku || `WOOFF-${p.id}`,
            quantity: p.stock !== null && p.stock !== undefined ? Number(p.stock) : 100,
            created_at: createdAt,
            updated_at: updatedAt,
            taxable: true,
            option_values: {
              Title: "Default",
            },
            grams: 100,
            image: {
              src: imageUrl,
            },
            weight: 0.1,
            weight_unit: "kg",
          },
        ],
        image: {
          src: imageUrl,
        },
        options: [
          {
            name: "Title",
            values: ["Default"],
          },
        ],
      };
    });

    return res.status(200).json({
      data: {
        total,
        products: mappedProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Loyalty Points: Fetch Available Points
 * POST /api/shiprocket/loyalty/get-points
 * Body: { "mobile_number": "9999999999", "cart_value": 1000.00 }
 * Response: { "data": { "mobile_number": "...", "available_points": 1000, "applicable_points": 50 } }
 */
exports.getLoyaltyPoints = async (req, res, next) => {
  try {
    const rawMobile = req.body?.mobile_number || "";
    const mobile = String(rawMobile).replace(/\D/g, "").slice(-10);
    const cartValue = parseFloat(req.body?.cart_value || 0);

    if (!mobile) {
      return res.status(200).json({
        data: {
          mobile_number: String(rawMobile),
          available_points: 0,
          applicable_points: 0,
        },
      });
    }

    // Check loyalty account or initialize with default points (1000 for test numbers, 500 for others)
    let userRes = await pool.query(
      "SELECT * FROM loyalty_accounts WHERE mobile_number = $1",
      [mobile]
    );

    let availablePoints = 500;
    if (mobile === "9999999999" || mobile === "9451018768") {
      availablePoints = 1000;
    }

    if (userRes.rows.length === 0) {
      const insertRes = await pool.query(
        "INSERT INTO loyalty_accounts (mobile_number, points) VALUES ($1, $2) RETURNING points",
        [mobile, availablePoints]
      );
      availablePoints = insertRes.rows[0].points;
    } else {
      availablePoints = userRes.rows[0].points;
    }

    // Applicable points: up to 10% of cart value or maximum 50 points (at 1 pt = ₹1)
    let applicablePoints = Math.min(
      availablePoints,
      cartValue > 0 ? Math.max(0, Math.min(50, Math.floor(cartValue * 0.1))) : 50
    );

    return res.status(200).json({
      data: {
        mobile_number: rawMobile,
        available_points: availablePoints,
        applicable_points: applicablePoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Loyalty Points: Block Points
 * POST /api/shiprocket/loyalty/block-points
 * Body: { "mobile_number": "9451018768", "transactional_points": 50, "order_id": 12345 }
 */
exports.blockLoyaltyPoints = async (req, res, next) => {
  try {
    const rawMobile = req.body?.mobile_number || "";
    const mobile = String(rawMobile).replace(/\D/g, "").slice(-10);
    const transactionalPoints = parseInt(req.body?.transactional_points, 10) || 0;
    const orderId = String(req.body?.order_id || "");

    // Find account
    let userRes = await pool.query(
      "SELECT * FROM loyalty_accounts WHERE mobile_number = $1",
      [mobile]
    );

    let currentPoints = 1000;
    if (userRes.rows.length === 0) {
      await pool.query(
        "INSERT INTO loyalty_accounts (mobile_number, points) VALUES ($1, $2)",
        [mobile, currentPoints]
      );
    } else {
      currentPoints = userRes.rows[0].points;
    }

    const pointsToBlock = Math.min(currentPoints, transactionalPoints);
    const remainingPoints = Math.max(0, currentPoints - pointsToBlock);
    const transactionId = `txn_${orderId || Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Update account points
    await pool.query(
      "UPDATE loyalty_accounts SET points = $1, updated_at = NOW() WHERE mobile_number = $2",
      [remainingPoints, mobile]
    );

    // Record block
    await pool.query(
      `INSERT INTO loyalty_blocks (order_id, mobile_number, points_blocked, discount_value, transaction_id, status)
       VALUES ($1, $2, $3, $4, $5, 'blocked')
       ON CONFLICT (transaction_id) DO NOTHING`,
      [orderId, mobile, pointsToBlock, pointsToBlock, transactionId]
    );

    return res.status(200).json({
      data: {
        status: true,
        available_points: remainingPoints,
        message: "Valid Customer Id",
        debited_points: pointsToBlock,
        transaction_id: transactionId,
        discount_value: pointsToBlock,
        additional_properties: {
          redemptionFactor: 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Loyalty Points: Unblock Points
 * POST /api/shiprocket/loyalty/unblock-points
 * Body: { "order_id": 12345 }
 */
exports.unblockLoyaltyPoints = async (req, res, next) => {
  try {
    const orderId = String(req.body?.order_id || "");

    if (orderId) {
      const blockRes = await pool.query(
        "SELECT * FROM loyalty_blocks WHERE order_id = $1 AND status = 'blocked'",
        [orderId]
      );

      for (const block of blockRes.rows) {
        await pool.query(
          "UPDATE loyalty_accounts SET points = points + $1, updated_at = NOW() WHERE mobile_number = $2",
          [block.points_blocked, block.mobile_number]
        );
        await pool.query(
          "UPDATE loyalty_blocks SET status = 'unblocked', updated_at = NOW() WHERE id = $1",
          [block.id]
        );
      }
    }

    return res.status(200).json({
      data: {
        status: "Success",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Order Webhook from Shiprocket
 * POST /api/shiprocket/order-webhook
 */
exports.handleOrderWebhook = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const orderId = String(payload.order_id || "");
    const fastrrOrderId = String(payload.fastrr_order_id || "");
    const items = payload.cart_data?.items || [];
    const shipping = payload.shipping_address || {};
    const paymentType = payload.payment_type || "PREPAID";
    const paymentStatus = payload.payment_status || "Success";
    const totalAmount = parseFloat(payload.total_amount_payable || payload.subtotal_price || 0);
    const subtotal = parseFloat(payload.subtotal_price || totalAmount);
    const shippingFee = parseFloat(payload.shipping_charges || 0);
    const discount = parseFloat(payload.total_discount || 0);

    const orderNumber = `SR-${orderId.slice(-8).toUpperCase() || Date.now()}`;

    // Check if order already recorded
    const existing = await pool.query(
      `SELECT id FROM orders WHERE order_number = $1 OR notes LIKE $2`,
      [orderNumber, `%${orderId}%`]
    );

    if (existing.rows.length === 0) {
      const customerName = `${shipping.first_name || ""} ${shipping.last_name || ""}`.trim() || "Customer";
      const customerPhone = payload.phone || shipping.phone || "0000000000";

      const insertOrder = await pool.query(
        `INSERT INTO orders (
          order_number, subtotal, shipping_amount, discount_amount, total_amount,
          currency, payment_status, order_status, shipping_address_line_1,
          shipping_address_line_2, shipping_city, shipping_state, shipping_postal_code,
          customer_phone, customer_name, notes
        ) VALUES (
          $1, $2, $3, $4, $5, 'INR', $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING id`,
        [
          orderNumber,
          subtotal,
          shippingFee,
          discount,
          totalAmount,
          paymentStatus.toLowerCase() === "success" ? "paid" : "pending",
          "confirmed",
          shipping.line1 || "Not specified",
          shipping.line2 || "",
          shipping.city || "Not specified",
          shipping.state || "Not specified",
          shipping.pincode || "000000",
          customerPhone,
          customerName,
          `Shiprocket Order ID: ${orderId} (Fastrr ID: ${fastrrOrderId})`,
        ]
      );

      const dbOrderId = insertOrder.rows[0].id;

      // Insert order items
      for (const item of items) {
        const variantId = parseInt(item.variant_id, 10);
        let productName = "Wooff Product";
        let productSku = `SKU-${variantId || "01"}`;
        let unitPrice = 0;

        if (variantId) {
          const pRes = await pool.query("SELECT title, sku, final_price, price FROM products WHERE id = $1", [variantId]);
          if (pRes.rows.length > 0) {
            productName = pRes.rows[0].title;
            productSku = pRes.rows[0].sku;
            unitPrice = parseFloat(pRes.rows[0].final_price || pRes.rows[0].price);
          }
        }

        const qty = parseInt(item.quantity, 10) || 1;
        const lineTotal = unitPrice * qty;

        await pool.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, line_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [dbOrderId, variantId || null, productName, productSku, unitPrice, qty, lineTotal]
        );
      }

      // Record payment transaction
      const paymentObj = Array.isArray(payload.payments) && payload.payments.length > 0 ? payload.payments[0] : null;
      await pool.query(
        `INSERT INTO payment_transactions (
          order_id, payment_provider, provider_order_id, provider_payment_id,
          amount, currency, status, payment_method, metadata
        ) VALUES (
          $1, 'shiprocket', $2, $3, $4, 'INR', $5, $6, $7
        )`,
        [
          dbOrderId,
          orderId,
          paymentObj?.pg_transaction_id || paymentObj?.txn_id || orderId,
          totalAmount,
          paymentStatus.toLowerCase() === "success" ? "paid" : "pending",
          paymentObj?.payment_method || paymentType,
          JSON.stringify(payload),
        ]
      );

      // Redeem any blocked loyalty points for this order
      await pool.query(
        "UPDATE loyalty_blocks SET status = 'redeemed', updated_at = NOW() WHERE order_id = $1",
        [orderId]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order processed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Initiate Checkout & Generate Shiprocket Access Token
 * POST /api/shiprocket/checkout/initiate
 * Body: { items: [{ variant_id: "8", quantity: 1 }], redirect_url: "..." }
 */
exports.initiateCheckout = async (req, res, next) => {
  try {
    const rawItems = req.body.items || [];
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required to initiate checkout",
      });
    }

    const baseUrl = process.env.FRONTEND_URL || "https://wooff-frontend.onrender.com";
    const redirectUrl = req.body.redirect_url || `${baseUrl}/order-success`;

    // Enrich items with catalog_data so Shiprocket checkout token generation succeeds
    const enrichedItems = [];
    for (const it of rawItems) {
      const vId = parseInt(it.variant_id, 10);
      let catalogData = null;

      if (vId) {
        const prod = await pool.query(
          "SELECT title, final_price, price, primary_image FROM products WHERE id = $1",
          [vId]
        );
        if (prod.rows.length > 0) {
          const row = prod.rows[0];
          let img = row.primary_image || "";
          if (img && !img.startsWith("http")) {
            img = `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`;
          }

          catalogData = {
            name: row.title || "Wooff Product",
            price: parseFloat(row.final_price || row.price || 0),
            image_url: img,
          };
        }
      }

      const itemPayload = {
        variant_id: String(it.variant_id),
        quantity: parseInt(it.quantity, 10) || 1,
      };

      if (catalogData) {
        itemPayload.catalog_data = catalogData;
      }

      enrichedItems.push(itemPayload);
    }

    const payload = {
      cart_data: {
        items: enrichedItems,
        mobile_app: false,
      },
      redirect_url: redirectUrl,
      timestamp: new Date().toISOString(),
    };

    const srResponse = await sendShiprocketRequest("/api/v1/access-token/checkout", payload);

    if (srResponse.statusCode === 200 && srResponse.body?.ok && srResponse.body?.result?.token) {
      return res.status(200).json({
        success: true,
        token: srResponse.body.result.token,
        order_id: srResponse.body.result.data?.order_id || null,
        expires_at: srResponse.body.result.expires_at || null,
      });
    }

    return res.status(srResponse.statusCode || 500).json({
      success: false,
      message: srResponse.body?.error?.message || "Failed to generate Shiprocket checkout token",
      details: srResponse.body,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Fetch Order Details from Shiprocket
 * POST /api/shiprocket/order/details
 * Body: { order_id: "..." }
 */
exports.getOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.body?.order_id || req.params?.orderId;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "order_id is required",
      });
    }

    const payload = {
      order_id: orderId,
      timestamp: new Date().toISOString(),
    };

    const srResponse = await sendShiprocketRequest("/api/v1/custom-platform-order/details", payload);
    return res.status(srResponse.statusCode).json(srResponse.body);
  } catch (error) {
    next(error);
  }
};
