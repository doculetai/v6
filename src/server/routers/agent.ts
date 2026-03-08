import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { agentProfiles } from '@/db/schema';
import { requestCommissionPayout } from '@/db/queries/agent-commissions';
import { getAgentActivity } from '@/db/queries/agent-activity';
import { insertNotification } from '@/db/queries/notifications';
import { sendAgentInviteEmail } from '@/lib/email/send-agent-invite-email';

import { createTRPCRouter, roleProcedure } from '../trpc';

// ── Output schemas ───────────────────────────────────────────────────────────

const AgentActivityEventTypeSchema = z.enum([
  'document_uploaded',
  't2_verified',
  't3_verified',
  'cert_issued',
  'doc_approved',
  'doc_rejected',
]);

const AgentActivityItemSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  eventType: AgentActivityEventTypeSchema,
  eventLabel: z.string(),
  createdAt: z.date(),
});

const AgentSettingsOutputSchema = z.object({
  fullName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  region: z.string().nullable(),
  accreditationNumber: z.string().nullable(),
  notifyNewStudent: z.boolean(),
  notifyCommissionPaid: z.boolean(),
  notifyStudentMilestone: z.boolean(),
  notifyAccountSecurity: z.boolean(),
});

// ── Input schemas ────────────────────────────────────────────────────────────

const UpdateAgentProfileInputSchema = z.object({
  fullName: z.string().min(1).max(120),
  phoneNumber: z
    .string()
    .regex(/^\+234\d{10}$/)
    .or(z.literal(''))
    .optional(),
  region: z.string().max(100).optional(),
  accreditationNumber: z.string().min(1),
});

const UpdateAgentNotificationsInputSchema = z.object({
  notifyNewStudent: z.boolean(),
  notifyCommissionPaid: z.boolean(),
  notifyStudentMilestone: z.boolean(),
  notifyAccountSecurity: z.boolean(),
});

// ── Router ───────────────────────────────────────────────────────────────────

