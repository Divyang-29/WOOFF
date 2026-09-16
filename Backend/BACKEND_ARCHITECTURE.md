# Wooff Backend Architecture Report

**Generated Date:** August 20, 2026  
**Workspace Path:** `/Users/divyangchunara/Desktop/Wooff/Backend`  
**Architecture Style:** Layered Monolithic Express 5 REST API (Router -> Controller -> Model -> PostgreSQL)

---

## A. Current Architecture

The Wooff backend is built as a Node.js CommonJS application using Express 5.  
Request flow proceeds as follows:

```
[ HTTP Request ] 
       │
       ▼
[ Server Entrypoint ] ──> file:///Users/divyangchunara/Desktop/Wooff/Backend/server.js
       │
       ▼
[ Security & Parse Middleware ] (helmet, cors, morgan, express.json, express.urlencoded)
       │
       ▼
[ Express Routers ] ──────> file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/
       │
       ▼
[ Auth & Upload Middleware ] ──> file:///Users/divyangchunara/Desktop/Wooff/Backend/middleware/
       │
       ▼
[ Controllers ] ──────────> file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/
       │
       ▼
[ SQL Models ] ───────────> file:///Users/divyangchunara/Desktop/Wooff/Backend/models/
       │
       ▼
[ PostgreSQL Pool ] ──────> file:///Users/divyangchunara/Desktop/Wooff/Backend/config/db.js
```

---

## B. Existing API Routes

