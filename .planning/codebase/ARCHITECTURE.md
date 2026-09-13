# Architecture Overview

*Last updated: 2026-09-13*

## System Architecture

```
+-------------------------------------------------------+
|                   React Frontend                      |
| (Vite, React Router v7, GSAP Animations, SPA pages)   |
+-------------------------------------------------------+
                           |
                     HTTP / REST API
                           v
+-------------------------------------------------------+
|                   Express Backend                     |
|  - Server Initialization ([Backend/server.js])         |
|  - Security & Middleware (Helmet, CORS, Rate Limit)   |
|  - Route Handlers ([Backend/routes/])                  |
|  - Controllers & Business Logic ([Backend/controllers/])|
|  - Models / Queries ([Backend/models/])                |
+-------------------------------------------------------+
            |                             |
            v                             v
+-----------------------+     +-----------------------+
|  PostgreSQL Database  |     |  Cloudinary Storage   |
|  (Connection Pool)    |     |  (Media / Product Img)|
+-----------------------+     +-----------------------+
```

## Layered Pattern (Backend)
1. **Entrypoint**: [`Backend/server.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/server.js) configures security headers (`helmet`), CORS, raw body parsing for webhooks, global rate limiting, and mounts router modules.
2. **Routes Layer**: Modular express routers in `Backend/routes/` handle URL mapping (e.g., auth, products, categories, cart, orders, coupons, admin).
3. **Controller Layer**: Controllers in `Backend/controllers/` process requests, invoke model functions, validate data with `express-validator`, and send HTTP responses.
4. **Model Layer**: Data access functions in `Backend/models/` perform raw SQL queries against PostgreSQL pool (`Backend/config/db.js`).
5. **Middleware Layer**: Standardized middlewares in `Backend/middleware/` for auth check (`authMiddleware.js`), error handling (`errorHandler.js`), rate limiting (`rateLimiter.js`), and file upload handling (`uploadMiddleware.js`).

## Frontend Architecture
- **Vite SPA Single Page Application**: Entry points at [`frontend/index.html`](file:///Users/divyangchunara/Desktop/Wooff/frontend/index.html) and [`frontend/src/main.jsx`](file:///Users/divyangchunara/Desktop/Wooff/frontend/src/main.jsx).
- **Page Layouts & Routing**: Components organized under `frontend/src/pages/` and `frontend/src/components/`. React Router DOM handles route navigation.
- **Animations**: GSAP timeline and scroll-triggered animations embedded in landing page / discovery components.
