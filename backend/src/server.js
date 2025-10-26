import dotenv from "dotenv";
dotenv.config();
import { createApp } from "./app.js";
import { createPool } from "./config/database.js";

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

let pool;
let server;

async function waitForDatabase(maxAttempts = 5, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `🔌 Attempting database connection (${attempt} / ${maxAttempts})...`
      );
      const testResult = await pool.query(
        "SELECT NOW() as time, version() as version"
      );
      console.log("✅ Database connected:", testResult.rows[0].time);
      console.log(
        "📊 PostgreSQL version:",
        testResult.rows[0].version.split(" ")[1]
      );
      return true;
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message);

      if (attempt === maxAttempts) {
        throw new Error(
          `Could not connect to database after ${maxAttempts} attempts`
        );
      }

      console.log(`⏳ Waiting ${delayMs}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function startServer() {
  try {
    console.log("🚀 Starting Letterboxd Clone API...");
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`📍 Port: ${PORT}`);

    pool = createPool();
    await waitForDatabase();
    const app = createApp({ db: pool, config: { env: NODE_ENV } });

    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log("");
      console.log("✅ Server started successfully!");
      console.log("");
      console.log("📍 Endpoints:");
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   Ready:  http://localhost:${PORT}/ready`);
      console.log(`   API:    http://localhost:${PORT}/api/v1`);
      console.log("");
      console.log("💡 Press Ctrl+C to stop");
      console.log("");
    });

    function gracefulShutdown(signal) {
      console.log("");
      console.log(`${signal} received, starting graceful shutdown...`);

      server.close(async () => {
        console.log("✅ HTTP server closed");

        try {
          await pool.shutdown();
        } catch (error) {
          console.error("Error closing database pool:", error);
        }

        console.log("✅ Graceful shutdown complete");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("❌ Graceful shutdown timeout - forcing exit");
        process.exit(1);
      }, 10000);
    }

    // Register signal handlers
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start the server
startServer();
