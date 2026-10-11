import { appRouter } from "@angle-io/api/routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { createContext } from "../../../../context";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    createContext: () => createContext(),
    endpoint: "/api/trpc",
    req,
    router: appRouter,
  });
}

export { handler as GET, handler as POST };
