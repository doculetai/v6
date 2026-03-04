import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import type { DrizzleDB } from '@/db';
import {
  certificates,
  documents,
  sponsorships,
  studentProfiles,
} from '@/db/schema';

import { createTRPCRouter, roleProcedure } from '../trpc';
import {
  calculateProofChecklistStatus,
  createTamperEvidentToken,
  getLatestIsoTimestamp,
  getSharePathFromToken,
  hasProofProgress,
} from './student-proof-utils';

const proofChecklistSchema = z.object({
  kycComplete: z.boolean(),
  bankComplete: z.boolean(),
  sponsorComplete: z.boolean(),
  documentsComplete: z.boolean(),
  completedCount: z.number().int().min(0),
  totalCount: z.number().int().min(1),
});

const proofCertificateSchema = z.object({
  issued: z.boolean(),
  certificateId: z.string().uuid().nullable(),
  issuedAt: z.string().datetime().nullable(),
  sharePath: z.string().nullable(),
});

const proofTrustSchema = z.object({
  sponsorCount: z.number().int().min(0),
  committedAmountKobo: z.number().int().min(0),
  currency: z.string(),
  approvedDocumentCount: z.number().int().min(0),
  pendingDocumentCount: z.number().int().min(0),
  lastAuditAt: z.string().datetime().nullable(),
});

const getProofCertificateOutputSchema = z.object({
  checklist: proofChecklistSchema,
  certificate: proofCertificateSchema,
  trust: proofTrustSchema,
  hasAnyProgress: z.boolean(),
  canGenerateShareLink: z.boolean(),
});

const generateProofShareLinkOutputSchema = z.object({
  certificateId: z.string().uuid(),
  issuedAt: z.string().datetime(),
  sharePath: z.string(),
  reusedExistingCertificate: z.boolean(),
});

export const studentRouter = createTRPCRouter({
  getProofCertificate: roleProcedure('student')
    .output(getProofCertificateOutputSchema)
    .query(async ({ ctx }) => {
      const snapshot = await getProofSnapshot(ctx.user.id, ctx.db);

      return {
        checklist: snapshot.checklist,
        certificate: {
          issued: Boolean(snapshot.activeCertificate),
          certificateId: snapshot.activeCertificate?.id ?? null,
          issuedAt: snapshot.activeCertificate?.issuedAt.toISOString() ?? null,
          sharePath: snapshot.activeCertificate
            ? getSharePathFromToken(snapshot.activeCertificate.token)
            : null,
        },
        trust: {
          sponsorCount: snapshot.uniqueSponsorCount,
          committedAmountKobo: snapshot.committedAmountKobo,
          currency: snapshot.currency,
          approvedDocumentCount: snapshot.approvedDocumentCount,
          pendingDocumentCount: snapshot.pendingDocumentCount,
          lastAuditAt: snapshot.lastAuditAt,
        },
        hasAnyProgress: snapshot.hasAnyProgress,
        canGenerateShareLink: snapshot.canGenerateShareLink,
      };
    }),

  generateProofShareLink: roleProcedure('student')
    .input(z.void())
    .output(generateProofShareLinkOutputSchema)
    .mutation(async ({ ctx }) => {
      const snapshot = await getProofSnapshot(ctx.user.id, ctx.db);

      if (!snapshot.canGenerateShareLink) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Complete all proof checklist items before generating a share link.',
        });
      }

      if (snapshot.activeCertificate) {
        return {
          certificateId: snapshot.activeCertificate.id,
          issuedAt: snapshot.activeCertificate.issuedAt.toISOString(),
          sharePath: getSharePathFromToken(snapshot.activeCertificate.token),
          reusedExistingCertificate: true,
        };
      }

      const issuedAt = new Date();
      const token = createTamperEvidentToken({
        studentId: ctx.user.id,
        issuedAt,
        secret: getCertificateShareSecret(),
      });

      const [createdCertificate] = await ctx.db
        .insert(certificates)
        .values({
          studentId: ctx.user.id,
          token,
          issuedAt,
          status: 'active',
          metaJson: {
            signatureVersion: 1,
            issuedByProcedure: 'student.generateProofShareLink',
          },
        })
        .returning({
          id: certificates.id,
          issuedAt: certificates.issuedAt,
          token: certificates.token,
        });

      if (!createdCertificate) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return {
        certificateId: createdCertificate.id,
        issuedAt: createdCertificate.issuedAt.toISOString(),
        sharePath: getSharePathFromToken(createdCertificate.token),
        reusedExistingCertificate: false,
      };
    }),
});

