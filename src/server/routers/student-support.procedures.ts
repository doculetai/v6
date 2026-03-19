import { TRPCError } from '@trpc/server';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { supportRequests } from '@/db/schema';

import { roleProcedure } from '../trpc';

const createSupportRequestInputSchema = z.object({
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(2000),
});

const supportRequestOutputSchema = z.object({
  id: z.string().uuid(),
  subject: z.string(),
  message: z.string(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  createdAt: z.date(),
});

export const supportProcedures = {
  listMySupportRequests: roleProcedure('student')
    .output(z.array(supportRequestOutputSchema))
    .query(async ({ ctx }) => {
      const rows = await ctx.db.query.supportRequests.findMany({
        where: eq(supportRequests.userId, ctx.user!.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        columns: { id: true, subject: true, message: true, status: true, createdAt: true },
      });
      return rows;
    }),

  createSupportRequest: roleProcedure('student')
    .input(createSupportRequestInputSchema)
    .output(supportRequestOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(supportRequests)
        .values({
          userId: ctx.user!.id,
          subject: input.subject,
          message: input.message,
          status: 'open',
        })
        .returning({
          id: supportRequests.id,
          subject: supportRequests.subject,
          message: supportRequests.message,
          status: supportRequests.status,
          createdAt: supportRequests.createdAt,
        });

      if (!row) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to create support request.',
        });
      }

      return row;
    }),
};
