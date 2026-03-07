import { count, eq, and, inArray, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  certificates,
  programs,
  profiles,
  schools,
  studentProfiles,
  documents,
  universityProfiles,
  universityTeamMembers,
  users,
} from '@/db/schema';
import type { DrizzleDB } from '@/db';
import { insertAuditLog } from '@/db/queries/audit-log';
import { sendUniversityImportEmail } from '@/lib/email/send-university-import-email';

import { createTRPCRouter, roleProcedure } from '../trpc';

/** Helper to get the university profile and validate school link. */
async function getUniversityProfileOrThrow(
  db: DrizzleDB,
  userId: string,
) {
  const profile = await db.query.universityProfiles.findFirst({
    where: (t, { eq: eqFn }) => eqFn(t.userId, userId),
    with: { school: true },
  });

  if (!profile) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'University profile not found.',
    });
  }

  return profile;
}

const programOutputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tuitionAmount: z.number(),
  currency: z.string(),
  durationMonths: z.number(),
  status: z.enum(['active', 'inactive']),
  studentCount: z.number(),
  createdAt: z.date(),
});

const reportOutputSchema = z.object({
  totalStudents: z.number().int().min(0),
  verifiedStudents: z.number().int().min(0),
  pendingVerifications: z.number().int().min(0),
  rejectedDocuments: z.number().int().min(0),
  totalPrograms: z.number().int().min(0),
  approvalRate: z.number().min(0).max(100),
});

const teamMemberOutputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'reviewer', 'viewer']),
  createdAt: z.date(),
});

