import { createDb } from "@angle-io/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);

export type Database = ReturnType<typeof createDb>;
