import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(morgan("dev"));
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files with absolute path
  app.use(express.static(path.join(__dirname, "../frontend")));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "letterboxd-clone" });
  });

  // 404 handler for API routes
  app.get("/api/{*splat}", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Serve index.html for any other routes (SPA fallback)
  app.get("/*splat", (_req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
  });

  // Global error handler
  app.use((err, _req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  });

  return app;
}
