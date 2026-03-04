import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { getPartnerOverview } from '@/db/queries/partner';

import { createTRPCRouter, roleProcedure } from '../trpc';

const PartnerOverviewSchema = z.object({
  organizationName: z.string(),
  activeApiKeys: z.number().int().nonnegative(),
  totalVerifications: z.number().int().nonnegative(),
  certificatesIssued: z.number().int().nonnegative(),
  apiCallsThisMonth: z.number().int().nonnegative(),
});

export type PartnerOverview = z.infer<typeof PartnerOverviewSchema>;

export const partnerRouter = createTRPCRouter({
  getOverview: roleProcedure('partner')
    .output(PartnerOverviewSchema)
    .query(async ({ ctx }) => {
      const overview = await getPartnerOverview(ctx.db, ctx.user.id);
      if (!overview) throw new TRPCError({ code: 'NOT_FOUND' });
      return overview;
    }),
});
