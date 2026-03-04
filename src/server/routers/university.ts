import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  getUniversityProfile,
  upsertUniversityProfile,
} from '@/db/queries/university-settings';

import { createTRPCRouter, roleProcedure } from '../trpc';

// ── Output schemas ────────────────────────────────────────────────────────────

const UniversityProfileSchema = z.object({
  institutionName: z.string(),
  accreditationBody: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  webhookUrl: z.string().nullable(),
  notifyOnSubmission: z.boolean(),
  notifyOnApproval: z.boolean(),
  notifyOnRejection: z.boolean(),
});

const SessionInfoSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  lastSignedInAt: z.string().nullable(),
});

const UniversitySettingsSchema = z.object({
  profile: UniversityProfileSchema,
  session: SessionInfoSchema,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultProfile = {
  institutionName: '',
  accreditationBody: null,
  contactEmail: null,
  contactPhone: null,
  webhookUrl: null,
  notifyOnSubmission: true,
  notifyOnApproval: true,
  notifyOnRejection: true,
} satisfies z.infer<typeof UniversityProfileSchema>;

// ── Router ────────────────────────────────────────────────────────────────────

export const universityRouter = createTRPCRouter({
  getSettings: roleProcedure('university')
    .output(UniversitySettingsSchema)
    .query(async ({ ctx }) => {
      const row = await getUniversityProfile(ctx.db, ctx.user.id);

      const profile = row
        ? {
            institutionName: row.institutionName,
            accreditationBody: row.accreditationBody,
            contactEmail: row.contactEmail,
            contactPhone: row.contactPhone,
            webhookUrl: row.webhookUrl,
            notifyOnSubmission: row.notifyOnSubmission,
            notifyOnApproval: row.notifyOnApproval,
            notifyOnRejection: row.notifyOnRejection,
          }
        : defaultProfile;

      const session = {
        id: ctx.user.id.slice(0, 16),
        email: ctx.user.email ?? null,
        lastSignedInAt: ctx.user.last_sign_in_at ?? null,
      };

      return { profile, session };
    }),

  updateProfile: roleProcedure('university')
    .input(
      z.object({
        institutionName: z.string().min(1, 'Institution name is required').max(200),
        accreditationBody: z.string().max(200).optional(),
        contactEmail: z
          .string()
          .email('Enter a valid email address')
          .optional()
          .or(z.literal('')),
        contactPhone: z.string().max(30).optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await upsertUniversityProfile(ctx.db, ctx.user.id, {
        institutionName: input.institutionName,
        accreditationBody: input.accreditationBody ?? null,
        contactEmail: input.contactEmail ?? null,
        contactPhone: input.contactPhone ?? null,
      });
    }),

  updateNotifications: roleProcedure('university')
    .input(
      z.object({
        notifyOnSubmission: z.boolean(),
        notifyOnApproval: z.boolean(),
        notifyOnRejection: z.boolean(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await upsertUniversityProfile(ctx.db, ctx.user.id, {
        notifyOnSubmission: input.notifyOnSubmission,
        notifyOnApproval: input.notifyOnApproval,
        notifyOnRejection: input.notifyOnRejection,
      });
    }),

  updateWebhook: roleProcedure('university')
    .input(
      z.object({
        webhookUrl: z
          .string()
          .url('Enter a valid URL starting with https://')
          .refine((u) => u.startsWith('https://'), 'Webhook URL must use HTTPS')
          .optional()
          .or(z.literal('')),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await upsertUniversityProfile(ctx.db, ctx.user.id, {
        webhookUrl: input.webhookUrl ?? null,
      });
    }),

  revokeAllSessions: roleProcedure('university')
    .output(z.void())
    .mutation(async ({ ctx }) => {
      const { error } = await ctx.supabase.auth.signOut({ scope: 'global' });
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      }
    }),
});
