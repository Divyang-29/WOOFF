const pool = require("../config/db");

// Get Low-Stock Active Products
const getLowStockProducts = async (threshold = 10) => {
  const parsedThreshold = Math.max(0, parseInt(threshold) || 10);
  const query = `
    SELECT 
      p.id, p.title, p.slug, p.sku, p.price, p.final_price, p.stock, p.primary_image,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true AND p.stock <= $1
    ORDER BY p.stock ASC, p.title ASC
  `;
  const result = await pool.query(query, [parsedThreshold]);
  return result.rows;
};

// Get Admin Analytics Dashboard Summary
const getAdminAnalytics = async () => {
  // 1. Total Revenue from Paid Orders + This Month / Last Month comparison
  const revenueRes = await pool.query(`
    SELECT 
      COALESCE(SUM(total_amount), 0.00)::numeric(10,2) as total_revenue,
      COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN total_amount ELSE 0 END), 0.00)::numeric(10,2) as this_month_revenue,
      COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < date_trunc('month', CURRENT_DATE) THEN total_amount ELSE 0 END), 0.00)::numeric(10,2) as last_month_revenue
    FROM orders
    WHERE payment_status = 'paid'
  `);
  const total_revenue = parseFloat(revenueRes.rows[0].total_revenue);
  const this_month_revenue = parseFloat(revenueRes.rows[0].this_month_revenue);
  const last_month_revenue = parseFloat(revenueRes.rows[0].last_month_revenue);

  let revenue_growth_percent = 0;
  if (last_month_revenue > 0) {
    revenue_growth_percent = Math.round(((this_month_revenue - last_month_revenue) / last_month_revenue) * 100);
  } else if (this_month_revenue > 0) {
    revenue_growth_percent = 100;
  }

  // 2. Orders Breakdown (Active, Ready for shipment, Shipped, Delivered)
  const ordersRes = await pool.query(`
    SELECT 
      COUNT(*)::int as total_orders_count,
      COUNT(CASE WHEN order_status IN ('pending', 'confirmed', 'processing', 'shipped') THEN 1 END)::int as active_orders_count,
      COUNT(CASE WHEN order_status IN ('confirmed', 'processing') THEN 1 END)::int as ready_for_shipment_count,
      COUNT(CASE WHEN order_status = 'shipped' THEN 1 END)::int as shipped_orders_count,
      COUNT(CASE WHEN order_status = 'delivered' THEN 1 END)::int as delivered_orders_count
    FROM orders
  `);
  const {
    total_orders_count,
    active_orders_count,
    ready_for_shipment_count,
    shipped_orders_count,
    delivered_orders_count,
  } = ordersRes.rows[0];

  // 3. Customers Breakdown
  const customersRes = await pool.query(`
    SELECT 
      COUNT(*)::int as total_customers,
      COUNT(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN 1 END)::int as new_customers_this_month
    FROM users
    WHERE role = 'user'
  `);
  const { total_customers, new_customers_this_month } = customersRes.rows[0];

  // 4. Products & Inventory Breakdown
  const stockRes = await pool.query(`
    SELECT 
      COUNT(CASE WHEN stock <= 10 THEN 1 END)::int as low_stock_count,
      COUNT(CASE WHEN stock = 0 THEN 1 END)::int as out_of_stock_count,
      COUNT(*)::int as total_products_count
    FROM products
    WHERE is_active = true
  `);
  const { low_stock_count, out_of_stock_count, total_products_count } = stockRes.rows[0];

  // 5. Top 5 Selling Products
  const topProductsRes = await pool.query(`
    SELECT 
      oi.product_id,
      oi.product_name,
      oi.product_sku,
      SUM(oi.quantity)::int as total_quantity_sold,
      SUM(oi.line_total)::numeric(10,2) as total_revenue_generated
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.payment_status = 'paid'
    GROUP BY oi.product_id, oi.product_name, oi.product_sku
    ORDER BY total_quantity_sold DESC
    LIMIT 5
  `);

  const top_selling_products = topProductsRes.rows.map((row) => ({
    product_id: row.product_id,
    product_name: row.product_name,
    product_sku: row.product_sku,
    total_quantity_sold: row.total_quantity_sold,
    total_revenue_generated: parseFloat(row.total_revenue_generated),
  }));

  // 6. Daily Sales Trends over the last 30 days
  const trendsRes = await pool.query(`
    SELECT 
      TO_CHAR(d::date, 'YYYY-MM-DD') as sale_date,
      TO_CHAR(d::date, 'DD Mon') as display_date,
      COALESCE(SUM(o.total_amount), 0.00)::numeric(10,2) as daily_revenue,
      COUNT(o.id)::int as daily_orders
    FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day'::interval) d
    LEFT JOIN orders o ON o.created_at::date = d::date AND o.payment_status = 'paid'
    GROUP BY d::date
    ORDER BY d::date ASC
  `);

  const daily_sales_trends = trendsRes.rows.map((row) => ({
    sale_date: row.sale_date,
    display_date: row.display_date,
    daily_revenue: parseFloat(row.daily_revenue),
    daily_orders: row.daily_orders,
  }));

  return {
    total_revenue,
    this_month_revenue,
    last_month_revenue,
    revenue_growth_percent,
    total_orders_count,
    active_orders_count,
    ready_for_shipment_count,
    shipped_orders_count,
    delivered_orders_count,
    total_customers,
    new_customers_this_month,
    low_stock_count,
    out_of_stock_count,
    total_products_count,
    top_selling_products,
    daily_sales_trends,
  };
};

