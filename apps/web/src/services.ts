import { createAuth } from "@angle-io/auth";
import { createDb } from "@angle-io/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
