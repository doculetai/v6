import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  hashToken,
  listSessionsForUser,
  revokeAllOtherSessions,
  revokeSession,
} from '@/db/queries/sessions';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const sessionsRouter = createTRPCRouter({
  list: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          browser: z.string(),
          deviceType: z.enum(['desktop', 'mobile', 'tablet', 'unknown']),
          location: z.string(),
          lastActive: z.string(),
          isCurrent: z.boolean(),
          ipAddress: z.string().optional(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const tokenHash = ctx.session?.access_token
        ? hashToken(ctx.session.access_token)
        : undefined;
      return listSessionsForUser(ctx.db, ctx.user!.id, tokenHash);
    }),

  revoke: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const ok = await revokeSession(ctx.db, ctx.user!.id, input.sessionId);
      if (!ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to revoke session',
        });
      }
    }),

  revokeAllOthers: protectedProcedure.output(z.void()).mutation(async ({ ctx }) => {
    const token = ctx.session?.access_token;
    if (!token) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Session token required',
      });
    }
    await revokeAllOtherSessions(ctx.db, ctx.user!.id, hashToken(token));
  }),
});
