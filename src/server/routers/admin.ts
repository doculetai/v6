import { z } from 'zod';

import {
  bulkReviewDocuments,
  getOperationsQueue,
  getOperationsStats,
  reviewDocument,
} from '@/db/queries/admin-operations';

import { createTRPCRouter, roleProcedure } from '../trpc';

const documentStatusSchema = z.enum(['pending', 'approved', 'rejected', 'more_info_requested']);
const statusFilterSchema = z.enum([
  'all',
  'pending',
  'approved',
  'rejected',
  'more_info_requested',
]);

const operationsQueueRowSchema = z.object({
  id: z.string(),
  type: z.string(),
  status: documentStatusSchema,
  rejectionReason: z.string().nullable(),
  reviewedAt: z.date().nullable(),
  createdAt: z.date(),
  studentEmail: z.string(),
  reviewerEmail: z.string().nullable(),
  schoolName: z.string().nullable(),
  kycStatus: z.string().nullable(),
  bankStatus: z.string().nullable(),
});

const operationsStatsSchema = z.object({
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
  moreInfoRequested: z.number(),
  approvedToday: z.number(),
  rejectedToday: z.number(),
});

export const adminRouter = createTRPCRouter({
  getOperationsQueue: roleProcedure('admin')
    .input(
      z.object({
        status: statusFilterSchema.optional().default('all'),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      }),
    )
    .output(z.array(operationsQueueRowSchema))
    .query(async ({ ctx, input }) => {
      return getOperationsQueue(ctx.db, input);
    }),

  getOperationsStats: roleProcedure('admin')
    .output(operationsStatsSchema)
    .query(async ({ ctx }) => {
      return getOperationsStats(ctx.db);
    }),

  reviewDocument: roleProcedure('admin')
    .input(
      z.object({
        documentId: z.string(),
        status: documentStatusSchema,
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await reviewDocument(ctx.db, input.documentId, ctx.user.id, {
        status: input.status,
        reason: input.reason,
      });
    }),

  bulkReviewDocuments: roleProcedure('admin')
    .input(
      z.object({
        documentIds: z.array(z.string()).min(1).max(100),
        status: documentStatusSchema,
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await bulkReviewDocuments(ctx.db, input.documentIds, ctx.user.id, {
        status: input.status,
        reason: input.reason,
      });
    }),
});
