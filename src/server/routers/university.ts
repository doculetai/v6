import { z } from 'zod';

import {
  getUniversityPipelineQueue,
  reviewPipelineDocument,
} from '@/db/queries/university-pipeline';

import { createTRPCRouter, roleProcedure } from '../trpc';

const PipelineRowSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  studentEmail: z.string(),
  program: z.string().nullable(),
  schoolName: z.string().nullable(),
  amountKobo: z.number().int().nonnegative(),
  kycTier: z.number().int().nullable(),
  documentStatus: z.enum(['pending', 'approved', 'rejected', 'more_info_requested']),
  submittedAt: z.string(),
  updatedAt: z.string(),
  daysWaiting: z.number().int().nonnegative(),
});

const PipelineStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  approvedThisWeek: z.number().int().nonnegative(),
  avgDaysWaiting: z.number().int().nonnegative(),
});

export const universityRouter = createTRPCRouter({
  getPipelineQueue: roleProcedure('university')
    .output(
      z.object({
        rows: z.array(PipelineRowSchema),
        stats: PipelineStatsSchema,
      }),
    )
    .query(async ({ ctx }) => {
      return getUniversityPipelineQueue(ctx.db);
    }),

  reviewApplication: roleProcedure('university')
    .input(
      z.object({
        documentId: z.string().uuid(),
        action: z.enum(['approved', 'rejected', 'more_info_requested']),
        rejectionReason: z.string().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await reviewPipelineDocument(ctx.db, {
        documentId: input.documentId,
        action: input.action,
        reviewedBy: ctx.user.id,
        rejectionReason: input.rejectionReason,
      });
    }),
});
