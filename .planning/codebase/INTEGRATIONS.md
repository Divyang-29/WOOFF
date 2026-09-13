# External Integrations

*Last updated: 2026-09-13*

## Overview
Wooff integrates with third-party cloud services for media hosting, payment processing, and database storage.

## Database & Data Storage
- **PostgreSQL Database**:
  - Connected via `pg` connection pool in [`Backend/config/db.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/config/db.js).
  - Schema definitions and initial seed logic are located in [`Backend/schema.sql`](file:///Users/divyangchunara/Desktop/Wooff/Backend/schema.sql).

## Media & Cloud Asset Storage
- **Cloudinary**:
  - Used for image uploads (product images, banners, user uploads).
  - Integrated via `multer-storage-cloudinary` in [`Backend/middleware/uploadMiddleware.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/middleware/uploadMiddleware.js).
  - Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` environment variables.

## Payment & Webhooks
- **Razorpay Integration**:
  - Payment routing configured in [`Backend/routes/paymentRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/paymentRoutes.js) and webhooks in [`Backend/routes/webhookRoutes.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/routes/webhookRoutes.js).
  - Preserves raw body buffers (`req.rawBody`) in [`Backend/server.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/server.js#L43-L49) for cryptographic HMAC webhook signature verification (`x-razorpay-signature`).

## Authentication & Authorization
- **JWT Authentication**:
  - Secret key configured via `JWT_SECRET` in environment variables.
  - Verification middleware located in [`Backend/middleware/authMiddleware.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/middleware/authMiddleware.js).
