import { eq, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

import { schools, programs, studentProfiles } from '@/db/schema';

import { roleProcedure } from '../trpc';

const listSchoolsInputSchema = z.object({
  search: z.string().optional(),
});

const schoolProgramSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tuitionAmount: z.number().int().nonnegative(),
  currency: z.string(),
  durationMonths: z.number().int().positive(),
});

const schoolWithProgramsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  country: z.string(),
  logoUrl: z.string().nullable(),
  programs: z.array(schoolProgramSchema),
});

const listSchoolsOutputSchema = z.array(schoolWithProgramsSchema);

const studentSchoolSelectionOutputSchema = z.object({
  schoolId: z.string().uuid().nullable(),
  programId: z.string().uuid().nullable(),
});

export const schoolsProcedures = {
  listSchools: roleProcedure('student')
    .input(listSchoolsInputSchema)
    .output(listSchoolsOutputSchema)
    .query(async ({ ctx, input }) => {
      const schoolsWithPrograms = await ctx.db.query.schools.findMany({
        orderBy: (table, { asc }) => [asc(table.name)],
        where: input.search
          ? or(
              ilike(schools.name, `%${input.search}%`),
              ilike(schools.country, `%${input.search}%`),
            )
          : undefined,
        with: {
          programs: {
            orderBy: (table, { asc }) => [asc(table.name)],
          },
        },
      });

      return schoolsWithPrograms.map((school) => ({
        id: school.id,
        name: school.name,
        country: school.country,
        logoUrl: school.logoUrl ?? null,
        programs: school.programs.map((program) => ({
          id: program.id,
          name: program.name,
          tuitionAmount: program.tuitionAmount,
          currency: program.currency,
          durationMonths: program.durationMonths,
        })),
      }));
    }),

  getStudentSchoolSelection: roleProcedure('student')
    .output(studentSchoolSelectionOutputSchema)
    .query(async ({ ctx }) => {
      const studentProfile = await ctx.db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, ctx.user.id),
        columns: { schoolId: true, programId: true },
      });

      return {
        schoolId: studentProfile?.schoolId ?? null,
        programId: studentProfile?.programId ?? null,
      };
    }),
};
