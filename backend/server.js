import "./config/env.js"; // Load environment variables first
import { createApp } from "./app.js";

const app = createApp();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () =>
  console.log(`🎬 Letterboxd-Clone is listening on http://localhost:${PORT}`)
);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  server.close(() => process.exit(1));
});
