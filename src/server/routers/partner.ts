import { captureException } from '@sentry/nextjs';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { partnerProfiles } from '@/db/schema';

import { createTRPCRouter, roleProcedure } from '../trpc';

// ── Branding ─────────────────────────────────────────────────────────────────

const brandingOutputSchema = z.object({
  organizationName: z.string(),
  brandLogoUrl: z.string().url().nullable(),
  brandColor: z.string().nullable(),
});

const updateBrandingInputSchema = z.object({
  brandLogoUrl: z.string().url().nullable(),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
});

export const partnerRouter = createTRPCRouter({
  getBranding: roleProcedure('partner')
    .output(brandingOutputSchema)
    .query(async ({ ctx }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (table, { eq: whereEq }) => whereEq(table.userId, ctx.user.id),
        columns: {
          organizationName: true,
          brandLogoUrl: true,
          brandColor: true,
        },
      });

      if (!partnerProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });
      }

      return partnerProfile;
    }),

  updateBranding: roleProcedure('partner')
    .input(updateBrandingInputSchema)
    .output(brandingOutputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const rows = await ctx.db
          .update(partnerProfiles)
          .set({
            brandLogoUrl: input.brandLogoUrl,
            brandColor: input.brandColor,
          })
          .where(eq(partnerProfiles.userId, ctx.user.id))
          .returning({
            organizationName: partnerProfiles.organizationName,
            brandLogoUrl: partnerProfiles.brandLogoUrl,
            brandColor: partnerProfiles.brandColor,
          });

        const result = rows[0];

        if (!result) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        captureException(error, { tags: { router: 'partner', procedure: 'updateBranding' } });
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
});
