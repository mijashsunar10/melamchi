import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

// One connection pool per server process (re-used across hot reloads in dev).
// Created lazily on first use, so builds don't need a database connection.
const globalForDb = globalThis as unknown as { topxDb?: Database };

function getDb(): Database {
  if (globalForDb.topxDb) return globalForDb.topxDb;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  const instance = drizzle(new Pool({ connectionString, max: 10 }), { schema });
  globalForDb.topxDb = instance;
  return instance;
}

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
