import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Cache the pool on globalThis so Next.js hot-reloads in dev reuse one pool
// instead of leaking a new set of connections on every module reload.
const globalForDb = globalThis as unknown as { __qrPool?: Pool };

const pool =
  globalForDb.__qrPool ??
  new Pool({ connectionString: process.env.POSTGRES_URL, max: 10 });

// Prevent an idle client error from crashing the process.
pool.on("error", (err) => {
  console.error("Unexpected Postgres pool error", err);
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__qrPool = pool;
}

export const db = drizzle(pool, { schema });
