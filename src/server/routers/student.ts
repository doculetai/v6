import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { captureException } from '@sentry/nextjs';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import type { DrizzleDB } from '@/db';
import { dashboardRoles } from '@/config/roles';
import { certificates, documents, profiles, programs, sponsorships, studentProfiles } from '@/db/schema';
import {
  connectMonoAccount,
  getStudentVerificationSnapshot,
  startDojahIdentityCheck,
  verificationStatusValues,
} from '@/db/queries/student-verification';
import {
  maxDocumentUploadSizeBytes,
  studentDocumentStatusValues,
  studentDocumentTypeValues,
  supportedDocumentMimeTypes,
} from '@/lib/documents';
import {
  calculateProofChecklistStatus,
  createTamperEvidentToken,
  getLatestIsoTimestamp,
  getSharePathFromToken,
  hasProofProgress,
} from './student-proof-utils';
import {
  cancelPendingInvitation,
  createSponsorInvitation,
  deleteInvitationById,
  findPendingInvitationByStudentAndEmail,
  isPendingInviteConflictError,
  listInvitationsForStudent,
  normalizeEmail,
} from '@/db/queries/sponsor-invitations';
import { sendSponsorInvitationEmail } from '@/lib/email/send-sponsor-invitation-email';

import { createTRPCRouter, protectedProcedure, publicProcedure, roleProcedure } from '../trpc';

const profileRoleSchema = z.enum(dashboardRoles);

// ── Onboarding ──────────────────────────────────────────────────────────────

const fundingTypeValues = ['self', 'sponsor', 'corporate'] as const;

const onboardingWizardOutputSchema = z.object({
  onboardingComplete: z.boolean(),
  currentStep: z.number().int().min(1).max(4),
  selectedSchoolId: z.string().uuid().nullable(),
  selectedProgramId: z.string().uuid().nullable(),
  fundingType: z.enum(fundingTypeValues).nullable(),
  schools: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      country: z.string(),
      programs: z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          tuitionAmount: z.number().int().nonnegative(),
          currency: z.string(),
          durationMonths: z.number().int().positive(),
        }),
      ),
    }),
  ),
});

const saveSchoolProgramInputSchema = z.object({
  schoolId: z.string().uuid(),
  programId: z.string().uuid(),
});

const saveFundingTypeInputSchema = z.object({
  fundingType: z.enum(fundingTypeValues),
});

const onboardingProgressOutputSchema = z.object({
  onboardingComplete: z.boolean(),
  currentStep: z.number().int().min(1).max(4),
});

function clampOnboardingStep(step: number | null | undefined): number {
  if (!step || step < 1) {
    return 1;
  }

  if (step > 4) {
    return 4;
  }

  return step;
}

// ── Verification ─────────────────────────────────────────────────────────────

const verificationStatusSchema = z.object({
  completionPercent: z.number().int().min(0).max(100),
  overallStatus: z.enum(verificationStatusValues),
  tiers: z.array(
    z.object({
      tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      status: z.enum(verificationStatusValues),
      isComplete: z.boolean(),
      updatedAt: z.date().nullable(),
    }),
  ),
  latestDojahCheck: z.object({
    tier: z.union([z.literal(2), z.literal(3)]).nullable(),
    status: z.enum(['pending', 'verified', 'failed']).nullable(),
    referenceId: z.string().nullable(),
    updatedAt: z.date().nullable(),
  }),
  monoConnection: z.object({
    isConnected: z.boolean(),
    bankName: z.string().nullable(),
    accountNumberMasked: z.string().nullable(),
    monoAccountId: z.string().nullable(),
    linkedAt: z.date().nullable(),
  }),
});

const dojahIdentityTypeValues = ['bvn', 'nin', 'passport'] as const;

const startDojahIdentityCheckInputSchema = z.object({
  tier: z.union([z.literal(2), z.literal(3)]),
  identityType: z.enum(dojahIdentityTypeValues),
  identityNumber: z
    .string()
    .trim()
    .min(6)
    .max(32)
    .regex(/^[a-zA-Z0-9]+$/),
});

