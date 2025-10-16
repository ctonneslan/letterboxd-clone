import pg from "pg";
const { Pool } = pg;

// Parse the connection string to ensure it's correct
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  database: "letterboxd_clone", // Explicitly set database name
  user: "charlietonneslan",
  host: "localhost",
  port: 5432,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test connection
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client:", err);
  process.exit(1);
});

export default pool;
