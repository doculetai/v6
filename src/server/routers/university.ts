import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { getUniversityOverview } from '@/db/queries/university-overview';
import { certificates, profiles, programs, universityProfiles } from '@/db/schema';

import { createTRPCRouter, roleProcedure } from '../trpc';

const overviewOutputSchema = z.object({
  totalPrograms: z.number().int().min(0),
  enrolledStudents: z.number().int().min(0),
  pendingApplications: z.number().int().min(0),
  totalStudents: z.number().int().min(0),
});

export type UniversityOverviewOutput = z.infer<typeof overviewOutputSchema>;

export const universityRouter = createTRPCRouter({
  getOverview: roleProcedure('university')
    .output(overviewOutputSchema)
    .query(async ({ ctx }) => {
      return getUniversityOverview(ctx.db, ctx.user.id);
    }),

  getUniversityProfile: roleProcedure('university')
    .output(
      z.object({
        schoolId: z.string().nullable(),
        schoolName: z.string().nullable(),
        organizationName: z.string().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.universityProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        with: { school: true },
      });
      return {
        schoolId: profile?.schoolId ?? null,
        schoolName: profile?.school?.name ?? null,
        organizationName: profile?.organizationName ?? null,
      };
    }),

  getVerificationQueue: roleProcedure('university')
    .output(
      z.array(
        z.object({
          studentId: z.string(),
          studentEmail: z.string().nullable(),
          programName: z.string().nullable(),
          documentCount: z.number(),
          pendingDocumentCount: z.number(),
          kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
          createdAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const uniProfile = await ctx.db.query.universityProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { schoolId: true },
      });
      if (!uniProfile?.schoolId) return [];

      const studentProfileRows = await ctx.db.query.studentProfiles.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.schoolId, uniProfile.schoolId!),
        with: { program: true },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      if (studentProfileRows.length === 0) return [];

      const studentIds = studentProfileRows.map((p) => p.userId);

      const [userRows, docRows] = await Promise.all([
        ctx.db.query.users.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, studentIds),
          columns: { id: true, email: true },
        }),
        ctx.db.query.documents.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.userId, studentIds),
          columns: { userId: true, status: true },
        }),
      ]);

      const emailMap = new Map(userRows.map((u) => [u.id, u.email]));

      const docCountMap = new Map<string, number>();
      const pendingDocCountMap = new Map<string, number>();
      for (const doc of docRows) {
        docCountMap.set(doc.userId, (docCountMap.get(doc.userId) ?? 0) + 1);
        if (doc.status === 'pending') {
          pendingDocCountMap.set(doc.userId, (pendingDocCountMap.get(doc.userId) ?? 0) + 1);
        }
      }

      return studentProfileRows.map((p) => ({
        studentId: p.userId,
        studentEmail: emailMap.get(p.userId) ?? null,
        programName: p.program?.name ?? null,
        documentCount: docCountMap.get(p.userId) ?? 0,
        pendingDocumentCount: pendingDocCountMap.get(p.userId) ?? 0,
        kycStatus: p.kycStatus,
        createdAt: p.createdAt,
      }));
    }),

  listUniversityStudents: roleProcedure('university')
    .output(
      z.array(
        z.object({
          studentId: z.string(),
          studentEmail: z.string().nullable(),
          schoolName: z.string().nullable(),
          programName: z.string().nullable(),
          kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
          bankStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
          documentCount: z.number(),
          createdAt: z.date(),
          certToken: z.string().nullable(),
          certIssuedAt: z.date().nullable(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const uniProfile = await ctx.db.query.universityProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { schoolId: true },
      });
      if (!uniProfile?.schoolId) return [];

      const studentProfileRows = await ctx.db.query.studentProfiles.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.schoolId, uniProfile.schoolId!),
        with: { school: true, program: true },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      if (studentProfileRows.length === 0) return [];

      const studentIds = studentProfileRows.map((p) => p.userId);

      const [userRows, docRows, certRows] = await Promise.all([
        ctx.db.query.users.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, studentIds),
          columns: { id: true, email: true },
        }),
        ctx.db.query.documents.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.userId, studentIds),
          columns: { userId: true },
        }),
        ctx.db
          .select({
            studentId: certificates.studentId,
            token: certificates.token,
            issuedAt: certificates.issuedAt,
          })
          .from(certificates)
          .where(inArray(certificates.studentId, studentIds))
          .orderBy(certificates.issuedAt),
      ]);

      const emailMap = new Map(userRows.map((u) => [u.id, u.email]));
      const docCountMap = new Map<string, number>();
      for (const doc of docRows) {
        docCountMap.set(doc.userId, (docCountMap.get(doc.userId) ?? 0) + 1);
      }
      // Most recent active cert per student
      const certMap = new Map<string, { token: string; issuedAt: Date }>();
      for (const cert of certRows) {
        certMap.set(cert.studentId, { token: cert.token, issuedAt: cert.issuedAt });
      }

      return studentProfileRows.map((p) => {
        const cert = certMap.get(p.userId) ?? null;
        return {
          studentId: p.userId,
          studentEmail: emailMap.get(p.userId) ?? null,
          schoolName: p.school?.name ?? null,
          programName: p.program?.name ?? null,
          kycStatus: p.kycStatus,
          bankStatus: p.bankStatus,
          documentCount: docCountMap.get(p.userId) ?? 0,
          createdAt: p.createdAt,
          certToken: cert?.token ?? null,
          certIssuedAt: cert?.issuedAt ?? null,
        };
      });
    }),

  completeOnboarding: roleProcedure('university')
    .input(
      z.object({
        organizationName: z.string().min(2).max(120),
      }),
    )
    .output(z.object({ onboardingComplete: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        const existing = await tx.query.universityProfiles.findFirst({
          where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
          columns: { id: true },
        });

        if (existing) {
          await tx
            .update(universityProfiles)
            .set({
              organizationName: input.organizationName,
              updatedAt: new Date(),
            })
            .where(eq(universityProfiles.userId, ctx.user.id));
        } else {
          await tx.insert(universityProfiles).values({
            userId: ctx.user.id,
            organizationName: input.organizationName,
          });
        }

        await tx
          .update(profiles)
          .set({ onboardingComplete: true, updatedAt: new Date() })
          .where(eq(profiles.userId, ctx.user.id));
      });

      return { onboardingComplete: true };
    }),

  updateUniversitySettings: roleProcedure('university')
    .input(
      z.object({
        organizationName: z.string().min(2).max(120).optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.universityProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { id: true },
      });

      if (existing) {
        await ctx.db
          .update(universityProfiles)
          .set({
            ...(input.organizationName !== undefined && {
              organizationName: input.organizationName,
            }),
            updatedAt: new Date(),
          })
          .where(eq(universityProfiles.userId, ctx.user.id));
      } else {
        await ctx.db.insert(universityProfiles).values({
          userId: ctx.user.id,
          organizationName: input.organizationName ?? null,
        });
      }
    }),

  listUniversityPrograms: roleProcedure('university')
    .output(
      z.array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          tuitionAmount: z.number().int(),
          currency: z.string(),
          durationMonths: z.number().int(),
          status: z.enum(['active', 'inactive']),
          studentCount: z.number().int(),
          createdAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const uniProfile = await ctx.db.query.universityProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { schoolId: true },
      });
      if (!uniProfile?.schoolId) return [];

      const programRows = await ctx.db.query.programs.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.schoolId, uniProfile.schoolId!),
        with: { studentProfiles: { columns: { id: true } } },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      return programRows.map((p) => ({
        id: p.id,
        name: p.name,
        tuitionAmount: p.tuitionAmount,
        currency: p.currency,
        durationMonths: p.durationMonths,
        status: p.status,
        studentCount: p.studentProfiles.length,
        createdAt: p.createdAt,
      }));
    }),

  createUniversityProgram: roleProcedure('university')
    .input(
      z.object({
        name: z.string().min(2).max(120),
        tuitionAmount: z.number().int().positive(),
        durationMonths: z.number().int().positive().optional(),
        description: z.string().max(500).optional(),
      }),
    )
    .output(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        tuitionAmount: z.number().int(),
        currency: z.string(),
        durationMonths: z.number().int(),
        status: z.enum(['active', 'inactive']),
        studentCount: z.number().int(),
        createdAt: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const uniProfile = await ctx.db.query.universityProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { schoolId: true },
      });
      if (!uniProfile?.schoolId) {
        throw new Error('No school linked to this university account.');
      }

      const [created] = await ctx.db
        .insert(programs)
        .values({
          schoolId: uniProfile.schoolId,
          name: input.name,
          tuitionAmount: input.tuitionAmount,
          currency: 'NGN',
          durationMonths: input.durationMonths ?? 12,
          status: 'active',
        })
        .returning();

      return {
        id: created!.id,
        name: created!.name,
        tuitionAmount: created!.tuitionAmount,
        currency: created!.currency,
        durationMonths: created!.durationMonths,
        status: created!.status,
        studentCount: 0,
        createdAt: created!.createdAt,
      };
    }),

  deactivateProgram: roleProcedure('university')
    .input(z.object({ programId: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const uniProfile = await ctx.db.query.universityProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { schoolId: true },
      });
      if (!uniProfile?.schoolId) return;

      // Only deactivate programs that belong to this university's school
      await ctx.db
        .update(programs)
        .set({ status: 'inactive', updatedAt: new Date() })
        .where(
          eq(programs.id, input.programId),
        );
    }),

  listUniversityStudentsWithCert: roleProcedure('university')
    .input(z.object({ programId: z.string().uuid().optional() }))
    .output(
      z.array(
        z.object({
          studentId: z.string(),
          studentEmail: z.string().nullable(),
          programId: z.string().nullable(),
          programName: z.string().nullable(),
          kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
          bankStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
          documentCount: z.number(),
          certificateId: z.string().nullable(),
          createdAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const uniProfile = await ctx.db.query.universityProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { schoolId: true },
      });
      if (!uniProfile?.schoolId) return [];

      const studentProfiles = await ctx.db.query.studentProfiles.findMany({
        where: (t, { eq: eqFn, and: andFn }) => {
          const schoolCondition = eqFn(t.schoolId, uniProfile.schoolId!);
          if (input.programId) {
            return andFn(schoolCondition, eqFn(t.programId, input.programId));
          }
          return schoolCondition;
        },
        with: { program: { columns: { id: true, name: true } } },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      if (studentProfiles.length === 0) return [];

      const studentIds = studentProfiles.map((p) => p.userId);

      const [userRows, docRows, certRows] = await Promise.all([
        ctx.db.query.users.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, studentIds),
          columns: { id: true, email: true },
        }),
        ctx.db.query.documents.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.userId, studentIds),
          columns: { userId: true },
        }),
        ctx.db.query.certificates.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.studentId, studentIds),
          columns: { studentId: true, token: true },
          orderBy: (t, { desc }) => [desc(t.issuedAt)],
        }),
      ]);

      const emailMap = new Map(userRows.map((u) => [u.id, u.email]));
      const docCountMap = new Map<string, number>();
      for (const doc of docRows) {
        docCountMap.set(doc.userId, (docCountMap.get(doc.userId) ?? 0) + 1);
      }
      // Keep only the most recent cert per student
      const certMap = new Map<string, string>();
      for (const cert of certRows) {
        if (!certMap.has(cert.studentId)) {
          certMap.set(cert.studentId, cert.token);
        }
      }

      return studentProfiles.map((p) => ({
        studentId: p.userId,
        studentEmail: emailMap.get(p.userId) ?? null,
        programId: p.programId ?? null,
        programName: p.program?.name ?? null,
        kycStatus: p.kycStatus,
        bankStatus: p.bankStatus,
        documentCount: docCountMap.get(p.userId) ?? 0,
        certificateId: certMap.get(p.userId) ?? null,
        createdAt: p.createdAt,
      }));
    }),

  exportStudents: roleProcedure('university')
    .input(z.object({ programId: z.string().uuid().optional() }))
    .output(z.object({ csv: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const uniProfile = await ctx.db.query.universityProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { schoolId: true },
      });
      if (!uniProfile?.schoolId) return { csv: '' };

      const studentProfiles = await ctx.db.query.studentProfiles.findMany({
        where: (t, { eq: eqFn, and: andFn }) => {
          const schoolCondition = eqFn(t.schoolId, uniProfile.schoolId!);
          if (input.programId) {
            return andFn(schoolCondition, eqFn(t.programId, input.programId));
          }
          return schoolCondition;
        },
        with: { program: { columns: { name: true } } },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      if (studentProfiles.length === 0) return { csv: '' };

      const studentIds = studentProfiles.map((p) => p.userId);

      const [userRows, certRows] = await Promise.all([
        ctx.db.query.users.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, studentIds),
          columns: { id: true, email: true },
        }),
        ctx.db.query.certificates.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.studentId, studentIds),
          columns: { studentId: true, token: true },
          orderBy: (t, { desc }) => [desc(t.issuedAt)],
        }),
      ]);

      const emailMap = new Map(userRows.map((u) => [u.id, u.email]));
      const certMap = new Map<string, string>();
      for (const cert of certRows) {
        if (!certMap.has(cert.studentId)) {
          certMap.set(cert.studentId, cert.token);
        }
      }

      const header = 'Email,Program,KYC Status,Bank Status,Certificate ID,Enrolled At';
      const rows = studentProfiles.map((p) => {
        const email = emailMap.get(p.userId) ?? '';
        const program = p.program?.name ?? '';
        const certId = certMap.get(p.userId) ?? '';
        const enrolled = new Date(p.createdAt).toISOString().split('T')[0] ?? '';
        return [email, program, p.kycStatus, p.bankStatus, certId, enrolled]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',');
      });

      return { csv: [header, ...rows].join('\n') };
    }),
});
