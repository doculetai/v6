import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { profiles, users } from '@/db/schema';
import {
  endActiveSessionsForAdmin,
  getActiveImpersonationSession,
  startImpersonationSession,
  endImpersonationSession,
} from '@/db/queries/admin-impersonation';
import { insertAuditLog } from '@/db/queries/audit-log';

import { createTRPCRouter, roleProcedure, protectedProcedure } from '../trpc';

export const adminImpersonationRouter = createTRPCRouter({
  /** Start impersonating a user. Admin only. */
  startImpersonation: roleProcedure('admin')
    .input(z.object({ targetUserId: z.string().uuid() }))
    .output(
      z.object({
        sessionId: z.string(),
        targetRole: z.string(),
        targetEmail: z.string(),
        targetName: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Cannot impersonate yourself
      if (input.targetUserId === ctx.user!.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot impersonate yourself',
        });
      }

      // Fetch target user profile
      const targetProfile = await ctx.db.query.profiles.findFirst({
        where: (t, { eq }) => eq(t.userId, input.targetUserId),
        columns: { role: true, fullName: true, userId: true, deactivatedAt: true },
      });

      if (!targetProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Cannot impersonate other admins
      if (targetProfile.role === 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot impersonate admin accounts',
        });
      }

      if (targetProfile.deactivatedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot impersonate a deactivated account',
        });
      }

      // Fetch target email
      const targetUser = await ctx.db.query.users.findFirst({
        where: (t, { eq }) => eq(t.id, input.targetUserId),
        columns: { email: true },
      });

      const sessionId = await startImpersonationSession(ctx.db, {
        adminId: ctx.user!.id,
        targetUserId: input.targetUserId,
        targetRole: targetProfile.role,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
      });

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'admin.startImpersonation',
        entityType: 'impersonation',
        entityId: input.targetUserId,
        meta: {
          targetRole: targetProfile.role,
          targetEmail: targetUser?.email,
          sessionId,
        },
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      });

      return {
        sessionId,
        targetRole: targetProfile.role,
        targetEmail: targetUser?.email ?? '',
        targetName: targetProfile.fullName,
      };
    }),

  /** End the current impersonation session. */
  endImpersonation: roleProcedure('admin')
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const session = await getActiveImpersonationSession(ctx.db, ctx.user!.id);

      if (!session) {
        return { success: true }; // Already ended
      }

      await endImpersonationSession(ctx.db, session.id);

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'admin.endImpersonation',
        entityType: 'impersonation',
        entityId: session.targetUserId,
        meta: { sessionId: session.id },
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      });

      return { success: true };
    }),

  /** Get the current impersonation session status. */
  getImpersonationStatus: protectedProcedure
    .output(
      z.object({
        active: z.boolean(),
        targetUserId: z.string().nullable(),
        targetRole: z.string().nullable(),
        startedAt: z.date().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      if (!ctx.profile || ctx.profile.role !== 'admin') {
        return { active: false, targetUserId: null, targetRole: null, startedAt: null };
      }

      const session = await getActiveImpersonationSession(ctx.db, ctx.user!.id);

      if (!session) {
        return { active: false, targetUserId: null, targetRole: null, startedAt: null };
      }

      return {
        active: true,
        targetUserId: session.targetUserId,
        targetRole: session.targetRole,
        startedAt: session.createdAt,
      };
    }),
});
