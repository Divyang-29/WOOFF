const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, "../migrations");
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

    for (const file of files) {
      console.log(`[SAFE MIGRATION] Executing ${file}...`);
      const migrationSql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await pool.query(migrationSql);
      console.log(`[SAFE MIGRATION] ${file} applied successfully.`);
    }

    console.log("[SAFE MIGRATION] All database migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[SAFE MIGRATION ERROR]:", error.message);
    process.exit(1);
  }
}

runMigrations();
