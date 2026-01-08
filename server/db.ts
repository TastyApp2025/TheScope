import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Render can sometimes provide an empty string or malformed URL if not configured correctly.
// We add a check to ensure it's a valid string before passing to Pool.
const connectionString = process.env.DATABASE_URL.trim();

if (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
  throw new Error("DATABASE_URL must be a valid PostgreSQL connection string starting with postgres:// or postgresql://");
}

export const pool = new Pool({ 
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
export const db = drizzle(pool, { schema });
