import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { balanceVerifications } from '@/db/schema';

import { roleProcedure } from '../trpc';

const balanceStatusOutputSchema = z.object({
  hasVerifiedBalance: z.boolean(),
  verifiedAmountKobo: z.number().int().nullable(),
  currency: z.string().nullable(),
  method: z.enum(['mono', 'statement']).nullable(),
  verifiedAt: z.string().datetime().nullable(),
});

export const balanceProcedures = {
  getBalanceStatus: roleProcedure('student')
    .output(balanceStatusOutputSchema)
    .query(async ({ ctx }) => {
      const latest = await ctx.db.query.balanceVerifications.findFirst({
        where: eq(balanceVerifications.userId, ctx.user!.id),
        orderBy: [desc(balanceVerifications.verifiedAt)],
        columns: {
          verifiedAmountKobo: true,
          currency: true,
          method: true,
          verifiedAt: true,
        },
      });

      if (!latest) {
        return {
          hasVerifiedBalance: false,
          verifiedAmountKobo: null,
          currency: null,
          method: null,
          verifiedAt: null,
        };
      }

      return {
        hasVerifiedBalance: true,
        verifiedAmountKobo: latest.verifiedAmountKobo,
        currency: latest.currency,
        method: latest.method as 'mono' | 'statement',
        verifiedAt: latest.verifiedAt.toISOString(),
      };
    }),
};
