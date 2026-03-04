import { z } from 'zod';

import { getUniversityOverview } from '@/db/queries/university-overview';

import { createTRPCRouter, roleProcedure } from '../trpc';

const recentDocumentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'more_info_requested']),
  type: z.enum(['passport', 'bank_statement', 'offer_letter', 'affidavit', 'cac']),
  createdAt: z.string(),
});

const overviewOutputSchema = z.object({
  pendingCount: z.number().int().min(0),
  approvedTodayCount: z.number().int().min(0),
  flaggedCount: z.number().int().min(0),
  totalStudents: z.number().int().min(0),
  recentActivity: z.array(recentDocumentSchema),
});

export type UniversityOverviewOutput = z.infer<typeof overviewOutputSchema>;

export const universityRouter = createTRPCRouter({
  getOverview: roleProcedure('university')
    .output(overviewOutputSchema)
    .query(async ({ ctx }) => {
      return getUniversityOverview(ctx.db);
    }),
});
