# Directory Structure

*Last updated: 2026-09-13*

## Root Directory Overview
```
Wooff/
├── Backend/                 # Express REST API Server
├── frontend/                # React Vite Frontend SPA
├── .agent/                  # GSD Agent configurations & skills
└── .planning/               # Planning documents & codebase maps
```

## Backend Directory Structure (`Backend/`)
- `config/`
  - [`db.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/config/db.js) - PostgreSQL pool configuration
- `controllers/` - Express route handlers and request logic
- `middleware/`
  - `authMiddleware.js` - JWT authentication verification
  - `errorHandler.js` - Global error handling middleware
  - `rateLimiter.js` - Global & endpoint rate limiting configs
  - `uploadMiddleware.js` - Multer + Cloudinary storage handler
- `migrations/` - SQL migration scripts
- `models/` - Data access layer executing SQL queries against pool
- `routes/` - Express route definitions (`auth`, `product`, `order`, `cart`, `coupon`, `admin`, etc.)
- `scripts/` - Maintenance and utility scripts (`runMigration.js`, `resetDb.js`, test scripts)
- `schema.sql` - Core database schema definition
- `server.js` - API server entrypoint

## Frontend Directory Structure (`frontend/`)
- `public/` - Static assets (favicons, icons, public images)
- `src/`
  - `assets/` - Image and font assets
  - `components/` - Reusable UI components (Navbar, Footer, Modals, Cards)
  - `pages/` - Top-level page components (HomePage, DiscoverySection, Products, Cart, Checkout)
  - `main.jsx` - Frontend application root entrypoint
- `index.html` - HTML document template
- `vite.config.js` - Vite build configuration
