import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { eq } from 'drizzle-orm';

import { dashboardRoles, isDashboardRole, type DashboardRole } from '@/config/roles';
import { pendingRoleAssignments, profiles } from '@/db/schema';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import { documentProcedures } from './student-documents.procedures';
import { inviteProcedures } from './student-invites.procedures';
import { onboardingProcedures } from './student-onboarding.procedures';
import { balanceProcedures } from './student-balance.procedures';
import { certificateShareProcedures } from './student-certificate-share.procedures';
import { paymentProcedures } from './student-payment.procedures';
import { proofProcedures } from './student-proof.procedures';
import { schoolsProcedures } from './student-schools.procedures';
import { settingsProcedures } from './student-settings.procedures';
import { supportProcedures } from './student-support.procedures';
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
      let role: DashboardRole =
        typeof metaRole === 'string' && isDashboardRole(metaRole) ? metaRole : 'student';

      // Check for a pending role assignment from an admin invite link
      const userEmail = ctx.user!.email;
      if (userEmail) {
        const pending = await ctx.db.query.pendingRoleAssignments.findFirst({
          where: (t) => eq(t.email, userEmail),
        });
        if (pending && new Date() < pending.expiresAt && isDashboardRole(pending.role)) {
          role = pending.role;
          await ctx.db
            .delete(pendingRoleAssignments)
            .where(eq(pendingRoleAssignments.email, userEmail));
        }
      }

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

  // ── Certificate Payment ────────────────────────────────────────────────
  ...paymentProcedures,

  // ── Balance Verification ──────────────────────────────────────────────
  ...balanceProcedures,

  // ── Certificate Sharing ──────────────────────────────────────────────
  ...certificateShareProcedures,

  // ── Settings ──────────────────────────────────────────────────────────
  ...settingsProcedures,

  // ── Support ───────────────────────────────────────────────────────────
  ...supportProcedures,
});
