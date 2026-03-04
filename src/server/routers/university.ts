import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  getDocumentById,
  getDocumentStats,
  listDocumentsForReview,
  reviewDocument,
} from '@/db/queries/university-documents';
import { createTRPCRouter, roleProcedure } from '../trpc';

const DocumentStatusSchema = z.enum(['pending', 'approved', 'rejected', 'more_info_requested']);

const DocumentTypeSchema = z.enum([
  'passport',
  'bank_statement',
  'offer_letter',
  'affidavit',
  'cac',
]);

const DocumentItemSchema = z.object({
  id: z.string(),
  type: DocumentTypeSchema,
  status: DocumentStatusSchema,
  storageUrl: z.string(),
  rejectionReason: z.string().nullable(),
  reviewedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  studentEmail: z.string(),
});

const DocumentStatsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  approved: z.number(),
  moreInfoRequested: z.number(),
});

function toDocumentItem(row: NonNullable<Awaited<ReturnType<typeof getDocumentById>>>) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    storageUrl: row.storageUrl,
    rejectionReason: row.rejectionReason,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    studentEmail: row.user.email,
  };
}

export const universityRouter = createTRPCRouter({
  listDocuments: roleProcedure('university')
    .input(z.object({ status: DocumentStatusSchema.optional() }))
    .output(z.array(DocumentItemSchema))
    .query(async ({ ctx, input }) => {
      const rows = await listDocumentsForReview(ctx.db, { status: input.status });
      return rows.map(toDocumentItem);
    }),

  getDocumentStats: roleProcedure('university')
    .output(DocumentStatsSchema)
    .query(async ({ ctx }) => {
      return getDocumentStats(ctx.db);
    }),

  reviewDocument: roleProcedure('university')
    .input(
      z.object({
        documentId: z.string().uuid(),
        action: z.enum(['approved', 'rejected', 'more_info_requested']),
        notes: z.string().optional(),
      }),
    )
    .output(DocumentItemSchema)
    .mutation(async ({ ctx, input }) => {
      const updated = await reviewDocument(ctx.db, input.documentId, ctx.user.id, {
        status: input.action,
        rejectionReason: input.notes,
      });

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found.' });
      }

      const row = await getDocumentById(ctx.db, updated.id);

      if (!row) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return toDocumentItem(row);
    }),
});
