import type { Context as ApiContext } from "@angle-io/api/context";

import { db } from "./services";

export function createContext(): ApiContext {
  return {
    db,
  };
}

export type Context = ReturnType<typeof createContext>;
