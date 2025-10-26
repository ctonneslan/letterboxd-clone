import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

const databaseUrl =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER || "postgres"}:${
    process.env.DB_PASSWORD || "postgres"
  }@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 5432}/${
    process.env.DB_NAME || "letterboxd_clone"
  }`;

export default {
  databaseUrl,
  dir: "migrations",
  migrationsTable: "pgmigrations",
  schema: "public",
  createSchema: true,
  tsconfig: false,
  sslmode: process.env.DB_SSL === "true" ? "require" : "disable",
};
