import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";

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

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "letterboxd-clone" });
  });

  app.use("/api/auth", authRoutes);

  // Serve static files
  app.use(express.static(path.join(__dirname, "../frontend")));

  // Global error handler
  app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  });

  return app;
}
