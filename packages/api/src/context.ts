import type { Session } from "@angle-io/auth";
import type { Database } from "@angle-io/db";

export type Context = {
  session: Session | null;
  db: Database;
};
