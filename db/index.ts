import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

// Reuse one pool across dev hot-reloads. `prepare: false` keeps it working
// behind Supabase's transaction pooler (port 6543). A serverless function can
// sit idle or frozen while the pooler drops its connection, and a query on a
// dead connection hangs, so connections are closed early and replaced often.
const client =
  globalForDb.pg ??
  postgres(process.env.DATABASE_URL!, {
    max: 5,
    prepare: false,
    idle_timeout: 10,
    max_lifetime: 300,
    connect_timeout: 10,
  });
if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema });
export * from "./schema";