All endpoints are configured and mounted in [`server.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/server.js#L28-L41):

### 1. Authentication & OTP Routes
Mounted at `/auth` in [`routes/authRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/authRoutes.js):
- `POST /auth/send-otp` -> [`sendWhatsAppOTP`](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/authController.js#L12)
- `POST /auth/verify-otp` -> [`verifyWhatsAppOTP`](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/authController.js#L47)
- `POST /auth/resend-otp` -> [`resendWhatsAppOTP`](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/authController.js#L125)
- `POST /auth/register` -> Alias to `sendWhatsAppOTP`
- `POST /auth/login` -> Alias to `sendWhatsAppOTP`

### 2. Category Routes
Mounted at `/category` in [`routes/categoryRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/categoryRoutes.js):
- `GET /category` (Public) -> List all categories
- `GET /category/:id` (Public) -> Get category by ID
- `POST /category` (Admin, Multipart) -> Create category with single `image` upload
- `PUT /category/:id` (Admin, Multipart) -> Update category
- `DELETE /category/:id` (Admin) -> Delete category

### 3. Product Routes
Mounted at `/product` in [`routes/productRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/productRoutes.js):
- `GET /product` (Public) -> List all products (supports `?category_id=`)
- `GET /product/:slugOrId` (Public) -> Fetch full product page payload (includes ingredients, FAQs, customer reviews)
- `POST /product/:id/review` (Public) -> Submit product rating & review
- `POST /product` (Admin, Multipart) -> Create product (`primary_image`, up to 5 `images`, JSON ingredients & FAQs)
- `PUT /product/:id` (Admin, Multipart) -> Update product
- `DELETE /product/:id` (Admin) -> Delete product

### 4. Video Reel Routes
Mounted at `/video` in [`routes/videoRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/videoRoutes.js):
- `GET /video` (Public) -> List shoppable video reels
- `POST /video` (Admin, Multipart) -> Create video reel (`video` file up to 50MB, `product_photo` file)
- `PUT /video/:id` (Admin, Multipart) -> Update video reel
- `DELETE /video/:id` (Admin) -> Delete video reel

### 5. Quality Certificates / Badges Routes
Mounted at `/certificate` and `/certificates` in [`routes/certificateRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/certificateRoutes.js):
- `GET /certificate` (Public) -> List certificates (optional filter `?product_id=` or `?product_slug=`)
- `GET /certificate/:slugOrId` (Public) -> Get single certificate by slug or ID
- `POST /certificate` (Admin, Multipart) -> Create certificate badge
- `PUT /certificate/:slugOrId` (Admin, Multipart) -> Update certificate badge
- `DELETE /certificate/:slugOrId` (Admin) -> Delete certificate badge

### 6. Content & CMS Routes
- Contact Us: `/contact` in [`routes/contactRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/contactRoutes.js) (`POST /` public, `GET /` & `DELETE /:id` admin)
- Privacy Policy: `/privacy-policy` in [`routes/privacyPolicyRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/privacyPolicyRoutes.js) (`GET /` public, `POST /` & `PUT /` admin)
- Terms & Conditions: `/terms-and-conditions` in [`routes/termsRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/termsRoutes.js) (`GET /` public, `POST /` & `PUT /` admin)
- Testimonials: `/testimonial` in [`routes/testimonialRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/testimonialRoutes.js) (`GET /` public, `POST /`, `PUT /:id`, `DELETE /:id` admin)
- Shipping Policy: `/shipping-policy` & `/shipment-policy` in [`routes/shippingPolicyRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/shippingPolicyRoutes.js)
- Refund Policy: `/refund-policy` & `/return-policy` in [`routes/refundPolicyRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/refundPolicyRoutes.js)

---

## C. Existing Controllers

Located in [`Backend/controllers/`](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers):

1. **`authController.js`** ([view file](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/authController.js)): Generates 6-digit OTP, dispatches WhatsApp messages, verifies OTP against expiry (10 mins), updates user profile info, issues JWT tokens.
2. **`productController.js`** ([view file](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/productController.js)): Handles multipart parsing for product primary/gallery images, parses JSON-encoded ingredients & FAQs, calculates average ratings upon review submission.
3. **`categoryController.js`** ([view file](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/categoryController.js)): Handles category creation, update with image upload, slug generation, deletion.
4. **`videoController.js`** ([view file](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/videoController.js)): Handles shoppable video reel creation and Cloudinary video URL storage.
5. **`certificateController.js`** ([view file](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/certificateController.js)): Manages quality badges linked to products or standalone.
6. **`contactController.js`** ([view file](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/contactController.js)): Handles contact form submissions and admin message listing/deletion.
7. **`privacyPolicyController.js`**, **`termsController.js`**, **`shippingPolicyController.js`**, **`refundPolicyController.js`**, **`testimonialController.js`**: Policy CMS controllers.

---

## D. Existing Database Tables

Defined in [`schema.sql`](file:///Users/divyangchunara/Desktop/Wooff/Backend/schema.sql):

```sql
users (id, phone_number, username, role, birthdate, gender, otp, otp_expiry, created_at)
categories (id, name, slug, description, image_url, created_at, updated_at)
products (id, category_id, title, slug, price, final_price, primary_image, images, description, stock, sku, estimated_delivery, rating_avg, review_count, created_at, updated_at)
product_ingredients (id, product_id, title, sub_title, description, image_url)
product_faqs (id, product_id, question, answer)
product_reviews (id, product_id, customer_name, rating, review_text, created_at)
privacy_policies (id, title, content, created_at, updated_at)
contact_messages (id, name, email, phone_number, message, created_at)
terms_and_conditions (id, title, content, created_at, updated_at)
testimonials (id, rating, text, author, created_at)
video_reels (id, product_id, video_url, product_name, product_photo, price, created_at)
shipping_policies (id, title, content, created_at, updated_at)
refund_policies (id, title, content, created_at, updated_at)
certificates (id, product_id, title, slug, image_url, description, created_at, updated_at)
```

---

## E. Existing Authentication Flow

1. **Step 1: Request OTP**
   - Frontend calls `POST /auth/send-otp` with `{ phoneNumber }`.
   - [`authController.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/authController.js#L25) generates a random 6-digit numeric string (`Math.floor(100000 + Math.random() * 900000)`).
   - [`saveOTPByPhone`](file:///Users/divyangchunara/Desktop/Wooff/Backend/models/userModel.js#L41) upserts the user record in PostgreSQL with `otp` and `otp_expiry` (10 minutes from now).
   - [`dispatchWhatsAppOTP`](file:///Users/divyangchunara/Desktop/Wooff/Backend/utils/whatsappService.js#L7) attempts Meta Cloud API, then Twilio, then logs to console in dev mode.

2. **Step 2: Verify OTP**
   - Frontend calls `POST /auth/verify-otp` with `{ phoneNumber, otp, [username], [birthdate], [gender] }`.
   - Controller checks OTP equality and `new Date() > new Date(user.otp_expiry)`.
   - Clears OTP in DB via [`clearOTP`](file:///Users/divyangchunara/Desktop/Wooff/Backend/models/userModel.js#L99).
   - Signs JWT token valid for 7 days (`expiresIn: '7d'`).

---

## F. Existing Authorization Flow

Handled by [`middleware/authMiddleware.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/middleware/authMiddleware.js):
- Reads `Authorization` header (`Bearer <token>`).
- Verifies token using `jwt.verify(jwtToken, process.env.JWT_SECRET)`.
- Attaches decoded payload to `req.user`.

---

## G. Existing Admin Flow

Handled by [`middleware/adminMiddleware.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/middleware/adminMiddleware.js):
- Checks `if (req.user.role === 'admin')`.
- If role is missing in token, queries database via `findUserByPhone(req.user.phone_number)`.
- If user exists and `role === 'admin'`, calls `next()`.
- Otherwise returns `403 Access Denied`.

---

## H. Existing Product / Catalog Flow

- Managed in [`models/productModel.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/models/productModel.js).
- Supports database transactions (`BEGIN` / `COMMIT` / `ROLLBACK`) for creation of product + child ingredients + child FAQs.
- Auto-generates URL slugs if not explicitly supplied.
- Calculates `rating_avg` and `review_count` transactionally whenever a review is posted via [`addProductReview`](file:///Users/divyangchunara/Desktop/Wooff/Backend/models/productModel.js#L218).

---

## I. Existing Media Upload Flow

- Configured in [`middleware/uploadMiddleware.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/middleware/uploadMiddleware.js).
- Integrates `multer` with `multer-storage-cloudinary` and [`config/cloudinary.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/config/cloudinary.js).
- Automatically inspects file MIME types (`file.mimetype.startsWith("video")`) to set Cloudinary `resource_type: "video"` or `"image"`.
- Set file size limit to **50MB** for video reels.

---

## J. Existing WhatsApp OTP Flow

- Located in [`utils/whatsappService.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/utils/whatsappService.js).
- Prioritizes **Meta WhatsApp Cloud API** (via Graph API v18.0) if `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` exist.
- Falls back to **Twilio WhatsApp API** if `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` exist.
- Falls back to **Console Dev Mode** (logging OTP to terminal) if credentials are omitted.

---

## K. Existing Validation

- Uses basic parameter checks in controllers (e.g., `if (!targetPhone) return res.status(400)`).
- Package `express-validator` is installed in `package.json` but **not currently utilized in route files**.

---

## L. Existing Error Handling

- Controllers wrap logic in `try ... catch` blocks and return JSON `{ success: false, message: ... }` with HTTP status `400`, `401`, `403`, `404`, or `500`.
- Missing routes trigger 404 handler in [`server.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/server.js#L50).

---

## M. Existing Database Connection & Pooling

- Configured in [`config/db.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/config/db.js).
- Uses `pg.Pool` initialized with `connectionString: process.env.DATABASE_URL`.
- Exposes `pool` instance for raw SQL queries across models.

---

## N. Existing Security Mechanisms

- `helmet()` for securing HTTP headers in [`server.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/server.js#L10).
- `cors()` for cross-origin requests.
- Parameterized SQL queries ($1, $2, $3) throughout all models to prevent SQL injection.
- Passwords are not used; auth relies entirely on WhatsApp OTP.

---

## O. Existing Environment Variables

Defined in [`.env`](file:///Users/divyangchunara/Desktop/Wooff/Backend/.env):
- `PORT` (Default: 8080)
- `DATABASE_URL` (Currently set to `postgresql://postgres:postgres@127.0.0.1:5432/postgres`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `JWT_SECRET`
- `EMAIL_USER`, `EMAIL_PASS`
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`

---

## P. Existing Weaknesses

1. **JWT Payload Missing `role`:** In [`authController.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/controllers/authController.js#L91), `jwt.sign` only includes `{ id, phone_number, username }`. Because `role` is left out, [`adminMiddleware.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/middleware/adminMiddleware.js#L14) must perform an extra PostgreSQL query for every admin-protected route call.
2. **Database Credentials Mismatch in `.env`:** `.env` specifies user `postgres`, whereas local macOS environment PostgreSQL role is `divyangchunara`.
3. **No Migration Tooling:** Database schema changes currently rely on [`scripts/resetDb.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/scripts/resetDb.js) which executes `DROP TABLE IF EXISTS ... CASCADE`. This destroys all data if executed.
4. **Unused `express-validator`:** Input validation relies on manual `if (!field)` statements in controllers rather than structured middleware validation.
5. **No Rate Limiting:** Auth routes (`/auth/send-otp`) lack rate limiting (`express-rate-limit`), opening potential vector for OTP SMS/WhatsApp spamming.

---

## Q. Missing Commerce Functionality

The current backend is missing the core e-commerce transactional domain:
1. **User Addresses Table & APIs:** No table or routes for managing shipping/billing addresses (`street`, `city`, `state`, `postal_code`, `phone`).
2. **Cart Items Table & APIs:** No cart table or APIs for adding, updating, removing, or clearing cart items.
3. **Orders Table & APIs:** No `orders` table to track order number, user ID, total amount, shipping address snapshot, payment status, order status, or fulfillment status.
4. **Order Items Table:** No `order_items` table to store historical snapshots of ordered products and prices.
5. **Payment Transactions Table & Webhooks:** No table or endpoints for managing payment transactions or webhooks (e.g. Razorpay/Stripe).

---

## R. Potential Breaking Changes

- Adding `role` to JWT token: Non-breaking, purely additive.
- Adding Commerce Tables (`user_addresses`, `cart_items`, `orders`, `order_items`): Non-breaking if added as new tables without altering existing table structures.
- Updating `.env` database connection string: Non-breaking configuration fix.

---

## S. Recommended Implementation Order

1. **Phase 1: Backend Fixes & Environment Alignment (Immediate)**
   - Fix JWT token signing in `authController.js` to include `role`.
   - Update `.env` / DB pool connection configuration to handle local and production Postgres credentials smoothly.
   - Add input validation / rate-limiting middleware to auth endpoints.

2. **Phase 2: Database Schema Expansion for Commerce (Non-Destructive)**
   - Create new schema script/migration file for commerce tables: `user_addresses`, `cart_items`, `orders`, `order_items`, `payment_transactions`.
   - Ensure existing data and tables are untouched.

3. **Phase 3: Address & Cart API Implementation**
   - Create `addressModel.js`, `addressController.js`, `addressRoutes.js`.
   - Create `cartModel.js`, `cartController.js`, `cartRoutes.js`.

4. **Phase 4: Order & Checkout API Implementation**
   - Create `orderModel.js`, `orderController.js`, `orderRoutes.js`.
   - Implement order placement, status updates, order history, and payment status hooks.