// Get All Orders for Admin with Pagination, Filtering & Search
const getAdminOrders = async ({
  page = 1,
  limit = 20,
  order_status,
  payment_status,
  search,
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (order_status && order_status.trim()) {
    params.push(order_status.trim());
    conditions.push(`o.order_status = $${params.length}`);
  }

  if (payment_status && payment_status.trim()) {
    params.push(payment_status.trim());
    conditions.push(`o.payment_status = $${params.length}`);
  }

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    const sParam = `$${params.length}`;
    conditions.push(
      `(o.order_number ILIKE ${sParam} OR o.customer_name ILIKE ${sParam} OR o.customer_phone ILIKE ${sParam} OR o.customer_email ILIKE ${sParam} OR u.username ILIKE ${sParam} OR u.phone_number ILIKE ${sParam})`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total matching
  const countQuery = `
    SELECT COUNT(*)::int as total
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ${whereClause}
  `;
  const countRes = await pool.query(countQuery, params);
  const total = countRes.rows[0]?.total || 0;

  // Data query with LIMIT & OFFSET
  const dataParams = [...params, limitNum, offset];
  const dataQuery = `
    SELECT 
      o.id,
      o.order_number,
      o.user_id,
      COALESCE(o.customer_name, u.username, 'Guest Customer') as customer_name,
      COALESCE(o.customer_phone, u.phone_number, '') as phone,
      COALESCE(o.customer_email, u.email, '') as email,
      o.total_amount,
      o.payment_status,
      o.order_status,
      o.shipping_city,
      o.shipping_state,
      o.shipping_postal_code,
      o.created_at,
      o.shiprocket_order_id,
      o.shiprocket_awb_code
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
  `;

  const result = await pool.query(dataQuery, dataParams);
  return {
    orders: result.rows,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

// Get All Customers for Admin with Pagination & Search
const getAdminCustomers = async ({ page = 1, limit = 20, search } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = ["u.role = 'user'"];
  const params = [];

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    const sParam = `$${params.length}`;
    conditions.push(
      `(u.username ILIKE ${sParam} OR u.email ILIKE ${sParam} OR u.phone_number ILIKE ${sParam} OR u.child_name ILIKE ${sParam})`
    );
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  // Count total matching customers
  const countQuery = `
    SELECT COUNT(*)::int as total
    FROM users u
    ${whereClause}
  `;
  const countRes = await pool.query(countQuery, params);
  const total = countRes.rows[0]?.total || 0;

  // Data query with LIMIT & OFFSET
  const dataParams = [...params, limitNum, offset];
  const dataQuery = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.phone_number,
      u.role,
      u.child_name as "childName",
      u.created_at,
      COUNT(o.id)::int as total_orders,
      COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0.00)::numeric(10,2) as total_spent
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    ${whereClause}
    GROUP BY u.id, u.username, u.email, u.phone_number, u.role, u.child_name, u.created_at
    ORDER BY u.created_at DESC
    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
  `;

  const result = await pool.query(dataQuery, dataParams);
  return {
    customers: result.rows,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

// Get Full Order Details for Packing Slip & Tax Invoice
const getOrderInvoiceDetails = async (orderId) => {
  const parsedId = parseInt(orderId, 10);
  if (isNaN(parsedId)) return null;

  const orderRes = await pool.query(`
    SELECT 
      o.*,
      COALESCE(o.customer_name, u.username, 'Guest Customer') as customer_name,
      COALESCE(o.customer_phone, u.phone_number, '') as phone,
      COALESCE(o.customer_email, u.email, '') as email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.id = $1
  `, [parsedId]);

  if (orderRes.rows.length === 0) return null;
  const order = orderRes.rows[0];

  const itemsRes = await pool.query(`
    SELECT 
      oi.*,
      p.primary_image,
      p.slug as product_slug,
      p.sku as master_sku
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = $1
    ORDER BY oi.id ASC
  `, [parsedId]);

  return {
    ...order,
    items: itemsRes.rows,
  };
};

// Cancel Order & Restore Product Stock
const cancelOrderAdmin = async (orderId, reason = "Cancelled by Administrator") => {
  const parsedId = parseInt(orderId, 10);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderCheck = await client.query(
      "SELECT id, order_status, notes FROM orders WHERE id = $1 FOR UPDATE",
      [parsedId]
    );
    if (orderCheck.rows.length === 0) {
      throw new Error("Order not found.");
    }
    const { order_status, notes } = orderCheck.rows[0];
    if (order_status === "cancelled") {
      throw new Error("Order is already cancelled.");
    }
    if (order_status === "delivered") {
      throw new Error("Cannot cancel an order that has already been delivered.");
    }

    const updatedNotes = notes
      ? `${notes} | Cancelled: ${reason}`
      : `Cancelled: ${reason}`;

    await client.query(
      `UPDATE orders 
       SET order_status = 'cancelled', 
           notes = $1,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [updatedNotes, parsedId]
    );

    // Restore stock for line items
    const items = await client.query(
      "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
      [parsedId]
    );
    for (const item of items.rows) {
      if (item.product_id) {
        await client.query(
          "UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [item.quantity, item.product_id]
        );
      }
    }

    await client.query("COMMIT");
    return { success: true, message: "Order cancelled and inventory successfully restored." };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Get Orders for CSV Export (with filters, unlimited rows)
const getOrdersForCsvExport = async ({ order_status, payment_status, search } = {}) => {
  const conditions = [];
  const params = [];

  if (order_status && order_status.trim()) {
    params.push(order_status.trim());
    conditions.push(`o.order_status = $${params.length}`);
  }

  if (payment_status && payment_status.trim()) {
    params.push(payment_status.trim());
    conditions.push(`o.payment_status = $${params.length}`);
  }

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    const sParam = `$${params.length}`;
    conditions.push(
      `(o.order_number ILIKE ${sParam} OR o.customer_name ILIKE ${sParam} OR o.customer_phone ILIKE ${sParam} OR o.customer_email ILIKE ${sParam} OR u.username ILIKE ${sParam} OR u.phone_number ILIKE ${sParam})`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT 
      o.id,
      o.order_number,
      COALESCE(o.customer_name, u.username, 'Guest') as customer_name,
      COALESCE(o.customer_phone, u.phone_number, '') as phone,
      COALESCE(o.customer_email, u.email, '') as email,
      o.total_amount,
      o.payment_status,
      o.order_status,
      o.shipping_city,
      o.shipping_state,
      o.shipping_postal_code,
      o.shiprocket_awb_code,
      TO_CHAR(o.created_at, 'YYYY-MM-DD HH24:MI:SS') as order_date
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

// Get Customers for CSV Export
const getCustomersForCsvExport = async ({ search } = {}) => {
  const conditions = ["u.role = 'user'"];
  const params = [];

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    const sParam = `$${params.length}`;
    conditions.push(
      `(u.username ILIKE ${sParam} OR u.email ILIKE ${sParam} OR u.phone_number ILIKE ${sParam} OR u.child_name ILIKE ${sParam})`
    );
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.phone_number,
      COALESCE(u.child_name, '') as child_name,
      COUNT(o.id)::int as total_orders,
      COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0.00)::numeric(10,2) as total_spent,
      TO_CHAR(u.created_at, 'YYYY-MM-DD HH24:MI:SS') as registered_date
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    ${whereClause}
    GROUP BY u.id, u.username, u.email, u.phone_number, u.child_name, u.created_at
    ORDER BY u.created_at DESC
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = {
  getLowStockProducts,
  getAdminAnalytics,
  getAdminOrders,
  getAdminCustomers,
  getOrderInvoiceDetails,
  cancelOrderAdmin,
  getOrdersForCsvExport,
  getCustomersForCsvExport,
};
