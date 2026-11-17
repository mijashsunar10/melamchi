import { defineConfig } from "drizzle-kit";

// Loads DATABASE_URL from .env.local (Node 20.12+ / 22 built-in env file loader)
try {
  process.loadEnvFile(".env.local");
} catch {
  // fall back to the environment
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
