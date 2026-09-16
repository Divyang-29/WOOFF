const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || "20", 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl:
    isProduction &&
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("127.0.0.1") &&
    !process.env.DATABASE_URL.includes("localhost")
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("error", (err) => {
  console.error("[Database Pool Error]: Unexpected idle client error", err);
});

module.exports = pool;