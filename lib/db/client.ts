import "server-only";

import postgres from "postgres";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return url;
}

const globalForDb = globalThis as typeof globalThis & {
  __blogpageSql?: ReturnType<typeof postgres>;
};

export const sql =
  globalForDb.__blogpageSql ??
  postgres(getDatabaseUrl(), {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__blogpageSql = sql;
}