async function getProofSnapshot(userId: string, db: DrizzleDB) {
  const { profile, documentRecords, sponsors, activeCertificate } = await loadProofRecords(userId, db);
  const { approvedDocumentCount, pendingDocumentCount } = summarizeDocuments(documentRecords);
  const { uniqueSponsorCount, committedAmountKobo, currency } = summarizeSponsors(sponsors);

  const checklist = calculateProofChecklistStatus({
    kycStatus: profile?.kycStatus ?? null,
    bankStatus: profile?.bankStatus ?? null,
    approvedDocumentCount,
    sponsorCount: uniqueSponsorCount,
  });

  const hasAnyProgress = hasProofProgress({
    hasStudentProfile: Boolean(profile),
    kycStatus: profile?.kycStatus ?? null,
    bankStatus: profile?.bankStatus ?? null,
    uploadedDocumentCount: documentRecords.length,
    sponsorCount: uniqueSponsorCount,
  });

  const activityTimestamps = collectActivityTimestamps({
    profileUpdatedAt: profile?.updatedAt ?? null,
    certificateIssuedAt: activeCertificate?.issuedAt ?? null,
    documentRecords,
    sponsors,
  });

  return {
    uniqueSponsorCount,
    activeCertificate,
    checklist,
    committedAmountKobo,
    currency,
    approvedDocumentCount,
    pendingDocumentCount,
    hasAnyProgress,
    canGenerateShareLink: checklist.completedCount === checklist.totalCount,
    lastAuditAt: getLatestIsoTimestamp(activityTimestamps),
  };
}

async function loadProofRecords(userId: string, db: DrizzleDB) {
  const [profile, documentRecords, sponsors, activeCertificate] = await Promise.all([
    db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
      columns: {
        kycStatus: true,
        bankStatus: true,
        updatedAt: true,
      },
    }),
    db.query.documents.findMany({
      where: eq(documents.userId, userId),
      columns: {
        status: true,
        updatedAt: true,
      },
    }),
    db.query.sponsorships.findMany({
      where: and(
        eq(sponsorships.studentId, userId),
        inArray(sponsorships.status, ['active', 'completed']),
      ),
      columns: {
        amountKobo: true,
        currency: true,
        updatedAt: true,
        sponsorId: true,
      },
    }),
    db.query.certificates.findFirst({
      where: and(eq(certificates.studentId, userId), eq(certificates.status, 'active')),
      columns: {
        id: true,
        issuedAt: true,
        token: true,
      },
      orderBy: (table, { desc }) => [desc(table.issuedAt)],
    }),
  ]);

  return { profile, documentRecords, sponsors, activeCertificate };
}

function summarizeDocuments(documentRecords: { status: string; updatedAt: Date }[]) {
  const approvedDocumentCount = documentRecords.filter((record) => record.status === 'approved').length;
  const pendingDocumentCount = documentRecords.filter(
    (record) => record.status === 'pending' || record.status === 'more_info_requested',
  ).length;

  return { approvedDocumentCount, pendingDocumentCount };
}

function summarizeSponsors(sponsors: { sponsorId: string; amountKobo: number; currency: string }[]) {
  const uniqueSponsorCount = new Set(sponsors.map((sponsor) => sponsor.sponsorId)).size;
  const committedAmountKobo = sponsors.reduce((total, sponsor) => total + sponsor.amountKobo, 0);
  const currency = sponsors[0]?.currency ?? 'NGN';

  return { uniqueSponsorCount, committedAmountKobo, currency };
}

type CollectActivityTimestampsInput = {
  profileUpdatedAt: Date | null;
  certificateIssuedAt: Date | null;
  documentRecords: { updatedAt: Date }[];
  sponsors: { updatedAt: Date }[];
};

function collectActivityTimestamps({
  profileUpdatedAt,
  certificateIssuedAt,
  documentRecords,
  sponsors,
}: CollectActivityTimestampsInput): Date[] {
  return [
    profileUpdatedAt,
    certificateIssuedAt,
    ...documentRecords.map((record) => record.updatedAt),
    ...sponsors.map((sponsor) => sponsor.updatedAt),
  ].filter((value): value is Date => Boolean(value));
}

function getCertificateShareSecret(): string {
  const secret =
    process.env.CERTIFICATE_SHARE_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.DATABASE_URL;

  if (!secret) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Certificate signing secret is not configured.',
    });
  }

  return secret;
}
