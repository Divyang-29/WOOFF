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
  // 1. Total Revenue from Paid Orders
  const revenueRes = await pool.query(`
    SELECT COALESCE(SUM(total_amount), 0.00)::numeric(10,2) as total_revenue
    FROM orders
    WHERE payment_status = 'paid'
  `);
  const total_revenue = parseFloat(revenueRes.rows[0].total_revenue);

  // 2. Active Orders Count (pending, confirmed, processing, shipped)
  const activeOrdersRes = await pool.query(`
    SELECT COUNT(*)::int as active_orders_count
    FROM orders
    WHERE order_status IN ('pending', 'confirmed', 'processing', 'shipped')
  `);
  const active_orders_count = activeOrdersRes.rows[0].active_orders_count;

  // 3. Total Customers Count (role = 'user')
  const customersRes = await pool.query(`
    SELECT COUNT(*)::int as total_customers
    FROM users
    WHERE role = 'user'
  `);
  const total_customers = customersRes.rows[0].total_customers;

  // 4. Top 5 Selling Products
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

  return {
    total_revenue,
    active_orders_count,
    total_customers,
    top_selling_products,
  };
};

module.exports = {
  getLowStockProducts,
  getAdminAnalytics,
};
