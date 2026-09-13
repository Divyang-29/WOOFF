# Tech Stack

*Last updated: 2026-09-13*

## Overview
The Wooff repository is a full-stack e-commerce application comprising a Node.js/Express backend service and a modern React/Vite frontend client.

## Core Technologies

### Backend (`Backend/`)
- **Runtime**: Node.js
- **Framework**: Express.js `^5.2.1`
- **Database Driver**: PostgreSQL (`pg` `^8.21.0`)
- **Authentication & Security**:
  - `jsonwebtoken` `^9.0.3` for JWT generation and verification
  - `helmet` `^8.2.0` for security header protection
  - `express-rate-limit` `^8.6.2` for rate limiting
  - `cors` `^2.8.6` for cross-origin resource sharing
- **File Uploads & Media**: `multer` `^2.1.1` with `multer-storage-cloudinary` `^4.0.0` and `cloudinary` `^1.41.3`
- **Validation**: `express-validator` `^7.3.2`
- **Logging & Monitoring**: `morgan` `^1.10.1`
- **Dev Tools**: `nodemon` `^3.1.14`

### Frontend (`frontend/`)
- **Framework**: React `^19.2.6` (React DOM `^19.2.6`)
- **Build Tool / Dev Server**: Vite `^8.0.12`
- **Routing**: `react-router-dom` `^7.18.2`
- **Animations**: GSAP `^3.15.0` (`@gsap/react` `^2.1.2`)
- **Language / Transpilation**: TypeScript `~6.0.2` with `@vitejs/plugin-react` `^6.0.1`
- **Linting**: ESLint `^10.3.0` (`@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)

## Environment & Configuration
- **Backend Configuration**: Loaded via `dotenv` `^17.4.2` (`Backend/.env`, template in `Backend/.env.example`)
- **Database Schema**: SQL migrations managed via `Backend/schema.sql` and `Backend/scripts/runMigration.js`
