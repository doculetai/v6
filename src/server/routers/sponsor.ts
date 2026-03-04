import { z } from 'zod';

import {
  getSponsorTransactionSummary,
  getSponsorTransactions,
} from '@/db/queries/sponsor-transactions';
import {
  sponsorTransactionFilterSchema,
  sponsorTransactionSchema,
  sponsorTransactionSummarySchema,
} from '@/types/sponsor-transactions';

import { createTRPCRouter, roleProcedure } from '../trpc';

const transactionsInputSchema = z.object({
  type: sponsorTransactionFilterSchema.default('all'),
});

export const sponsorRouter = createTRPCRouter({
  getTransactions: roleProcedure('sponsor')
    .input(transactionsInputSchema)
    .output(z.array(sponsorTransactionSchema))
    .query(async ({ ctx, input }) => {
      const transactions = await getSponsorTransactions(ctx.db, ctx.user.id);

      if (input.type === 'all') {
        return transactions;
      }

      return transactions.filter((transaction) => transaction.type === input.type);
    }),

  getTransactionSummary: roleProcedure('sponsor')
    .output(sponsorTransactionSummarySchema)
    .query(async ({ ctx }) => getSponsorTransactionSummary(ctx.db, ctx.user.id)),
});
