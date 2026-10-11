import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export function createDb(env: DatabaseConfig) {
  const client = neon(env.DATABASE_URL);

  return drizzle({ client, relations });
}

export type Database = ReturnType<typeof createDb>;
