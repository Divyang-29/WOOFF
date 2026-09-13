# Testing Strategy

*Last updated: 2026-09-13*

## Current Testing Setup

### Backend Testing
- **Integration Test Scripts**: Located under [`Backend/scripts/`](file:///Users/divyangchunara/Desktop/Wooff/Backend/scripts/).
  - Example: `testMarketingAndAnalytics.js` tests marketing and analytics endpoints.
  - Database migration reset and verification: `runMigration.js` and `resetDb.js`.
- **Framework**: Standard Node.js execution of standalone test scripts against dev/local database.

### Frontend Testing
- **Linting**: ESLint configured via [`frontend/eslint.config.js`](file:///Users/divyangchunara/Desktop/Wooff/frontend/eslint.config.js) (`npm run lint`).
- **Build Verification**: Vite build pipeline (`npm run build`).

## Test Execution Commands
- **Backend Reset & Migration**: `npm run db:reset` / `npm run db:migrate` in `Backend/`
- **Frontend Linting**: `npm run lint` in `frontend/`
- **Frontend Build Validation**: `npm run build` in `frontend/`
