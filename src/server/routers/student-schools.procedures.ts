import { and, count, eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { schools, programs, studentProfiles } from '@/db/schema';

import { roleProcedure } from '../trpc';

const listSchoolsInputSchema = z.object({
  search: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
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
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  accreditor: z.string().nullable(),
  studentSize: z.number().int().nullable(),
  institutionType: z.string().nullable(),
  outOfStateTuition: z.number().int().nullable(),
  dataSource: z.string(),
  programs: z.array(schoolProgramSchema),
});

const listSchoolsOutputSchema = z.array(schoolWithProgramsSchema);

const studentSchoolSelectionOutputSchema = z.object({
  schoolId: z.string().uuid().nullable(),
  programId: z.string().uuid().nullable(),
});

const schoolCountryCountSchema = z.object({
  country: z.string(),
  count: z.number().int(),
});

const getSchoolCountriesOutputSchema = z.array(schoolCountryCountSchema);

export const schoolsProcedures = {
  listSchools: roleProcedure('student')
    .input(listSchoolsInputSchema)
    .output(listSchoolsOutputSchema)
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(
          or(
            ilike(schools.name, `%${input.search}%`),
            ilike(schools.country, `%${input.search}%`),
            ilike(schools.city, `%${input.search}%`),
            ilike(schools.state, `%${input.search}%`),
          ),
        );
      }

      if (input.country) {
        conditions.push(eq(schools.country, input.country));
      }

      if (input.state) {
        conditions.push(eq(schools.state, input.state));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const schoolsWithPrograms = await ctx.db.query.schools.findMany({
        orderBy: (table, { asc }) => [asc(table.name)],
        where,
        limit: input.limit,
        offset: input.offset,
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
        city: school.city ?? null,
        state: school.state ?? null,
        zip: school.zip ?? null,
        websiteUrl: school.websiteUrl ?? null,
        accreditor: school.accreditor ?? null,
        studentSize: school.studentSize ?? null,
        institutionType: school.institutionType ?? null,
        outOfStateTuition: school.outOfStateTuition ?? null,
        dataSource: school.dataSource,
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
        where: eq(studentProfiles.userId, ctx.user!.id),
        columns: { schoolId: true, programId: true },
      });

      return {
        schoolId: studentProfile?.schoolId ?? null,
        programId: studentProfile?.programId ?? null,
      };
    }),

  getSchoolCountries: roleProcedure('student')
    .output(getSchoolCountriesOutputSchema)
    .query(async ({ ctx }) => {
      const rows = await ctx.db
        .select({
          country: schools.country,
          count: count(),
        })
        .from(schools)
        .groupBy(schools.country)
        .orderBy(schools.country);

      return rows.map((r) => ({ country: r.country, count: r.count }));
    }),
};
