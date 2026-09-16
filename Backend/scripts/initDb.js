const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function initDatabase() {
  try {
    console.log("[SAFE INIT] Reading base schema.sql...");
    let schemaSql = fs.readFileSync(path.join(__dirname, "../schema.sql"), "utf8");
    
    // Remove DROP TABLE commands to be strictly non-destructive
    schemaSql = schemaSql.replace(/DROP TABLE IF EXISTS [^;]+ CASCADE;/gi, "");
    
    // Ensure CREATE TABLE uses IF NOT EXISTS
    schemaSql = schemaSql.replace(/CREATE TABLE ([a_z0_9_]+)/gi, "CREATE TABLE IF NOT EXISTS $1");

    console.log("[SAFE INIT] Creating base tables IF NOT EXISTS...");
    await pool.query(schemaSql);
    console.log("[SAFE INIT] Base tables verified/created successfully.");

    // Now run commerce migration
    const migrationSql = fs.readFileSync(path.join(__dirname, "../migrations/001_commerce_foundation.sql"), "utf8");
    console.log("[SAFE INIT] Applying commerce migration 001_commerce_foundation.sql...");
    await pool.query(migrationSql);

    console.log("[SAFE INIT] All 19 database tables initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[SAFE INIT ERROR]:", error);
    process.exit(1);
  }
}

initDatabase();
