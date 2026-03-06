import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { programs, studentProfiles, profiles, sponsorships, documents, certificates } from '@/db/schema';

import { roleProcedure } from '../trpc';

export const fundingTypeValues = ['self', 'sponsor', 'corporate'] as const;

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
  if (!step || step < 1) return 1;
  if (step > 4) return 4;
  return step;
}

export const onboardingProcedures = {
  getOnboardingWizard: roleProcedure('student')
    .output(onboardingWizardOutputSchema)
    .query(async ({ ctx }) => {
      const [existingStudentProfile, schoolsWithPrograms] = await Promise.all([
        ctx.db.query.studentProfiles.findFirst({
          where: eq(studentProfiles.userId, ctx.user!.id),
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
        where: eq(studentProfiles.userId, ctx.user!.id),
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
          .where(eq(studentProfiles.userId, ctx.user!.id));
      } else {
        await ctx.db.insert(studentProfiles).values({
          userId: ctx.user!.id,
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
        where: eq(studentProfiles.userId, ctx.user!.id),
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
          .where(eq(studentProfiles.userId, ctx.user!.id));
      } else {
        await ctx.db.insert(studentProfiles).values({
          userId: ctx.user!.id,
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
        where: eq(studentProfiles.userId, ctx.user!.id),
        columns: { schoolId: true, programId: true, fundingType: true },
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
          .set({ onboardingStep: 4, updatedAt: new Date() })
          .where(eq(studentProfiles.userId, ctx.user!.id));

        await tx
          .update(profiles)
          .set({ onboardingComplete: true, updatedAt: new Date() })
          .where(eq(profiles.userId, ctx.user!.id));
      });

      return { onboardingComplete: true, currentStep: 4 };
    }),

  getTrustStageData: roleProcedure('student')
    .output(
      z.object({
        onboardingComplete: z.boolean(),
        kycComplete: z.boolean(),
        schoolComplete: z.boolean(),
        bankComplete: z.boolean(),
        sponsorComplete: z.boolean(),
        documentsComplete: z.boolean(),
        certificateIssued: z.boolean(),
      }),
    )
    .query(async ({ ctx }) => {
      const userId = ctx.user!.id;

      const [profileRow, sponsorRow, docRow, certRow] = await Promise.all([
        ctx.db.query.studentProfiles.findFirst({
          where: eq(studentProfiles.userId, userId),
          columns: { kycStatus: true, bankStatus: true, schoolId: true },
        }),
        ctx.db.query.sponsorships.findFirst({
          where: and(
            eq(sponsorships.studentId, userId),
            inArray(sponsorships.status, ['active', 'completed']),
          ),
          columns: { id: true },
        }),
        ctx.db.query.documents.findFirst({
          where: and(eq(documents.userId, userId), eq(documents.status, 'approved')),
          columns: { id: true },
        }),
        ctx.db.query.certificates.findFirst({
          where: and(eq(certificates.studentId, userId), eq(certificates.status, 'active')),
          columns: { id: true },
        }),
      ]);

      return {
        onboardingComplete: ctx.profile.onboardingComplete ?? false,
        kycComplete: profileRow?.kycStatus === 'verified',
        schoolComplete: !!profileRow?.schoolId,
        bankComplete: profileRow?.bankStatus === 'verified',
        sponsorComplete: !!sponsorRow,
        documentsComplete: !!docRow,
        certificateIssued: !!certRow,
      };
    }),
};
