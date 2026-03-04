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
      const [allProfiles, allSponsorships, allDisbursements, allDocuments, allCerts, allKyc] =
        await Promise.all([
          ctx.db.query.profiles.findMany({ columns: { role: true } }),
          ctx.db.query.sponsorships.findMany({ columns: { amountKobo: true, status: true } }),
          ctx.db.query.disbursements.findMany({ columns: { amountKobo: true, status: true } }),
          ctx.db.query.documents.findMany({ columns: { status: true } }),
          ctx.db.query.certificates.findMany({ columns: { id: true } }),
          ctx.db.query.kycVerifications.findMany({ columns: { status: true, userId: true } }),
        ]);

      return {
        totalUsers: allProfiles.length,
        totalStudents: allProfiles.filter((p) => p.role === 'student').length,
        totalSponsors: allProfiles.filter((p) => p.role === 'sponsor').length,
        totalSponsorships: allSponsorships.length,
        totalCommittedKobo: allSponsorships
          .filter((s) => s.status === 'active')
          .reduce((sum, s) => sum + s.amountKobo, 0),
        totalDisbursedKobo: allDisbursements
          .filter((d) => d.status === 'disbursed')
          .reduce((sum, d) => sum + d.amountKobo, 0),
        pendingDocuments: allDocuments.filter((d) => d.status === 'pending').length,
        approvedDocuments: allDocuments.filter((d) => d.status === 'approved').length,
        issuedCertificates: allCerts.length,
        kycVerifiedStudents: new Set(
          allKyc.filter((k) => k.status === 'verified').map((k) => k.userId),
        ).size,
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
      // Fetch all users, then join with profiles in memory for simplicity.
      // For large datasets a proper SQL join would be preferred, but this
      // keeps the code readable and TypeScript-friendly.
      const allUsers = await ctx.db.query.users.findMany({
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      const allProfiles = await ctx.db.query.profiles.findMany({
        columns: { userId: true, role: true, onboardingComplete: true },
      });

      const profileMap = new Map(allProfiles.map((p) => [p.userId, p]));

      // Filter by search (email) and role
      let filtered = allUsers;
      if (input.search) {
        const term = input.search.toLowerCase();
        filtered = filtered.filter((u) => u.email.toLowerCase().includes(term));
      }
      if (input.role) {
        const roleFilter = input.role;
        filtered = filtered.filter((u) => profileMap.get(u.id)?.role === roleFilter);
      }

      const total = filtered.length;
      const paginated = filtered.slice(input.offset, input.offset + input.limit);

      return {
        users: paginated.map((u) => {
          const profile = profileMap.get(u.id);
          return {
            id: u.id,
            email: u.email,
            role: profile?.role ?? null,
            onboardingComplete: profile?.onboardingComplete ?? false,
            createdAt: u.createdAt,
          };
        }),
        total,
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
});
