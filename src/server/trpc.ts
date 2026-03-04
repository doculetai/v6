import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

export function roleProcedure(role: string) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const profile = await ctx.db.query.profiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, ctx.user.id),
    });

    if (!profile || profile.role !== role) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return next({ ctx });
  });
}