export const universityManagementRouter = createTRPCRouter({
  listUniversityPrograms: roleProcedure('university')
    .output(z.array(programOutputSchema))
    .query(async ({ ctx }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      if (!profile.schoolId) return [];

      const schoolPrograms = await ctx.db.query.programs.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.schoolId, profile.schoolId!),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      if (schoolPrograms.length === 0) return [];

      const programIds = schoolPrograms.map((p) => p.id);

      // Count students per program
      const studentCounts = await ctx.db
        .select({
          programId: studentProfiles.programId,
          count: count(),
        })
        .from(studentProfiles)
        .where(inArray(studentProfiles.programId, programIds))
        .groupBy(studentProfiles.programId);

      const countMap = new Map(
        studentCounts.map((r) => [r.programId, r.count]),
      );

      return schoolPrograms.map((p) => ({
        id: p.id,
        name: p.name,
        tuitionAmount: p.tuitionAmount,
        currency: p.currency,
        durationMonths: p.durationMonths,
        status: p.status,
        studentCount: countMap.get(p.id) ?? 0,
        createdAt: p.createdAt,
      }));
    }),

  createUniversityProgram: roleProcedure('university')
    .input(
      z.object({
        name: z.string().min(2).max(200),
        tuitionAmount: z.number().int().min(0),
        currency: z.string().min(3).max(3).default('NGN'),
        durationMonths: z.number().int().min(1).max(120),
      }),
    )
    .output(programOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      if (!profile.schoolId) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'University profile is not linked to a school.',
        });
      }

      const [inserted] = await ctx.db
        .insert(programs)
        .values({
          schoolId: profile.schoolId,
          name: input.name,
          tuitionAmount: input.tuitionAmount,
          currency: input.currency,
          durationMonths: input.durationMonths,
        })
        .returning();

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'program.created',
        entityType: 'program',
        entityId: inserted.id,
        meta: { name: input.name },
      });

      return {
        id: inserted.id,
        name: inserted.name,
        tuitionAmount: inserted.tuitionAmount,
        currency: inserted.currency,
        durationMonths: inserted.durationMonths,
        status: inserted.status,
        studentCount: 0,
        createdAt: inserted.createdAt,
      };
    }),

  getUniversityReports: roleProcedure('university')
    .output(reportOutputSchema)
    .query(async ({ ctx }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      if (!profile.schoolId) {
        return {
          totalStudents: 0,
          verifiedStudents: 0,
          pendingVerifications: 0,
          rejectedDocuments: 0,
          totalPrograms: 0,
          approvalRate: 0,
        };
      }

      const [studentsResult, programsResult] = await Promise.all([
        ctx.db.query.studentProfiles.findMany({
          where: (t, { eq: eqFn }) => eqFn(t.schoolId, profile.schoolId!),
          columns: { userId: true, kycStatus: true },
        }),
        ctx.db.query.programs.findMany({
          where: (t, { eq: eqFn }) => eqFn(t.schoolId, profile.schoolId!),
          columns: { id: true },
        }),
      ]);

      const totalStudents = studentsResult.length;
      const verifiedStudents = studentsResult.filter(
        (s) => s.kycStatus === 'verified',
      ).length;
      const pendingVerifications = studentsResult.filter(
        (s) => s.kycStatus === 'pending',
      ).length;

      // Count rejected docs for these students
      let rejectedDocuments = 0;
      if (totalStudents > 0) {
        const studentIds = studentsResult.map((s) => s.userId);
        const [rejectedResult] = await ctx.db
          .select({ count: count() })
          .from(documents)
          .where(
            and(
              inArray(documents.userId, studentIds),
              eq(documents.status, 'rejected'),
            ),
          );
        rejectedDocuments = rejectedResult?.count ?? 0;
      }

      const approvalRate =
        totalStudents > 0
          ? Math.round((verifiedStudents / totalStudents) * 100)
          : 0;

      return {
        totalStudents,
        verifiedStudents,
        pendingVerifications,
        rejectedDocuments,
        totalPrograms: programsResult.length,
        approvalRate,
      };
    }),

  bulkImportStudents: roleProcedure('university')
    .input(
      z.object({
        emails: z.array(z.string().email()).min(1).max(500),
      }),
    )
    .output(
      z.object({
        sentCount: z.number().int().min(0),
        failedCount: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);
      const universityName =
        profile.organizationName ?? profile.school?.name ?? 'Your university';

      let sentCount = 0;
      let failedCount = 0;

      // Send emails sequentially to avoid rate-limiting
      for (const email of input.emails) {
        try {
          await sendUniversityImportEmail({
            toEmail: email,
            universityName,
          });
          sentCount++;
        } catch {
          failedCount++;
        }
      }

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'students.bulk_imported',
        entityType: 'university_profile',
        entityId: profile.id,
        meta: {
          emailCount: input.emails.length,
          sentCount,
          failedCount,
        },
      });

      return { sentCount, failedCount };
    }),

  listTeamMembers: roleProcedure('university')
    .output(z.array(teamMemberOutputSchema))
    .query(async ({ ctx }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      const members = await ctx.db.query.universityTeamMembers.findMany({
        where: (t, { eq: eqFn }) =>
          eqFn(t.universityProfileId, profile.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      return members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        createdAt: m.createdAt,
      }));
    }),

  addTeamMember: roleProcedure('university')
    .input(
      z.object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
        role: z.enum(['admin', 'reviewer', 'viewer']),
      }),
    )
    .output(teamMemberOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      const [inserted] = await ctx.db
        .insert(universityTeamMembers)
        .values({
          universityProfileId: profile.id,
          name: input.name,
          email: input.email,
          role: input.role,
        })
        .returning();

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'team_member.added',
        entityType: 'university_team_member',
        entityId: inserted.id,
        meta: { email: input.email, role: input.role },
      });

      return {
        id: inserted.id,
        name: inserted.name,
        email: inserted.email,
        role: inserted.role,
        createdAt: inserted.createdAt,
      };
    }),

  removeTeamMember: roleProcedure('university')
    .input(z.object({ memberId: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      // Verify the member belongs to this university
      const member = await ctx.db.query.universityTeamMembers.findFirst({
        where: (t, { and: andFn, eq: eqFn }) =>
          andFn(
            eqFn(t.id, input.memberId),
            eqFn(t.universityProfileId, profile.id),
          ),
        columns: { id: true, email: true },
      });

      if (!member) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team member not found.',
        });
      }

      await ctx.db
        .delete(universityTeamMembers)
        .where(eq(universityTeamMembers.id, input.memberId));

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'team_member.removed',
        entityType: 'university_team_member',
        entityId: input.memberId,
        meta: { email: member.email },
      });
    }),

  // ── Program management ──────────────────────────────────────────────────

  updateProgram: roleProcedure('university')
    .input(
      z.object({
        programId: z.string().uuid(),
        name: z.string().trim().min(2).max(200).optional(),
        tuitionAmount: z.number().int().min(0).optional(),
        currency: z.string().trim().min(2).max(10).optional(),
        durationMonths: z.number().int().min(1).max(120).optional(),
      }),
    )
    .output(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      // Verify program belongs to this university's school
      const program = await ctx.db.query.programs.findFirst({
        where: and(eq(programs.id, input.programId), eq(programs.schoolId, profile.schoolId!)),
      });

      if (!program) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Program not found.' });
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.name !== undefined) updates.name = input.name;
      if (input.tuitionAmount !== undefined) updates.tuitionAmount = input.tuitionAmount;
      if (input.currency !== undefined) updates.currency = input.currency;
      if (input.durationMonths !== undefined) updates.durationMonths = input.durationMonths;

      await ctx.db.update(programs).set(updates).where(eq(programs.id, input.programId));

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'program.updated',
        entityType: 'program',
        entityId: input.programId,
        meta: updates,
      });

      return { id: input.programId, name: input.name ?? program.name };
    }),

  deactivateProgram: roleProcedure('university')
    .input(z.object({ programId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      const program = await ctx.db.query.programs.findFirst({
        where: and(eq(programs.id, input.programId), eq(programs.schoolId, profile.schoolId!)),
      });

      if (!program) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Program not found.' });
      }

      await ctx.db
        .update(programs)
        .set({ status: 'inactive', updatedAt: new Date() })
        .where(eq(programs.id, input.programId));

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'program.deactivated',
        entityType: 'program',
        entityId: input.programId,
      });

      return { success: true };
    }),

  // ── Student export ──────────────────────────────────────────────────────

  exportStudents: roleProcedure('university')
    .output(
      z.object({
        rows: z.array(
          z.object({
            email: z.string(),
            fullName: z.string().nullable(),
            programName: z.string().nullable(),
            kycStatus: z.string(),
            bankStatus: z.string(),
            onboardingStep: z.number(),
            createdAt: z.date(),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      const rows = await ctx.db
        .select({
          email: users.email,
          fullName: profiles.fullName,
          programName: programs.name,
          kycStatus: studentProfiles.kycStatus,
          bankStatus: studentProfiles.bankStatus,
          onboardingStep: studentProfiles.onboardingStep,
          createdAt: studentProfiles.createdAt,
        })
        .from(studentProfiles)
        .innerJoin(users, eq(users.id, studentProfiles.userId))
        .innerJoin(profiles, eq(profiles.userId, studentProfiles.userId))
        .leftJoin(programs, eq(programs.id, studentProfiles.programId))
        .where(eq(studentProfiles.schoolId, profile.schoolId!))
        .orderBy(studentProfiles.createdAt);

      return { rows };
    }),

  exportRoster: roleProcedure('university')
    .output(z.string())
    .query(async ({ ctx }) => {
      const profile = await getUniversityProfileOrThrow(ctx.db, ctx.user!.id);

      if (!profile.schoolId) return '';

      const studentRows = await ctx.db
        .select({
          email: users.email,
          fullName: profiles.fullName,
          programName: programs.name,
          enrolledAt: studentProfiles.createdAt,
          studentUserId: studentProfiles.userId,
        })
        .from(studentProfiles)
        .innerJoin(users, eq(users.id, studentProfiles.userId))
        .innerJoin(profiles, eq(profiles.userId, studentProfiles.userId))
        .leftJoin(programs, eq(programs.id, studentProfiles.programId))
        .where(eq(studentProfiles.schoolId, profile.schoolId))
        .orderBy(studentProfiles.createdAt);

      if (studentRows.length === 0) return '';

      const studentIds = studentRows.map((r) => r.studentUserId);

      const certRows = await ctx.db
        .select({
          studentId: certificates.studentId,
          token: certificates.token,
          issuedAt: certificates.issuedAt,
        })
        .from(certificates)
        .where(inArray(certificates.studentId, studentIds))
        .orderBy(certificates.issuedAt);

      // Most recent cert per student
      const certMap = new Map<string, { token: string; issuedAt: Date }>();
      for (const cert of certRows) {
        certMap.set(cert.studentId, { token: cert.token, issuedAt: cert.issuedAt });
      }

      const header = 'Name,Email,Program,Enrolled Date,Certificate ID,Certificate Issued Date';

      const escapeCell = (value: string): string => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const formatDate = (date: Date): string =>
        date.toISOString().split('T')[0] ?? '';

      const lines = studentRows.map((row) => {
        const cert = certMap.get(row.studentUserId) ?? null;
        return [
          escapeCell(row.fullName ?? ''),
          escapeCell(row.email),
          escapeCell(row.programName ?? ''),
          formatDate(row.enrolledAt),
          cert ? escapeCell(cert.token) : '',
          cert ? formatDate(cert.issuedAt) : '',
        ].join(',');
      });

      return [header, ...lines].join('\n');
    }),
});
