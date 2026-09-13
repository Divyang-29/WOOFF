# Coding Conventions

*Last updated: 2026-09-13*

## Code Style & Formatting

### JavaScript / Node.js (Backend)
- **Module System**: CommonJS (`require` / `module.exports`).
- **Naming Conventions**:
  - `camelCase` for variable names, function names, and file names in `controllers/`, `routes/`, `models/`, and `utils/`.
  - `PascalCase` for model/controller module exports when instantiated or class-like.
  - UPPER_CASE for environment variables (`JWT_SECRET`, `PORT`, `DATABASE_URL`).
- **Error Handling**:
  - Express route handlers catch async errors or forward them to `next(err)`.
  - Centralized error handler middleware in [`Backend/middleware/errorHandler.js`](file:///Users/divyangchunara/Desktop/Wooff/Backend/middleware/errorHandler.js) formats API error responses (`{ success: false, message: ... }`).
- **Database Operations**:
  - Parameterized SQL queries using `pg` positional parameters (`$1`, `$2`) to prevent SQL injection.

### React / Frontend
- **Module System**: ES Modules (`import` / `export default` or `export const`).
- **Naming Conventions**:
  - `PascalCase` for React components (`HomePage.jsx`, `DiscoverySection.jsx`).
  - `camelCase` for hooks, helper utility functions, and state variables.
- **Styling**:
  - Modular Vanilla CSS per component/page (e.g. `DiscoverySection.css`).
- **Linting Rules**:
  - Enforced via ESLint with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`.