const startDojahIdentityCheckOutputSchema = z.object({
  referenceId: z.string(),
  tier: z.union([z.literal(2), z.literal(3)]),
  status: z.literal('pending'),
});

const connectMonoBankAccountInputSchema = z.object({
  monoAccountId: z.string().trim().min(4).max(128),
  bankName: z.string().trim().min(2).max(120),
  accountNumber: z.string().trim().regex(/^\d{10}$/),
});

const connectMonoBankAccountOutputSchema = z.object({
  bankName: z.string(),
  accountNumberMasked: z.string(),
  monoAccountId: z.string(),
  linkedAt: z.date(),
});

function toDojahTier(value: number | null | undefined): 2 | 3 | null {
  if (value === 2 || value === 3) {
    return value;
  }

  return null;
}

function toVerificationStatusOutput(snapshot: Awaited<ReturnType<typeof getStudentVerificationSnapshot>>) {
  const tier3OrTier2 = snapshot.latestKycByTier[3] ?? snapshot.latestKycByTier[2] ?? null;
  const latestTier = toDojahTier(tier3OrTier2?.tier);

  return {
    completionPercent: snapshot.progress.completionPercent,
    overallStatus: snapshot.progress.overallStatus,
    tiers: snapshot.progress.tiers,
    latestDojahCheck: {
      tier: latestTier,
      status: tier3OrTier2?.status ?? null,
      referenceId: tier3OrTier2?.referenceId ?? null,
      updatedAt: tier3OrTier2?.updatedAt ?? null,
    },
    monoConnection: {
      isConnected: snapshot.latestBankAccount !== null,
      bankName: snapshot.latestBankAccount?.bankName ?? null,
      accountNumberMasked: snapshot.bankAccountMasked,
      monoAccountId: snapshot.latestBankAccount?.monoAccountId ?? null,
      linkedAt: snapshot.latestBankAccount?.linkedAt ?? null,
    },
  };
}

// ── Documents ────────────────────────────────────────────────────────────────

const storageBucketName = process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'documents';
const storageUploadErrorMessage = 'Unable to upload document right now';

const studentDocumentOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(studentDocumentTypeValues),
  storageUrl: z.string(),
  status: z.enum(studentDocumentStatusValues),
  rejectionReason: z.string().nullable(),
  reviewedAt: z.date().nullable(),
  reviewedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const uploadDocumentInputSchema = z.object({
  documentType: z.enum(studentDocumentTypeValues),
  fileName: z.string().min(1).max(120),
  mimeType: z.enum(supportedDocumentMimeTypes),
  fileSizeBytes: z.number().int().positive().max(maxDocumentUploadSizeBytes),
  fileBase64: z.string().min(1).max(12 * 1024 * 1024),
});

function getStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: storageUploadErrorMessage,
    });
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

function getFileExtensionFromMimeType(mimeType: (typeof supportedDocumentMimeTypes)[number]) {
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }

  if (mimeType === 'image/png') {
    return 'png';
  }

  return 'jpg';
}

function decodeFileBase64(fileBase64: string, expectedSize: number) {
  const normalizedBase64 = fileBase64.replace(/\s/g, '');

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalizedBase64)) {
    throw new TRPCError({ code: 'BAD_REQUEST' });
  }

  const fileBuffer = Buffer.from(normalizedBase64, 'base64');

  if (fileBuffer.byteLength !== expectedSize) {
    throw new TRPCError({ code: 'BAD_REQUEST' });
  }

  return fileBuffer;
}

// ── Proof of Funds ───────────────────────────────────────────────────────────

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

// ── Sponsor Invitations ──────────────────────────────────────────────────────

const inviteSponsorInputSchema = z.object({
  email: z.string().trim().email(),
  note: z.string().trim().max(500).optional(),
});

const invitationStatusSchema = z.enum(['pending', 'accepted', 'declined', 'cancelled']);

