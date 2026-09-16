# Wooff Commerce Migration Documentation

## Overview
This directory contains non-destructive SQL migrations for the Wooff e-commerce backend platform.

Current active migration: [`001_commerce_foundation.sql`](file:///Users/divyangchunara/Desktop/Wooff/Backend/migrations/001_commerce_foundation.sql)

---

## Migration Purpose
Establishes the core transactional e-commerce schema foundation required for managing user addresses, shopping carts, orders, order items, and payment transactions without modifying or dropping any of the 15 pre-existing database tables (`users`, `products`, `categories`, etc.).

---

## Tables Created

### 1. `user_addresses`
Stores multiple delivery and billing addresses for registered users.
- **Columns:** `id`, `user_id`, `address_line_1`, `address_line_2`, `city`, `state`, `postal_code`, `landmark`, `address_type`, `is_default`, `created_at`, `updated_at`
- **Foreign Key:** `user_id REFERENCES users(id) ON DELETE CASCADE`
- **Address Types:** `'Home'`, `'Work'`, `'Other'`

### 2. `cart_items`
Persistent user shopping cart.
- **Columns:** `id`, `user_id`, `product_id`, `quantity`, `created_at`, `updated_at`
- **Foreign Keys:** `user_id REFERENCES users(id) ON DELETE CASCADE`, `product_id REFERENCES products(id) ON DELETE CASCADE`

### 3. `orders`
Master order record containing historical snapshot of customer shipping address and financial subtotals.
- **Columns:** `id`, `order_number`, `user_id`, `subtotal`, `shipping_amount`, `discount_amount`, `tax_amount`, `total_amount`, `currency`, `payment_status`, `order_status`, `shipping_address_line_1`, `shipping_address_line_2`, `shipping_city`, `shipping_state`, `shipping_postal_code`, `shipping_landmark`, `shipping_address_type`, `customer_phone`, `customer_name`, `notes`, `created_at`, `updated_at`
- **Foreign Key:** `user_id REFERENCES users(id) ON DELETE SET NULL`
- **Status Constraints:**
  - `payment_status`: `'pending'`, `'paid'`, `'failed'`, `'refunded'`, `'partially_refunded'`
  - `order_status`: `'pending'`, `'confirmed'`, `'processing'`, `'shipped'`, `'delivered'`, `'cancelled'`, `'returned'`

### 4. `order_items`
Line items for each order preserving historical product names, SKUs, and prices at purchase time.
- **Columns:** `id`, `order_id`, `product_id`, `product_name`, `product_sku`, `unit_price`, `quantity`, `line_total`, `created_at`
- **Foreign Keys:** `order_id REFERENCES orders(id) ON DELETE CASCADE`, `product_id REFERENCES products(id) ON DELETE SET NULL`

### 5. `payment_transactions`
Payment gateway transactions log (supporting Razorpay, Cashfree, Stripe, etc.).
- **Columns:** `id`, `order_id`, `payment_provider`, `provider_order_id`, `provider_payment_id`, `amount`, `currency`, `status`, `payment_method`, `failure_code`, `failure_message`, `metadata`, `created_at`, `updated_at`
- **Foreign Key:** `order_id REFERENCES orders(id) ON DELETE CASCADE`
- **Status Constraint:** `'created'`, `'pending'`, `'paid'`, `'failed'`, `'cancelled'`, `'refunded'`, `'partially_refunded'`

---

## Constraints & Integrity Rules

1. **Default Address Constraint (Task 4):**
   - Implemented via a PostgreSQL partial unique index:
     `CREATE UNIQUE INDEX idx_user_addresses_one_default_per_user ON user_addresses (user_id) WHERE is_default = true;`
   - Guarantees at the database level that a user can have at most ONE default address.

2. **Cart Uniqueness Constraint (Task 5):**
   - Implemented via `CONSTRAINT unique_user_product_cart UNIQUE (user_id, product_id)` to prevent duplicate product rows per user.

3. **Financial Safety & Value Constraints (Task 9 & 10):**
   - All financial amounts (`subtotal`, `shipping_amount`, `discount_amount`, `tax_amount`, `total_amount`, `unit_price`, `line_total`, `amount`) use high-precision `NUMERIC(10, 2)` decimal types.
   - Non-negative constraints (`>= 0`) on all financial columns.
   - Quantity constraints (`quantity > 0`).
   - PIN Code check constraint: `CHECK (postal_code ~ '^[1-9][0-9]{5}$')` for Indian 6-digit PIN codes.

---

## Indexes Created

- `user_addresses(user_id)`
- `cart_items(user_id)`
- `cart_items(product_id)`
- `orders(user_id)`
- `orders(order_status)`
- `orders(payment_status)`
- `orders(created_at DESC)`
- `order_items(order_id)`
- `order_items(product_id)`
- `payment_transactions(order_id)`
- `payment_transactions(provider_order_id)`
- `payment_transactions(provider_payment_id)`

---

## How to Execute Manually

### Option A: Using NPM Script (Recommended)
```bash
npm run db:migrate
```

### Option B: Using psql CLI
```bash
psql -d wooff_db -f migrations/001_commerce_foundation.sql
```

---

## How to Verify Success

Check that the new tables exist and constraints are enforced:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Expected tables (19 total):
`users`, `categories`, `products`, `product_ingredients`, `product_faqs`, `product_reviews`, `privacy_policies`, `contact_messages`, `terms_and_conditions`, `testimonials`, `video_reels`, `shipping_policies`, `refund_policies`, `certificates`, **`user_addresses`**, **`cart_items`**, **`orders`**, **`order_items`**, **`payment_transactions`**.

---

## Rollback Considerations

> [!CAUTION]
> **No Automated Destructive Rollback**: Automatic `DROP TABLE` rollback scripts are deliberately omitted to prevent accidental loss of live customer order data. If a table creation rollback is strictly required during non-production testing, evaluate dependencies before running targeted SQL statements manually.
