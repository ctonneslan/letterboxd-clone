import { Pool } from "pg";

export function createPool(config = {}) {
  const poolConfig = {
    host: config.host || process.env.DB_HOST || "localhost",
    port: config.port || process.env.DB_PORT || 5432,
    database: config.database || process.env.DB_NAME || "letterboxd_clone",
    user: config.user || process.env.DB_USER || "postgres",
    password: config.password || process.env.DB_PASSWORD || "postgres",
    max: config.max || 20,
    min: config.min || 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    statement_timeout: 30000,
    application_name: "letterboxd-clone",
  };

  const pool = new Pool(poolConfig);

  pool.on("error", (err, client) => {
    console.error("Unexpected error on idle client:", err);
  });

  pool.on("connect", (client) => {
    console.log("new client connected to database");
  });

  pool.shutdown = async () => {
    console.log("Closing database pool...");
    await pool.end();
    console.log("✅ Database pool closed");
  };

  return pool;
}

export async function checkDatabaseHealth(pool) {
  try {
    const start = Date.now();
    const result = await pool.query(
      "SELECT NOW() as current_time, version() as pg_version"
    );
    const duration = Date.now() - start;

    return {
      healthy: true,
      responseTime: duration,
      timestamp: result.rows[0].current_time,
      version: result.rows[0].pg_version,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
    };
  }
}
