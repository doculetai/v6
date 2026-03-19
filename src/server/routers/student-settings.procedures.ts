import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { profiles, studentProfiles, schools, programs } from '@/db/schema';
import { protectedProcedure, roleProcedure } from '../trpc';

export const settingsProcedures = {
  updateProfile: roleProcedure('student')
    .input(
      z.object({
        fullName: z.string().min(2).max(100).optional(),
        phone: z.string().min(7).max(20).optional(),
        whatsappNumber: z.string().min(7).max(20).optional(),
      }),
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.id;
      const updates: Record<string, unknown> = { updatedAt: new Date() };

      if (input.fullName !== undefined) updates.fullName = input.fullName;
      if (input.phone !== undefined) updates.phone = input.phone;
      if (input.whatsappNumber !== undefined) updates.whatsappNumber = input.whatsappNumber;

      await ctx.db
        .update(profiles)
        .set(updates)
        .where(eq(profiles.userId, userId));

      return { success: true };
    }),

  getProfile: roleProcedure('student')
    .output(
      z.object({
        fullName: z.string().nullable(),
        phone: z.string().nullable(),
        whatsappNumber: z.string().nullable(),
        email: z.string().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.userId, ctx.user!.id),
        columns: { fullName: true, phone: true, whatsappNumber: true },
      });

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
      }

      return {
        fullName: profile.fullName,
        phone: profile.phone,
        whatsappNumber: profile.whatsappNumber,
        email: ctx.user!.email ?? null,
      };
    }),

  /** Get student settings: school, program, funding type with resolved names. */
  getStudentSettings: roleProcedure('student')
    .output(
      z.object({
        schoolId: z.string().uuid().nullable(),
        schoolName: z.string().nullable(),
        schoolCountry: z.string().nullable(),
        programId: z.string().uuid().nullable(),
        programName: z.string().nullable(),
        fundingType: z.string().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      const sp = await ctx.db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, ctx.user!.id),
        columns: { schoolId: true, programId: true, fundingType: true },
      });

      if (!sp) {
        return {
          schoolId: null, schoolName: null, schoolCountry: null,
          programId: null, programName: null, fundingType: null,
        };
      }

      let schoolName: string | null = null;
      let schoolCountry: string | null = null;
      let programName: string | null = null;

      if (sp.schoolId) {
        const school = await ctx.db.query.schools.findFirst({
          where: eq(schools.id, sp.schoolId),
          columns: { name: true, country: true },
        });
        schoolName = school?.name ?? null;
        schoolCountry = school?.country ?? null;
      }

      if (sp.programId) {
        const program = await ctx.db.query.programs.findFirst({
          where: eq(programs.id, sp.programId),
          columns: { name: true },
        });
        programName = program?.name ?? null;
      }

      return {
        schoolId: sp.schoolId,
        schoolName,
        schoolCountry,
        programId: sp.programId,
        programName,
        fundingType: sp.fundingType,
      };
    }),
};
