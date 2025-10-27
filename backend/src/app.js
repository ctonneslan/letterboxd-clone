import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { checkDatabaseHealth } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import reviewRoutes from "./routes/reviews.js";

export function createApp(options = {}) {
  const { db, config = {} } = options;

  const app = express();

  // Attach database to request object for all routes
  if (db) {
    app.use((req, res, next) => {
      req.db = db;
      next();
    });
  }

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true, // Allow cookies
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
  });

  app.use(limiter);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
      );
    });

    next();
  });

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  app.get("/ready", async (req, res) => {
    if (!db) {
      return res.status(503).json({
        status: "not_ready",
        reason: "Database not configured",
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const dbHealth = await checkDatabaseHealth(db);

      if (!dbHealth.healthy) {
        return res.status(503).json({
          status: "not_ready",
          reason: "Database unhealthy",
          error: dbHealth.error,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({
        status: "ready",
        database: {
          healthy: true,
          responseTime: dbHealth.responseTime,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Readiness check failed:", error);
      res.status(503).json({
        status: "not_ready",
        reason: "Health check failed",
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get("/", (req, res) => {
    res.json({
      name: "Letterboxd Clone API",
      version: "1.0.0",
      description: "Social film logging platform",
      endpoints: {
        health: "/health",
        ready: "/ready",
        api: "/api/v1",
        docs: "/api/docs",
      },
    });
  });

  // API Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/movies", movieRoutes);
  app.use("/api/v1/reviews", reviewRoutes);

  // 404 handler - must be after all routes
  app.use((req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: `Cannot ${req.method} ${req.path}`,
      timestamp: new Date().toISOString(),
    });
  });

  app.use((err, req, res, next) => {
    console.error("Error occurred:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
    });

    const statusCode = err.statusCode || err.status || 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message;

    res.status(statusCode).json({
      error: message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  return app;
}
