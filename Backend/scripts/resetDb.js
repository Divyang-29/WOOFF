const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function resetDatabase() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, "../schema.sql"), "utf8");
    console.log("Resetting database table schema...");
    await pool.query(schemaSql);
    console.log("Database table 'users' successfully recreated!");
    process.exit(0);
  } catch (error) {
    console.error("Database reset error:", error.message);
    process.exit(1);
  }
}

resetDatabase();
