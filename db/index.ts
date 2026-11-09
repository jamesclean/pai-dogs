import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 5,
    idleTimeoutMillis: 5_000,
    maxLifetimeSeconds: 60,
    // A connection can die silently while a serverless function is frozen. These
    // limits turn "hangs forever" into an error we can recover from.
    connectionTimeoutMillis: 5_000,
    query_timeout: 5_000,
  });
  // A dropped idle connection is routine here. Unhandled, it would crash the process.
  pool.on("error", (e) => console.error("idle database connection lost", e.message));

  // A failed query discards its connection, so one retry gets a fresh one. Writes
  // retry too: a rare duplicate beats losing someone's report about a hurt dog.
  const run = pool.query.bind(pool) as (...args: unknown[]) => Promise<unknown>;
  const lost = /timeout|terminated|ECONNRESET|EPIPE|ETIMEDOUT/i;
  (pool as unknown as { query: typeof run }).query = async (...args) => {
    try {
      return await run(...args);
    } catch (e) {
      if (!lost.test(String((e as Error).message))) throw e;
      console.error("retrying query after lost connection:", (e as Error).message);
      return run(...args);
    }
  };

  // Lets Vercel close idle connections before it freezes the function.
  attachDatabasePool(pool);
  return pool;
}

// Reuse one pool across dev hot-reloads.
const pool = globalForDb.pool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export * from "./schema";
