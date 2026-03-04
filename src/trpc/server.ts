import { createCallerFactory } from "@trpc/server";

import { createContext } from "@/server/context";
import { appRouter } from "@/server/root";

const createCaller = createCallerFactory(appRouter);

export const api = async () => {
  const ctx = await createContext();
  return createCaller(ctx);
};
