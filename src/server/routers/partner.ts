import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { getPartnerAnalytics } from '@/db/queries/partner';

import { createTRPCRouter, roleProcedure } from '../trpc';

const analyticsEventToneSchema = z.enum(['neutral', 'success', 'warning', 'error', 'info']);

const analyticsOutputSchema = z.object({
  stats: z.object({
    totalVerifications: z.number(),
    certificatesIssued: z.number(),
    activeApiKeys: z.number(),
    apiCallsThisMonth: z.number(),
  }),
  dailyCalls: z.array(z.object({ date: z.string(), calls: z.number() })),
  usageRows: z.array(
    z.object({
      id: z.string(),
      endpoint: z.string(),
      calls: z.number(),
      successRate: z.string(),
      avgLatency: z.string(),
    }),
  ),
  recentEvents: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      timestamp: z.string(),
      tone: analyticsEventToneSchema,
    }),
  ),
});

export type PartnerAnalyticsOutput = z.infer<typeof analyticsOutputSchema>;

export const partnerRouter = createTRPCRouter({
  getAnalytics: roleProcedure('partner')
    .output(analyticsOutputSchema)
    .query(async ({ ctx }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (table, { eq }) => eq(table.userId, ctx.user.id),
      });

      if (!partnerProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });
      }

      return getPartnerAnalytics(ctx.db, partnerProfile.id);
    }),
});
