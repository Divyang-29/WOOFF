# Codebase Concerns & Tech Debt

*Last updated: 2026-09-13*

## Areas of Attention

### Backend (`Backend/`)
1. **Duplicate Alias Mounts in `server.js`**:
   - `server.js` mounts several routes multiple times under plural and singular aliases (e.g. `/api/categories`, `/categories`, `/category`). While helpful for legacy compatibility, this increases router complexity.
2. **Missing Unit Test Suite**:
   - Tests rely on standalone manual script execution (`scripts/testMarketingAndAnalytics.js`). Setting up Jest, Supertest, or Vitest would improve regression detection.
3. **Environment Secrets Handling**:
   - Ensure `.env` files are never tracked in Git (checked via `.gitignore`). `Backend/.env.example` serves as the reference template.

### Frontend (`frontend/`)
1. **Module System Distinction**:
   - The backend uses CommonJS (`require`), while the frontend uses ES Modules (`import`). Maintain care when sharing types or utilities.
2. **Component File Scoping**:
   - Large CSS files per component should be kept aligned with JSX files to prevent style leakage across pages.