const invitationOutputSchema = z.object({
  id: z.string().uuid(),
  inviteeEmail: z.string().email(),
  status: invitationStatusSchema,
  message: z.string().nullable(),
  respondedAt: z.date().nullable(),
  cancelledAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const cancelInviteInputSchema = z.object({
  inviteId: z.string().uuid(),
});

function toInvitationOutput(invitation: {
  id: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string | null;
  respondedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: invitation.id,
    inviteeEmail: invitation.inviteeEmail,
    status: invitation.status,
    message: invitation.message,
    respondedAt: invitation.respondedAt,
    cancelledAt: invitation.cancelledAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
  };
}

// ── Router ───────────────────────────────────────────────────────────────────

export const studentRouter = createTRPCRouter({
  // Profile (from main)
  createProfile: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: profileRoleSchema,
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(profiles)
        .values({
          userId: input.userId,
          role: input.role,
        })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: {
            role: input.role,
            updatedAt: new Date(),
          },
        });
    }),

  getCurrentProfile: protectedProcedure
    .output(
      z.object({
        role: profileRoleSchema,
      }),
    )
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: (table, { eq }) => eq(table.userId, ctx.user.id),
      });

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
      }

      return {
        role: profile.role,
      };
    }),

  // Onboarding (from feat-student-onboarding)
  getOnboardingWizard: roleProcedure('student')
    .output(onboardingWizardOutputSchema)
    .query(async ({ ctx }) => {
      const [existingStudentProfile, schoolsWithPrograms] = await Promise.all([
        ctx.db.query.studentProfiles.findFirst({
          where: eq(studentProfiles.userId, ctx.user.id),
        }),
        ctx.db.query.schools.findMany({
          orderBy: (table, { asc }) => [asc(table.name)],
          with: {
            programs: {
              orderBy: (table, { asc }) => [asc(table.name)],
            },
          },
        }),
      ]);

      return {
        onboardingComplete: ctx.profile.onboardingComplete,
        currentStep: ctx.profile.onboardingComplete
          ? 4
          : clampOnboardingStep(existingStudentProfile?.onboardingStep),
        selectedSchoolId: existingStudentProfile?.schoolId ?? null,
        selectedProgramId: existingStudentProfile?.programId ?? null,
        fundingType: existingStudentProfile?.fundingType ?? null,
        schools: schoolsWithPrograms.map((school) => ({
          id: school.id,
          name: school.name,
          country: school.country,
          programs: school.programs.map((program) => ({
            id: program.id,
            name: program.name,
            tuitionAmount: program.tuitionAmount,
            currency: program.currency,
            durationMonths: program.durationMonths,
          })),
        })),
      };
    }),

  saveSchoolProgram: roleProcedure('student')
    .input(saveSchoolProgramInputSchema)
    .output(onboardingProgressOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const matchingProgram = await ctx.db.query.programs.findFirst({
        where: and(eq(programs.id, input.programId), eq(programs.schoolId, input.schoolId)),
        columns: { id: true },
      });

      if (!matchingProgram) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Program does not belong to selected school.',
        });
      }

      const existingStudentProfile = await ctx.db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, ctx.user.id),
        columns: { id: true, onboardingStep: true },
      });

      if (existingStudentProfile) {
        await ctx.db
          .update(studentProfiles)
          .set({
            schoolId: input.schoolId,
            programId: input.programId,
            onboardingStep: Math.max(existingStudentProfile.onboardingStep, 2),
            updatedAt: new Date(),
          })
          .where(eq(studentProfiles.userId, ctx.user.id));
      } else {
        await ctx.db.insert(studentProfiles).values({
          userId: ctx.user.id,
          schoolId: input.schoolId,
          programId: input.programId,
          onboardingStep: 2,
          updatedAt: new Date(),
        });
      }

      return { onboardingComplete: false, currentStep: 2 };
    }),

  saveFundingType: roleProcedure('student')
    .input(saveFundingTypeInputSchema)
    .output(onboardingProgressOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const existingStudentProfile = await ctx.db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, ctx.user.id),
        columns: { id: true, onboardingStep: true },
      });

      if (existingStudentProfile) {
        await ctx.db
          .update(studentProfiles)
          .set({
            fundingType: input.fundingType,
            onboardingStep: Math.max(existingStudentProfile.onboardingStep, 3),
            updatedAt: new Date(),
          })
          .where(eq(studentProfiles.userId, ctx.user.id));
      } else {
        await ctx.db.insert(studentProfiles).values({
          userId: ctx.user.id,
          fundingType: input.fundingType,
          onboardingStep: 3,
          updatedAt: new Date(),
        });
      }

      return { onboardingComplete: false, currentStep: 3 };
    }),

  completeOnboarding: roleProcedure('student')
    .output(onboardingProgressOutputSchema)
    .mutation(async ({ ctx }) => {
      const existingStudentProfile = await ctx.db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, ctx.user.id),
        columns: {
          schoolId: true,
          programId: true,
          fundingType: true,
        },
      });

      if (
        !existingStudentProfile ||
        !existingStudentProfile.schoolId ||
        !existingStudentProfile.programId ||
        !existingStudentProfile.fundingType
      ) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Complete school, program, and funding type before finishing onboarding.',
        });
      }

      await ctx.db.transaction(async (tx) => {
        await tx
          .update(studentProfiles)
          .set({
            onboardingStep: 4,
            updatedAt: new Date(),
          })
          .where(eq(studentProfiles.userId, ctx.user.id));

        await tx
          .update(profiles)
          .set({
            onboardingComplete: true,
            updatedAt: new Date(),
          })
          .where(eq(profiles.userId, ctx.user.id));
      });

      return { onboardingComplete: true, currentStep: 4 };
    }),

  // Verification (from feat-student-verify)
  getVerificationStatus: roleProcedure('student').output(verificationStatusSchema).query(async ({ ctx }) => {
    try {
      const snapshot = await getStudentVerificationSnapshot(
        ctx.db,
        ctx.user.id,
        ctx.user.email,
        ctx.user.phone,
      );

      return toVerificationStatusOutput(snapshot);
    } catch (error) {
      captureException(error, {
        tags: {
          router: 'student',
          procedure: 'getVerificationStatus',
          role: 'student',
        },
      });

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to load verification status.',
      });
    }
  }),

  startDojahIdentityCheck: roleProcedure('student')
    .input(startDojahIdentityCheckInputSchema)
    .output(startDojahIdentityCheckOutputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const referenceId = `dojah_${input.tier}_${crypto.randomUUID()}`;

        const record = await startDojahIdentityCheck(ctx.db, {
          userId: ctx.user.id,
          tier: input.tier,
          referenceId,
        });

        return {
          referenceId: record.referenceId,
          tier: input.tier,
          status: 'pending',
        };
      } catch (error) {
        captureException(error, {
          tags: {
            router: 'student',
            procedure: 'startDojahIdentityCheck',
            role: 'student',
          },
          extra: {
            tier: input.tier,
            identityType: input.identityType,
          },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to start identity verification.',
        });
      }
    }),

  connectMonoBankAccount: roleProcedure('student')
    .input(connectMonoBankAccountInputSchema)
    .output(connectMonoBankAccountOutputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const linkedAccount = await connectMonoAccount(ctx.db, {
          userId: ctx.user.id,
          monoAccountId: input.monoAccountId,
          bankName: input.bankName,
          accountNumber: input.accountNumber,
        });

        return {
          bankName: linkedAccount.bankName,
          accountNumberMasked: `****${linkedAccount.accountNumber.slice(-4)}`,
          monoAccountId: linkedAccount.monoAccountId,
          linkedAt: linkedAccount.linkedAt,
        };
      } catch (error) {
        captureException(error, {
          tags: {
            router: 'student',
            procedure: 'connectMonoBankAccount',
            role: 'student',
          },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to connect bank account.',
        });
      }
    }),

  // Documents (from feat-student-documents)
  listDocuments: roleProcedure('student')
    .output(z.array(studentDocumentOutputSchema))
    .query(async ({ ctx }) => {
      const studentDocuments = await ctx.db.query.documents.findMany({
        where: eq(documents.userId, ctx.user.id),
        orderBy: [desc(documents.createdAt)],
      });

      return studentDocuments;
    }),

  uploadDocument: roleProcedure('student')
    .input(uploadDocumentInputSchema)
    .output(studentDocumentOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const fileBuffer = decodeFileBase64(input.fileBase64, input.fileSizeBytes);
      const storageClient = getStorageClient();
      const now = new Date();
      const extension = getFileExtensionFromMimeType(input.mimeType);
      const sanitizedName = sanitizeFileName(input.fileName) || `document.${extension}`;
      const storagePath = `${ctx.user.id}/${now.toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID()}-${sanitizedName}`;

      const { error: uploadError } = await storageClient.storage
        .from(storageBucketName)
        .upload(storagePath, fileBuffer, {
          contentType: input.mimeType,
          upsert: false,
        });

      if (uploadError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: storageUploadErrorMessage,
        });
      }

      try {
        const [createdDocument] = await ctx.db
          .insert(documents)
          .values({
            userId: ctx.user.id,
            type: input.documentType,
            storageUrl: storagePath,
            status: 'pending',
          })
          .returning();

        if (!createdDocument) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: storageUploadErrorMessage,
          });
        }

        return createdDocument;
      } catch {
        await storageClient.storage.from(storageBucketName).remove([storagePath]);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: storageUploadErrorMessage,
        });
      }
    }),

  // Proof of Funds (from feat-student-proof)
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

  // Sponsor Invitations (from feat-student-sponsor-invite)
  listSponsorInvites: roleProcedure('student')
    .output(z.array(invitationOutputSchema))
    .query(async ({ ctx }) => {
      const invitations = await listInvitationsForStudent(ctx.db, ctx.user.id);
      return invitations.map(toInvitationOutput);
    }),

  inviteSponsorByEmail: roleProcedure('student')
    .input(inviteSponsorInputSchema)
    .output(invitationOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const inviteeEmail = normalizeEmail(input.email);
      const studentEmail = normalizeEmail(ctx.user.email ?? '');

      if (!studentEmail) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Student account email is required before sending invitations.',
        });
      }

      if (inviteeEmail === studentEmail) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot invite your own email address.',
        });
      }

      const existingPendingInvite = await findPendingInvitationByStudentAndEmail(
        ctx.db,
        ctx.user.id,
        inviteeEmail,
      );

      if (existingPendingInvite) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A pending invitation already exists for this email.',
        });
      }

      let invitationId: string | null = null;

      try {
        const invitation = await createSponsorInvitation(ctx.db, {
          studentId: ctx.user.id,
          inviteeEmail,
          message: input.note,
        });
        invitationId = invitation.id;

        await sendSponsorInvitationEmail({
          toEmail: inviteeEmail,
          studentEmail,
          note: input.note,
        });

        return toInvitationOutput(invitation);
      } catch (error) {
        if (invitationId) {
          await deleteInvitationById(ctx.db, invitationId);
        }

        if (isPendingInviteConflictError(error)) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A pending invitation already exists for this email.',
          });
        }

        if (error instanceof TRPCError) {
          throw error;
        }

        captureException(error, {
          tags: {
            domain: 'sponsor-invitations',
            operation: 'invite-sponsor-by-email',
          },
          extra: {
            studentId: ctx.user.id,
            inviteeEmail,
          },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to send sponsor invitation right now.',
        });
      }
    }),

  cancelSponsorInvite: roleProcedure('student')
    .input(cancelInviteInputSchema)
    .output(invitationOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const invitation = await cancelPendingInvitation(ctx.db, {
        inviteId: input.inviteId,
        studentId: ctx.user.id,
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pending invitation not found.',
        });
      }

      return toInvitationOutput(invitation);
    }),
});

// ── Proof snapshot helpers ────────────────────────────────────────────────────

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
