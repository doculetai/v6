import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { dashboardRoles, isDashboardRole } from '@/config/roles';
import { profiles } from '@/db/schema';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import { documentProcedures } from './student-documents.procedures';
import { inviteProcedures } from './student-invites.procedures';
import { onboardingProcedures } from './student-onboarding.procedures';
import { proofProcedures } from './student-proof.procedures';
import { schoolsProcedures } from './student-schools.procedures';
import { verificationProcedures } from './student-verification.procedures';

const profileRoleSchema = z.enum(dashboardRoles);

export const studentRouter = createTRPCRouter({
  // ── Profile ──────────────────────────────────────────────────────────────
  createProfile: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(['student', 'sponsor', 'university', 'agent', 'partner']),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user!.id !== input.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Can only create profile for yourself' });
      }
      await ctx.db
        .insert(profiles)
        .values({ userId: input.userId, role: input.role })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: { role: input.role, updatedAt: new Date() },
        });
    }),

  ensureProfile: protectedProcedure
    .output(z.object({ created: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const existing = await ctx.db.query.profiles.findFirst({
        where: (table, { eq }) => eq(table.userId, ctx.user!.id),
      });
      if (existing) return { created: false };

      const metaRole = ctx.user!.user_metadata?.role;
      const role = typeof metaRole === 'string' && isDashboardRole(metaRole) ? metaRole : 'student';

      await ctx.db.insert(profiles).values({ userId: ctx.user!.id, role });
      return { created: true };
    }),

  getCurrentProfile: protectedProcedure
    .output(z.object({ role: profileRoleSchema }))
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: (table, { eq }) => eq(table.userId, ctx.user!.id),
      });

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
      }

      return { role: profile.role };
    }),

  // ── Onboarding ──────────────────────────────────────────────────────────
  ...onboardingProcedures,

  // ── Schools ──────────────────────────────────────────────────────────────
  ...schoolsProcedures,

  // ── Verification ─────────────────────────────────────────────────────────
  ...verificationProcedures,

  // ── Documents ────────────────────────────────────────────────────────────
  ...documentProcedures,

  // ── Proof of Funds ───────────────────────────────────────────────────────
  ...proofProcedures,

  // ── Sponsor Invitations ──────────────────────────────────────────────────
  ...inviteProcedures,
});
