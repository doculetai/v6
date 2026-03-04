import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { agentProfiles } from '@/db/schema';

import { createTRPCRouter, roleProcedure } from '../trpc';

// ── Output schema ────────────────────────────────────────────────────────────

const AgentSettingsOutputSchema = z.object({
  fullName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  region: z.string().nullable(),
  accreditationNumber: z.string().nullable(),
  notifyNewStudent: z.boolean(),
  notifyCommissionPaid: z.boolean(),
  notifyStudentMilestone: z.boolean(),
  notifyAccountSecurity: z.boolean(),
});

// ── Input schemas ────────────────────────────────────────────────────────────

const UpdateAgentProfileInputSchema = z.object({
  fullName: z.string().min(1).max(120),
  phoneNumber: z
    .string()
    .regex(/^\+234\d{10}$/)
    .or(z.literal(''))
    .optional(),
  region: z.string().max(100).optional(),
  accreditationNumber: z.string().min(1),
});

const UpdateAgentNotificationsInputSchema = z.object({
  notifyNewStudent: z.boolean(),
  notifyCommissionPaid: z.boolean(),
  notifyStudentMilestone: z.boolean(),
  notifyAccountSecurity: z.boolean(),
});

// ── Router ───────────────────────────────────────────────────────────────────

export const agentRouter = createTRPCRouter({
  getSettings: roleProcedure('agent')
    .output(AgentSettingsOutputSchema)
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.agentProfiles.findFirst({
        where: (table, { eq: eqFn }) => eqFn(table.userId, ctx.user.id),
      });

      return {
        fullName: profile?.fullName ?? null,
        phoneNumber: profile?.phoneNumber ?? null,
        region: profile?.region ?? null,
        accreditationNumber: profile?.accreditationNumber ?? null,
        notifyNewStudent: profile?.notifyNewStudent ?? true,
        notifyCommissionPaid: profile?.notifyCommissionPaid ?? true,
        notifyStudentMilestone: profile?.notifyStudentMilestone ?? true,
        notifyAccountSecurity: profile?.notifyAccountSecurity ?? true,
      };
    }),

  // updateProfile uses upsert: creates the row on first save, updates on subsequent saves.
  updateProfile: roleProcedure('agent')
    .input(UpdateAgentProfileInputSchema)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(agentProfiles)
        .values({
          userId: ctx.user.id,
          fullName: input.fullName,
          phoneNumber: input.phoneNumber || null,
          region: input.region || null,
          accreditationNumber: input.accreditationNumber,
        })
        .onConflictDoUpdate({
          target: agentProfiles.userId,
          set: {
            fullName: input.fullName,
            phoneNumber: input.phoneNumber || null,
            region: input.region || null,
            accreditationNumber: input.accreditationNumber,
            updatedAt: new Date(),
          },
        });
    }),

  // updateNotifications uses a targeted UPDATE so it never overwrites profile fields.
  // If no profile row exists yet, the update is a safe no-op.
  updateNotifications: roleProcedure('agent')
    .input(UpdateAgentNotificationsInputSchema)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(agentProfiles)
        .set({
          notifyNewStudent: input.notifyNewStudent,
          notifyCommissionPaid: input.notifyCommissionPaid,
          notifyStudentMilestone: input.notifyStudentMilestone,
          notifyAccountSecurity: input.notifyAccountSecurity,
          updatedAt: new Date(),
        })
        .where(eq(agentProfiles.userId, ctx.user.id));
    }),
});
