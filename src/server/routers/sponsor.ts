import { TRPCError } from '@trpc/server';

import {
  getSponsorNotificationSettingsByUserId,
  getSponsorProfileByUserId,
  updateSponsorNotificationSettingsByUserId,
  updateSponsorProfileByUserId,
} from '@/db/queries/sponsor-profile';

import {
  sponsorNotificationSettingsSchema,
  sponsorProfileInputSchema,
  sponsorProfileSchema,
} from './sponsor.schemas';
import { createTRPCRouter, roleProcedure } from '../trpc';

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code === '23505'
  );
}

export const sponsorRouter = createTRPCRouter({
  getProfile: roleProcedure('sponsor').output(sponsorProfileSchema).query(async ({ ctx }) => {
    return getSponsorProfileByUserId(ctx.db, ctx.user.id);
  }),

  updateProfile: roleProcedure('sponsor')
    .input(sponsorProfileInputSchema)
    .output(sponsorProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await updateSponsorProfileByUserId(ctx.db, ctx.user.id, input);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This email is already in use by another account.',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to update your profile right now.',
        });
      }
    }),

  getNotificationSettings: roleProcedure('sponsor')
    .output(sponsorNotificationSettingsSchema)
    .query(async ({ ctx }) => {
      return getSponsorNotificationSettingsByUserId(ctx.db, ctx.user.id);
    }),

  updateNotificationSettings: roleProcedure('sponsor')
    .input(sponsorNotificationSettingsSchema)
    .output(sponsorNotificationSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      return updateSponsorNotificationSettingsByUserId(ctx.db, ctx.user.id, input);
    }),
});
