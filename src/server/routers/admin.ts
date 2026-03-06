import { captureException } from '@sentry/nextjs';
import { TRPCError } from '@trpc/server';
import { and, eq, ilike, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';

import {
  certificates,
  disbursements,
  documents,
  kycVerifications,
  profiles,
  sponsorships,
  users,
} from '@/db/schema';
import {
  bulkReviewDocuments,
  getOperationsQueue,
  getOperationsStats,
  reviewDocument,
} from '@/db/queries/admin-operations';
import {
  createPlatformFeeConfig,
  endPlatformFeeConfig,
  listPlatformFeeConfig,
  updatePlatformFeeConfig,
} from '@/db/queries/platform-fees';
import { listTransactions } from '@/db/queries/admin-transactions';
import { insertAuditLog } from '@/db/queries/audit-log';
import { sendDocumentStatusEmail } from '@/lib/email/send-document-status-email';
import { enqueueWebhooks } from '@/lib/outbound-webhooks';
import { removeDocumentFile } from '@/lib/storage';

import { createTRPCRouter, roleProcedure } from '../trpc';

const documentStatusSchema = z.enum(['pending', 'approved', 'rejected', 'more_info_requested', 'expired']);
const statusFilterSchema = z.enum([
  'all',
  'pending',
  'approved',
  'rejected',
  'more_info_requested',
  'expired',
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
  expired: z.number(),
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
        status: z.enum(['approved', 'rejected', 'more_info_requested']),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [doc] = await ctx.db
        .select({ userId: documents.userId })
        .from(documents)
        .where(eq(documents.id, input.documentId))
        .limit(1);
      if (!doc) throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });

      const [user] = await ctx.db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, doc.userId))
        .limit(1);

      await reviewDocument(ctx.db, input.documentId, ctx.user!.id, {
        status: input.status,
        reason: input.reason,
      });
      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'admin.reviewDocument',
        entityType: 'document',
        entityId: input.documentId,
        meta: { status: input.status, reason: input.reason },
        ip: ctx.ip ?? undefined,
        userAgent: ctx.userAgent ?? undefined,
      });

      if (user?.email) {
        try {
          await sendDocumentStatusEmail({
            toEmail: user.email,
            status: input.status,
            reason: input.reason,
          });
        } catch {
          // Logged; do not fail the mutation
        }
      }

      if (input.status === 'approved') {
        try {
          await enqueueWebhooks('document.approved', {
            documentId: input.documentId,
            userId: doc.userId,
            status: 'approved',
          });
        } catch {
          // Logged; do not fail
        }
      } else if (input.status === 'rejected' || input.status === 'more_info_requested') {
        try {
          await enqueueWebhooks(
            input.status === 'rejected' ? 'document.rejected' : 'document.more_info_requested',
            {
              documentId: input.documentId,
              userId: doc.userId,
              status: input.status,
              rejectionReason: input.reason ?? null,
            },
          );
        } catch {
          // Logged; do not fail
        }
      }
    }),

  bulkReviewDocuments: roleProcedure('admin')
    .input(
      z.object({
        documentIds: z.array(z.string()).min(1).max(100),
        status: z.enum(['approved', 'rejected', 'more_info_requested']),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const docs = await ctx.db
        .select({ id: documents.id, userId: documents.userId })
        .from(documents)
        .where(inArray(documents.id, input.documentIds));

      const userIds = [...new Set(docs.map((d) => d.userId))];
      const userRows = await ctx.db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(inArray(users.id, userIds));
      const emailByUserId = new Map(userRows.map((u) => [u.id, u.email]));

      await bulkReviewDocuments(ctx.db, input.documentIds, ctx.user!.id, {
        status: input.status,
        reason: input.reason,
      });

      for (const doc of docs) {
        const email = emailByUserId.get(doc.userId);
        if (email) {
          try {
            await sendDocumentStatusEmail({
              toEmail: email,
              status: input.status,
              reason: input.reason,
            });
          } catch {
            // Logged; do not fail the mutation
          }
        }
        if (input.status === 'approved') {
          try {
            await enqueueWebhooks('document.approved', {
              documentId: doc.id,
              userId: doc.userId,
              status: 'approved',
            });
          } catch {
            // Logged
          }
        } else if (input.status === 'rejected' || input.status === 'more_info_requested') {
          try {
            await enqueueWebhooks(
              input.status === 'rejected' ? 'document.rejected' : 'document.more_info_requested',
              {
                documentId: doc.id,
                userId: doc.userId,
                status: input.status,
                rejectionReason: input.reason ?? null,
              },
            );
          } catch {
            // Logged
          }
        }
      }
    }),

  deleteDocument: roleProcedure('admin')
    .input(z.object({ documentId: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db.query.documents.findFirst({
        where: eq(documents.id, input.documentId),
      });
      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }

      await removeDocumentFile(doc.storageUrl);

      try {
        await ctx.db.delete(documents).where(eq(documents.id, input.documentId));
      } catch (err) {
        captureException(err, {
          tags: { domain: 'admin', operation: 'deleteDocument' },
          extra: { documentId: input.documentId },
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Document removed from storage but database delete failed',
        });
      }
      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'admin.deleteDocument',
        entityType: 'document',
        ip: ctx.ip ?? undefined,
        userAgent: ctx.userAgent ?? undefined,
        entityId: input.documentId,
        meta: {},
      });
    }),

  getPlatformAnalytics: roleProcedure('admin')
    .output(
      z.object({
        totalUsers: z.number(),
        totalStudents: z.number(),
        totalSponsors: z.number(),
        totalSponsorships: z.number(),
        totalCommittedKobo: z.number(),
        totalDisbursedKobo: z.number(),
        pendingDocuments: z.number(),
        approvedDocuments: z.number(),
        issuedCertificates: z.number(),
        kycVerifiedStudents: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const [
        profileCounts,
        sponsorshipAgg,
        disbursementAgg,
        docCounts,
        certCount,
        kycCount,
      ] = await Promise.all([
        ctx.db
          .select({ role: profiles.role, count: sql<number>`count(*)::int` })
          .from(profiles)
          .groupBy(profiles.role),
        ctx.db
          .select({
            total: sql<number>`count(*)::int`,
            committedKobo: sql<number>`coalesce(sum(case when ${sponsorships.status} = 'active' then ${sponsorships.amountKobo} else 0 end), 0)::int`,
          })
          .from(sponsorships),
        ctx.db
          .select({
            disbursedKobo: sql<number>`coalesce(sum(case when ${disbursements.status} = 'disbursed' then ${disbursements.amountKobo} else 0 end), 0)::int`,
          })
          .from(disbursements),
        ctx.db
          .select({ status: documents.status, count: sql<number>`count(*)::int` })
          .from(documents)
          .groupBy(documents.status),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(certificates),
        ctx.db
          .select({ count: sql<number>`count(distinct ${kycVerifications.userId})::int` })
          .from(kycVerifications)
          .where(eq(kycVerifications.status, 'verified')),
      ]);

      const roleMap: Record<string, number> = {};
      let totalUsers = 0;
      for (const row of profileCounts) {
        roleMap[row.role] = row.count;
        totalUsers += row.count;
      }

      const docMap: Record<string, number> = {};
      for (const row of docCounts) {
        docMap[row.status] = row.count;
      }

      return {
        totalUsers,
        totalStudents: roleMap['student'] ?? 0,
        totalSponsors: roleMap['sponsor'] ?? 0,
        totalSponsorships: sponsorshipAgg[0]?.total ?? 0,
        totalCommittedKobo: sponsorshipAgg[0]?.committedKobo ?? 0,
        totalDisbursedKobo: disbursementAgg[0]?.disbursedKobo ?? 0,
        pendingDocuments: docMap['pending'] ?? 0,
        approvedDocuments: docMap['approved'] ?? 0,
        issuedCertificates: certCount[0]?.count ?? 0,
        kycVerifiedStudents: kycCount[0]?.count ?? 0,
      };
    }),

  listAllUsers: roleProcedure('admin')
    .input(
      z.object({
        search: z.string().optional(),
        role: z
          .enum(['student', 'sponsor', 'university', 'admin', 'agent', 'partner'])
          .optional(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .output(
      z.object({
        users: z.array(
          z.object({
            id: z.string(),
            email: z.string().nullable(),
            role: z
              .enum(['student', 'sponsor', 'university', 'admin', 'agent', 'partner'])
              .nullable(),
            onboardingComplete: z.boolean(),
            createdAt: z.date(),
          }),
        ),
        total: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.search) {
        conditions.push(ilike(users.email, `%${input.search}%`));
      }
      if (input.role) {
        conditions.push(eq(profiles.role, input.role));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [rows, totalRow] = await Promise.all([
        ctx.db
          .select({
            id: users.id,
            email: users.email,
            role: profiles.role,
            onboardingComplete: profiles.onboardingComplete,
            createdAt: users.createdAt,
          })
          .from(users)
          .leftJoin(profiles, eq(profiles.userId, users.id))
          .where(whereClause)
          .orderBy(sql`${users.createdAt} desc`)
          .limit(input.limit)
          .offset(input.offset),
        ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
          .leftJoin(profiles, eq(profiles.userId, users.id))
          .where(whereClause),
      ]);

      return {
        users: rows.map((r) => ({
          id: r.id,
          email: r.email,
          role: r.role ?? null,
          onboardingComplete: r.onboardingComplete ?? false,
          createdAt: r.createdAt,
        })),
        total: totalRow[0]?.count ?? 0,
      };
    }),

  getRiskFlags: roleProcedure('admin')
    .output(
      z.array(
        z.object({
          type: z.enum([
            'repeated_kyc_failure',
            'repeated_document_rejection',
            'unverified_with_active_sponsorship',
          ]),
          userId: z.string(),
          userEmail: z.string().nullable(),
          severity: z.enum(['low', 'medium', 'high']),
          detail: z.string(),
          detectedAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      type RiskFlagType =
        | 'repeated_kyc_failure'
        | 'repeated_document_rejection'
        | 'unverified_with_active_sponsorship';
      type Severity = 'low' | 'medium' | 'high';

      const flags: Array<{
        type: RiskFlagType;
        userId: string;
        userEmail: string | null;
        severity: Severity;
        detail: string;
        detectedAt: Date;
      }> = [];

      const [kycRows, docRows, sponsorshipRows] = await Promise.all([
        ctx.db.query.kycVerifications.findMany({
          where: (t, { eq: eqFn }) => eqFn(t.status, 'failed'),
          columns: { userId: true, createdAt: true },
          orderBy: (t, { desc }) => [desc(t.createdAt)],
        }),
        ctx.db.query.documents.findMany({
          where: (t, { eq: eqFn }) => eqFn(t.status, 'rejected'),
          columns: { userId: true, createdAt: true },
          orderBy: (t, { desc }) => [desc(t.createdAt)],
        }),
        ctx.db.query.sponsorships.findMany({
          where: (t, { eq: eqFn }) => eqFn(t.status, 'active'),
          columns: { studentId: true, createdAt: true },
        }),
      ]);

      // Group KYC failures by userId
      const kycFailMap = new Map<string, Date[]>();
      for (const row of kycRows) {
        const existing = kycFailMap.get(row.userId) ?? [];
        existing.push(row.createdAt);
        kycFailMap.set(row.userId, existing);
      }

      // Group document rejections by userId
      const docRejectMap = new Map<string, Date[]>();
      for (const row of docRows) {
        const existing = docRejectMap.get(row.userId) ?? [];
        existing.push(row.createdAt);
        docRejectMap.set(row.userId, existing);
      }

      // Collect all flagged user IDs to fetch emails
      const flaggedUserIds = new Set<string>();

      for (const [userId, dates] of kycFailMap.entries()) {
        if (dates.length >= 2) flaggedUserIds.add(userId);
      }
      for (const [userId, dates] of docRejectMap.entries()) {
        if (dates.length >= 3) flaggedUserIds.add(userId);
      }

      // Check unverified students with active sponsorships
      const activeSponsorStudentIds = new Set(sponsorshipRows.map((s) => s.studentId));
      if (activeSponsorStudentIds.size > 0) {
        const studentProfileRows = await ctx.db.query.studentProfiles.findMany({
          where: (t, { inArray: inArrayFn, notInArray }) =>
            inArrayFn(t.userId, [...activeSponsorStudentIds]),
          columns: { userId: true, kycStatus: true },
        });
        for (const sp of studentProfileRows) {
          if (sp.kycStatus !== 'verified') flaggedUserIds.add(sp.userId);
        }
      }

      if (flaggedUserIds.size === 0) return [];

      const userRows = await ctx.db.query.users.findMany({
        where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, [...flaggedUserIds]),
        columns: { id: true, email: true },
      });
      const emailMap = new Map(userRows.map((u) => [u.id, u.email]));

      // Build KYC failure flags
      for (const [userId, dates] of kycFailMap.entries()) {
        if (dates.length >= 2) {
          flags.push({
            type: 'repeated_kyc_failure',
            userId,
            userEmail: emailMap.get(userId) ?? null,
            severity: dates.length >= 4 ? 'high' : 'medium',
            detail: `${dates.length} failed KYC attempts`,
            detectedAt: dates[0]!,
          });
        }
      }

      // Build document rejection flags
      for (const [userId, dates] of docRejectMap.entries()) {
        if (dates.length >= 3) {
          flags.push({
            type: 'repeated_document_rejection',
            userId,
            userEmail: emailMap.get(userId) ?? null,
            severity: dates.length >= 5 ? 'high' : 'medium',
            detail: `${dates.length} rejected documents`,
            detectedAt: dates[0]!,
          });
        }
      }

      // Build unverified-with-active-sponsorship flags
      if (activeSponsorStudentIds.size > 0) {
        const studentProfileRows = await ctx.db.query.studentProfiles.findMany({
          where: (t, { inArray: inArrayFn }) =>
            inArrayFn(t.userId, [...activeSponsorStudentIds]),
          columns: { userId: true, kycStatus: true, createdAt: true },
        });
        for (const sp of studentProfileRows) {
          if (sp.kycStatus !== 'verified') {
            flags.push({
              type: 'unverified_with_active_sponsorship',
              userId: sp.userId,
              userEmail: emailMap.get(sp.userId) ?? null,
              severity: 'low',
              detail: `Active sponsorship but KYC status is "${sp.kycStatus}"`,
              detectedAt: sp.createdAt,
            });
          }
        }
      }

      return flags;
    }),

  listPlatformFeeConfig: roleProcedure('admin')
    .output(
      z.array(
        z.object({
          id: z.string(),
          feeType: z.enum(['percentage', 'fixed']),
          valueKobo: z.number(),
          currency: z.string(),
          effectiveFrom: z.date(),
          effectiveTo: z.date().nullable(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => listPlatformFeeConfig(ctx.db)),

  createPlatformFeeConfig: roleProcedure('admin')
    .input(
      z.object({
        feeType: z.enum(['percentage', 'fixed']),
        valueKobo: z.number().int().min(0),
        currency: z.string().min(1).max(10),
        effectiveFrom: z.date().optional(),
      }),
    )
    .output(
      z.object({
        id: z.string(),
        feeType: z.enum(['percentage', 'fixed']),
        valueKobo: z.number(),
        currency: z.string(),
        effectiveFrom: z.date(),
        effectiveTo: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const row = await createPlatformFeeConfig(ctx.db, input);
      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'admin.createPlatformFeeConfig',
        entityType: 'platform_fee_config',
        entityId: row.id,
        meta: { feeType: row.feeType, valueKobo: row.valueKobo, currency: row.currency },
        ip: ctx.ip ?? undefined,
        userAgent: ctx.userAgent ?? undefined,
      });
      return row;
    }),

  updatePlatformFeeConfig: roleProcedure('admin')
    .input(
      z.object({
        id: z.string().uuid(),
        valueKobo: z.number().int().min(0).optional(),
        effectiveFrom: z.date().optional(),
      }),
    )
    .output(
      z
        .object({
          id: z.string(),
          feeType: z.enum(['percentage', 'fixed']),
          valueKobo: z.number(),
          currency: z.string(),
          effectiveFrom: z.date(),
          effectiveTo: z.date().nullable(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
        .nullable(),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const row = await updatePlatformFeeConfig(ctx.db, id, rest);
      if (row) {
        await insertAuditLog(ctx.db, {
          actorId: ctx.user!.id,
          action: 'admin.updatePlatformFeeConfig',
          entityType: 'platform_fee_config',
          entityId: id,
          meta: rest,
          ip: ctx.ip ?? undefined,
          userAgent: ctx.userAgent ?? undefined,
        });
      }
      return row;
    }),

  endPlatformFeeConfig: roleProcedure('admin')
    .input(z.object({ id: z.string().uuid(), effectiveTo: z.date().optional() }))
    .output(
      z
        .object({
          id: z.string(),
          feeType: z.enum(['percentage', 'fixed']),
          valueKobo: z.number(),
          currency: z.string(),
          effectiveFrom: z.date(),
          effectiveTo: z.date().nullable(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
        .nullable(),
    )
    .mutation(async ({ ctx, input }) => {
      const row = await endPlatformFeeConfig(ctx.db, input.id, input.effectiveTo);
      if (row) {
        await insertAuditLog(ctx.db, {
          actorId: ctx.user!.id,
          action: 'admin.endPlatformFeeConfig',
          entityType: 'platform_fee_config',
          entityId: input.id,
          ip: ctx.ip ?? undefined,
          userAgent: ctx.userAgent ?? undefined,
        });
      }
      return row;
    }),

  listTransactions: roleProcedure('admin')
    .input(
      z.object({
        type: z.enum(['disbursement', 'platform_fee', 'refund', 'reversal', 'credit', 'debit']).optional(),
        entityType: z.string().optional(),
        entityId: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      }),
    )
    .output(
      z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          entityType: z.string(),
          entityId: z.string().nullable(),
          amountKobo: z.number(),
          currency: z.string(),
          userId: z.string().nullable(),
          meta: z.string().nullable(),
          createdAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => listTransactions(ctx.db, input)),
});
