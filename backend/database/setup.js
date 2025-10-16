import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(schema);
    console.log("✅ Database schema created auccessfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error setting up database:", err);
    process.exit(1);
  }
}

setupDatabase();
