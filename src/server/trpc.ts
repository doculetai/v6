import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import { insertAuditLog } from '@/db/queries/audit-log';
import { profiles } from '@/db/schema';

import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  const profile = await ctx.db.query.profiles.findFirst({
    where: (table, { eq }) => eq(table.userId, ctx.session!.user.id),
    columns: { deactivatedAt: true, role: true, userId: true, id: true, onboardingComplete: true },
  });
  if (profile?.deactivatedAt) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Account is closed' });
  }
  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
      profile: profile ?? null,
    },
  });
});

const auditMutations = t.middleware(async (opts) => {
  const { ctx, next, path, type, getRawInput } = opts;
  const result = await next({ ctx });
  const user = ctx.user;
  if (type === 'mutation' && user) {
    try {
      const rawInput = await getRawInput?.();
      await insertAuditLog(ctx.db, {
        actorId: user.id,
        action: path,
        entityType: 'mutation',
        entityId: null,
        meta: typeof rawInput === 'object' && rawInput !== null ? { input: rawInput } : null,
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      });
    } catch {
      // Do not fail the mutation if audit logging fails
    }
  }
  return result;
});

export const protectedProcedure = t.procedure.use(enforceAuth).use(auditMutations);

type ProfileRole = (typeof profiles.$inferSelect)['role'];

export function roleProcedure(role: ProfileRole) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    if (!ctx.profile || ctx.profile.role !== role) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({
      ctx: {
        ...ctx,
        profile: ctx.profile,
      },
    });
  });
}