export const agentRouter = createTRPCRouter({
  getSettings: roleProcedure('agent')
    .output(AgentSettingsOutputSchema)
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.agentProfiles.findFirst({
        where: (table, { eq: eqFn }) => eqFn(table.userId, ctx.user.id),
      });

      return {
        fullName: profile?.fullName ?? null,
        phoneNumber: profile?.phoneNumber ?? null,
        region: profile?.region ?? null,
        accreditationNumber: profile?.accreditationNumber ?? null,
        notifyNewStudent: profile?.notifyNewStudent ?? true,
        notifyCommissionPaid: profile?.notifyCommissionPaid ?? true,
        notifyStudentMilestone: profile?.notifyStudentMilestone ?? true,
        notifyAccountSecurity: profile?.notifyAccountSecurity ?? true,
      };
    }),

  // updateProfile uses upsert: creates the row on first save, updates on subsequent saves.
  updateProfile: roleProcedure('agent')
    .input(UpdateAgentProfileInputSchema)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(agentProfiles)
        .values({
          userId: ctx.user.id,
          fullName: input.fullName,
          phoneNumber: input.phoneNumber || null,
          region: input.region || null,
          accreditationNumber: input.accreditationNumber,
        })
        .onConflictDoUpdate({
          target: agentProfiles.userId,
          set: {
            fullName: input.fullName,
            phoneNumber: input.phoneNumber || null,
            region: input.region || null,
            accreditationNumber: input.accreditationNumber,
            updatedAt: new Date(),
          },
        });
    }),

  // updateNotifications uses a targeted UPDATE so it never overwrites profile fields.
  // If no profile row exists yet, the update is a safe no-op.
  updateNotifications: roleProcedure('agent')
    .input(UpdateAgentNotificationsInputSchema)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(agentProfiles)
        .set({
          notifyNewStudent: input.notifyNewStudent,
          notifyCommissionPaid: input.notifyCommissionPaid,
          notifyStudentMilestone: input.notifyStudentMilestone,
          notifyAccountSecurity: input.notifyAccountSecurity,
          updatedAt: new Date(),
        })
        .where(eq(agentProfiles.userId, ctx.user.id));
    }),

  getAgentOverview: roleProcedure('agent')
    .output(
      z.object({
        totalAssignedStudents: z.number(),
        activeStudents: z.number(),
        pendingCommissionsKobo: z.number(),
        totalEarnedKobo: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const [assignments, commissions] = await Promise.all([
        ctx.db.query.agentStudentAssignments.findMany({
          where: (t, { eq: eqFn }) => eqFn(t.agentId, ctx.user.id),
          columns: { id: true },
        }),
        ctx.db.query.agentCommissions.findMany({
          where: (t, { eq: eqFn }) => eqFn(t.agentId, ctx.user.id),
          columns: { status: true, amountKobo: true },
        }),
      ]);

      return {
        totalAssignedStudents: assignments.length,
        activeStudents: assignments.length,
        pendingCommissionsKobo: commissions
          .filter((c) => c.status === 'pending')
          .reduce((sum, c) => sum + c.amountKobo, 0),
        totalEarnedKobo: commissions
          .filter((c) => c.status === 'paid')
          .reduce((sum, c) => sum + c.amountKobo, 0),
      };
    }),

  listAgentStudents: roleProcedure('agent')
    .output(
      z.array(
        z.object({
          assignmentId: z.string(),
          studentId: z.string(),
          studentEmail: z.string().nullable(),
          schoolName: z.string().nullable(),
          programName: z.string().nullable(),
          kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
          documentCount: z.number(),
          assignedAt: z.date(),
          certIssued: z.boolean(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const assignments = await ctx.db.query.agentStudentAssignments.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.agentId, ctx.user.id),
        orderBy: (t, { desc }) => [desc(t.assignedAt)],
      });

      if (assignments.length === 0) return [];

      const studentIds = assignments.map((a) => a.studentId);

      const [studentProfiles, docRows, userRows, certRows] = await Promise.all([
        ctx.db.query.studentProfiles.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.userId, studentIds),
          with: { school: true, program: true },
        }),
        ctx.db.query.documents.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.userId, studentIds),
          columns: { userId: true },
        }),
        ctx.db.query.users.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, studentIds),
          columns: { id: true, email: true },
        }),
        ctx.db.query.certificates.findMany({
          where: (t, { inArray: inArrayFn }) =>
            inArrayFn(t.studentId, studentIds),
          columns: { studentId: true, status: true },
        }),
      ]);

      const emailMap = new Map(userRows.map((u) => [u.id, u.email]));
      const profileMap = new Map(studentProfiles.map((p) => [p.userId, p]));
      const docCountMap = new Map<string, number>();
      for (const doc of docRows) {
        docCountMap.set(doc.userId, (docCountMap.get(doc.userId) ?? 0) + 1);
      }
      const certIssuedSet = new Set(
        certRows.filter((c) => c.status === 'active').map((c) => c.studentId),
      );

      return assignments.map((a) => {
        const profile = profileMap.get(a.studentId);
        return {
          assignmentId: a.id,
          studentId: a.studentId,
          studentEmail: emailMap.get(a.studentId) ?? null,
          schoolName: profile?.school?.name ?? null,
          programName: profile?.program?.name ?? null,
          kycStatus: profile?.kycStatus ?? 'not_started',
          documentCount: docCountMap.get(a.studentId) ?? 0,
          assignedAt: a.assignedAt,
          certIssued: certIssuedSet.has(a.studentId),
        };
      });
    }),

  listAgentSponsors: roleProcedure('agent')
    .output(
      z.array(
        z.object({
          sponsorId: z.string(),
          sponsorEmail: z.string().nullable(),
          studentsCount: z.number(),
          totalFundedKobo: z.number(),
          joinedAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const assignments = await ctx.db.query.agentStudentAssignments.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.agentId, ctx.user.id),
        columns: { studentId: true },
      });

      if (assignments.length === 0) return [];

      const studentIds = assignments.map((a) => a.studentId);
      const sponsorships = await ctx.db.query.sponsorships.findMany({
        where: (t, { inArray: inArrayFn }) => inArrayFn(t.studentId, studentIds),
        columns: { sponsorId: true, amountKobo: true, createdAt: true },
      });

      if (sponsorships.length === 0) return [];

      const uniqueSponsorIds = [...new Set(sponsorships.map((s) => s.sponsorId))];
      const sponsorUsers = await ctx.db.query.users.findMany({
        where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, uniqueSponsorIds),
        columns: { id: true, email: true },
      });
      const emailMap = new Map(sponsorUsers.map((u) => [u.id, u.email]));

      const grouped = new Map<string, { totalFundedKobo: number; studentsCount: number; joinedAt: Date }>();
      for (const s of sponsorships) {
        const existing = grouped.get(s.sponsorId);
        if (existing) {
          existing.totalFundedKobo += s.amountKobo;
          existing.studentsCount += 1;
          if (s.createdAt < existing.joinedAt) existing.joinedAt = s.createdAt;
        } else {
          grouped.set(s.sponsorId, {
            totalFundedKobo: s.amountKobo,
            studentsCount: 1,
            joinedAt: s.createdAt,
          });
        }
      }

      return [...grouped.entries()].map(([sponsorId, data]) => ({
        sponsorId,
        sponsorEmail: emailMap.get(sponsorId) ?? null,
        ...data,
      }));
    }),

  bulkInviteStudents: roleProcedure('agent')
    .input(z.object({ emails: z.array(z.string().email()).min(1).max(100) }))
    .output(z.object({ sentCount: z.number(), failedEmails: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.query.agentProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { fullName: true },
      });

      let sentCount = 0;
      const failedEmails: string[] = [];

      await Promise.allSettled(
        input.emails.map(async (email) => {
          try {
            await sendAgentInviteEmail({
              toEmail: email,
              agentName: profile?.fullName ?? null,
              agentId: ctx.user.id,
            });
            sentCount++;
          } catch {
            failedEmails.push(email);
          }
        }),
      );

      return { sentCount, failedEmails };
    }),

  requestPayout: roleProcedure('agent')
    .input(z.object({ commissionIds: z.array(z.string().uuid()).min(1) }))
    .output(z.object({ requestedCount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const count = await requestCommissionPayout(ctx.db, input.commissionIds, ctx.user.id);

      if (count === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'No eligible commissions found. Commissions must be pending and belong to your account.',
        });
      }

      // Fire-and-forget admin notification — failure must not abort the payout request.
      try {
        await insertNotification(ctx.db, {
          userId: ctx.user.id,
          type: 'system',
          title: 'Payout request submitted',
          body: `Your payout request for ${count} commission${count === 1 ? '' : 's'} has been received and is under review.`,
          link: '/dashboard/agent/commissions',
          category: 'operations',
          priority: 'normal',
        });
      } catch {
        // Non-blocking — notification failure does not affect payout request.
      }

      return { requestedCount: count };
    }),

  listAgentCommissions: roleProcedure('agent')
    .output(
      z.array(
        z.object({
          id: z.string(),
          amountKobo: z.number(),
          currency: z.string(),
          status: z.enum(['pending', 'processing', 'paid', 'cancelled']),
          description: z.string().nullable(),
          paidAt: z.date().nullable(),
          createdAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const rows = await ctx.db.query.agentCommissions.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.agentId, ctx.user.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      return rows.map((r) => ({
        id: r.id,
        amountKobo: r.amountKobo,
        currency: r.currency,
        status: r.status,
        description: r.description ?? null,
        paidAt: r.paidAt ?? null,
        createdAt: r.createdAt,
      }));
    }),

  getActivity: roleProcedure('agent')
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .output(z.array(AgentActivityItemSchema))
    .query(async ({ ctx, input }) => {
      return getAgentActivity(ctx.db, ctx.user.id, input.limit, input.cursor);
    }),

  inviteStudent: roleProcedure('agent')
    .input(z.object({ email: z.string().email() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.query.agentProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { fullName: true },
      });
      await sendAgentInviteEmail({
        toEmail: input.email,
        agentName: profile?.fullName ?? null,
        agentId: ctx.user.id,
      });
      return { success: true };
    }),
});
