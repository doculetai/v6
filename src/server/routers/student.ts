import { TRPCError } from '@trpc/server';
import { captureException } from '@sentry/nextjs';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { dashboardRoles } from '@/config/roles';
import { profiles, programs, studentProfiles } from '@/db/schema';
import {
  connectMonoAccount,
  getStudentVerificationSnapshot,
  startDojahIdentityCheck,
  verificationStatusValues,
} from '@/db/queries/student-verification';

import { createTRPCRouter, protectedProcedure, publicProcedure, roleProcedure } from '../trpc';

const profileRoleSchema = z.enum(dashboardRoles);

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

export const studentRouter = createTRPCRouter({
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
});
