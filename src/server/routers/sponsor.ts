import { TRPCError } from '@trpc/server';
import { captureException } from '@sentry/nextjs';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import {
  listPendingInvitationsForInvitee,
  respondToPendingInvitation,
} from '@/db/queries/sponsor-invitations';
import {
  bankAccounts,
  disbursements,
  kycVerifications,
  sponsorProfiles,
  sponsorships,
} from '@/db/schema';
import { callDojahKyc } from '@/lib/services/dojah';
import { initiatePaystackTransfer } from '@/lib/paystack/initiate-transfer';

import { createTRPCRouter, roleProcedure } from '../trpc';

const invitationStatusSchema = z.enum(['pending', 'accepted', 'declined', 'cancelled']);
const responseStatusSchema = z.enum(['accepted', 'declined']);

const invitationOutputSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  studentEmail: z.string().email(),
  inviteeEmail: z.string().email(),
  status: invitationStatusSchema,
  message: z.string().nullable(),
  respondedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const respondToInviteInputSchema = z.object({
  inviteId: z.string().uuid(),
  status: responseStatusSchema,
});

type SponsorInviteRow = {
  id: string;
  studentId: string;
  studentEmail: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toSponsorInviteOutput(invitation: SponsorInviteRow) {
  return {
    id: invitation.id,
    studentId: invitation.studentId,
    studentEmail: invitation.studentEmail,
    inviteeEmail: invitation.inviteeEmail,
    status: invitation.status,
    message: invitation.message,
    respondedAt: invitation.respondedAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
  };
}

export const sponsorRouter = createTRPCRouter({
  listPendingInvites: roleProcedure('sponsor')
    .output(z.array(invitationOutputSchema))
    .query(async ({ ctx }) => {
      const sponsorEmail = ctx.user.email?.trim().toLowerCase();

      if (!sponsorEmail) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Sponsor account email is required before listing invitations.',
        });
      }

      const invitations = await listPendingInvitationsForInvitee(ctx.db, sponsorEmail);

      return invitations
        .filter((invite) => Boolean(invite.student?.email))
        .map((invite) => {
          const studentEmail = invite.student?.email ?? '';

          return toSponsorInviteOutput({
            id: invite.id,
            studentId: invite.studentId,
            studentEmail,
            inviteeEmail: invite.inviteeEmail,
            status: invite.status,
            message: invite.message,
            respondedAt: invite.respondedAt,
            createdAt: invite.createdAt,
            updatedAt: invite.updatedAt,
          });
        });
    }),

  respondToInvite: roleProcedure('sponsor')
    .input(respondToInviteInputSchema)
    .output(invitationOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const sponsorEmail = ctx.user.email?.trim().toLowerCase();

      if (!sponsorEmail) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Sponsor account email is required before responding to invitations.',
        });
      }

      const invitation = await respondToPendingInvitation(ctx.db, {
        inviteId: input.inviteId,
        inviteeEmail: sponsorEmail,
        responderUserId: ctx.user.id,
        status: input.status,
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pending invitation not found for this sponsor account.',
        });
      }

      const student = await ctx.db.query.users.findFirst({
        where: (usersTable, { eq: eqFn }) => eqFn(usersTable.id, invitation.studentId),
        columns: {
          email: true,
        },
      });

      if (!student?.email) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Unable to resolve student email for this invitation.',
        });
      }

      return toSponsorInviteOutput({
        id: invitation.id,
        studentId: invitation.studentId,
        studentEmail: student.email,
        inviteeEmail: invitation.inviteeEmail,
        status: invitation.status,
        message: invitation.message,
        respondedAt: invitation.respondedAt,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      });
    }),

  getSponsorOverview: roleProcedure('sponsor')
    .output(
      z.object({
        totalCommittedKobo: z.number(),
        activeStudents: z.number(),
        pendingInvites: z.number(),
        nextDisbursementAt: z.date().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      const sponsorEmail = ctx.user.email?.trim().toLowerCase() ?? '';

      const [sponsorshipRows, inviteRows] = await Promise.all([
        ctx.db.query.sponsorships.findMany({
          where: (t, { eq: eqFn }) => eqFn(t.sponsorId, ctx.user.id),
          columns: { status: true, amountKobo: true, id: true },
        }),
        ctx.db.query.sponsorshipInvites.findMany({
          where: (t, { and: andFn, eq: eqFn }) =>
            andFn(
              eqFn(t.inviteeEmailNormalized, sponsorEmail),
              eqFn(t.status, 'pending'),
            ),
          columns: { id: true },
        }),
      ]);

      const activeSponsorshipIds = sponsorshipRows
        .filter((s) => s.status === 'active')
        .map((s) => s.id);

      let nextDisbursementAt: Date | null = null;
      if (activeSponsorshipIds.length > 0) {
        const nextDisbursement = await ctx.db.query.disbursements.findFirst({
          where: (t, { and: andFn, eq: eqFn, inArray: inArrayFn }) =>
            andFn(
              inArrayFn(t.sponsorshipId, activeSponsorshipIds),
              eqFn(t.status, 'scheduled'),
            ),
          orderBy: (t, { asc }) => [asc(t.scheduledAt)],
          columns: { scheduledAt: true },
        });
        nextDisbursementAt = nextDisbursement?.scheduledAt ?? null;
      }

      const totalCommittedKobo = sponsorshipRows
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => sum + s.amountKobo, 0);

      return {
        totalCommittedKobo,
        activeStudents: activeSponsorshipIds.length,
        pendingInvites: inviteRows.length,
        nextDisbursementAt,
      };
    }),

  listSponsoredStudents: roleProcedure('sponsor')
    .output(
      z.array(
        z.object({
          id: z.string(),
          studentId: z.string(),
          studentEmail: z.string().nullable(),
          amountKobo: z.number(),
          currency: z.string(),
          status: z.enum(['pending', 'active', 'completed', 'cancelled']),
          createdAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const rows = await ctx.db.query.sponsorships.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.sponsorId, ctx.user.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      if (rows.length === 0) return [];

      const studentIds = rows.map((r) => r.studentId);
      const userRows = await ctx.db.query.users.findMany({
        where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, studentIds),
        columns: { id: true, email: true },
      });
      const emailMap = new Map(userRows.map((u) => [u.id, u.email]));

      return rows.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        studentEmail: emailMap.get(r.studentId) ?? null,
        amountKobo: r.amountKobo,
        currency: r.currency,
        status: r.status,
        createdAt: r.createdAt,
      }));
    }),

  listDisbursements: roleProcedure('sponsor')
    .output(
      z.array(
        z.object({
          id: z.string(),
          sponsorshipId: z.string(),
          studentEmail: z.string().nullable(),
          amountKobo: z.number(),
          currency: z.string(),
          scheduledAt: z.date(),
          disbursedAt: z.date().nullable(),
          status: z.enum(['scheduled', 'processing', 'disbursed', 'failed']),
          paystackReference: z.string().nullable(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const sponsorshipRows = await ctx.db.query.sponsorships.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.sponsorId, ctx.user.id),
        columns: { id: true, studentId: true, currency: true },
      });

      if (sponsorshipRows.length === 0) return [];

      const sponsorshipIds = sponsorshipRows.map((s) => s.id);
      const studentIds = sponsorshipRows.map((s) => s.studentId);

      const [disbursementRows, userRows] = await Promise.all([
        ctx.db.query.disbursements.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.sponsorshipId, sponsorshipIds),
          orderBy: (t, { desc }) => [desc(t.scheduledAt)],
        }),
        ctx.db.query.users.findMany({
          where: (t, { inArray: inArrayFn }) => inArrayFn(t.id, studentIds),
          columns: { id: true, email: true },
        }),
      ]);

      const emailMap = new Map(userRows.map((u) => [u.id, u.email]));
      const sponsorshipStudentMap = new Map(sponsorshipRows.map((s) => [s.id, s.studentId]));
      const sponsorshipCurrencyMap = new Map(sponsorshipRows.map((s) => [s.id, s.currency]));

      return disbursementRows.map((d) => {
        const studentId = sponsorshipStudentMap.get(d.sponsorshipId);
        return {
          id: d.id,
          sponsorshipId: d.sponsorshipId,
          studentEmail: studentId ? (emailMap.get(studentId) ?? null) : null,
          amountKobo: d.amountKobo,
          currency: sponsorshipCurrencyMap.get(d.sponsorshipId) ?? 'NGN',
          scheduledAt: d.scheduledAt,
          disbursedAt: d.disbursedAt ?? null,
          status: d.status,
          paystackReference: d.paystackReference ?? null,
        };
      });
    }),

  getSponsorKycStatus: roleProcedure('sponsor')
    .output(
      z.object({
        sponsorType: z.enum(['individual', 'corporate', 'self']).nullable(),
        kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
        companyName: z.string().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.sponsorProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
      });
      return {
        sponsorType: profile?.sponsorType ?? null,
        kycStatus: profile?.kycStatus ?? 'not_started',
        companyName: profile?.companyName ?? null,
      };
    }),

  getSponsorSettings: roleProcedure('sponsor')
    .output(
      z.object({
        sponsorType: z.enum(['individual', 'corporate', 'self']).nullable(),
        kycStatus: z.enum(['not_started', 'pending', 'verified', 'failed']),
        companyName: z.string().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.sponsorProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
      });
      return {
        sponsorType: profile?.sponsorType ?? null,
        kycStatus: profile?.kycStatus ?? 'not_started',
        companyName: profile?.companyName ?? null,
      };
    }),

  updateSponsorProfile: roleProcedure('sponsor')
    .input(
      z.object({
        sponsorType: z.enum(['individual', 'corporate', 'self']).optional(),
        companyName: z.string().max(120).nullable().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.sponsorProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
      });

      if (existing) {
        await ctx.db
          .update(sponsorProfiles)
          .set({
            ...(input.sponsorType !== undefined && { sponsorType: input.sponsorType }),
            ...(input.companyName !== undefined && { companyName: input.companyName }),
            updatedAt: new Date(),
          })
          .where(eq(sponsorProfiles.userId, ctx.user.id));
      } else {
        if (!input.sponsorType) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'sponsorType is required when creating a sponsor profile.',
          });
        }
        await ctx.db.insert(sponsorProfiles).values({
          userId: ctx.user.id,
          sponsorType: input.sponsorType,
          companyName: input.companyName ?? null,
          kycStatus: 'not_started',
        });
      }
    }),

  startDojahIdentityCheck: roleProcedure('sponsor')
    .input(
      z.object({
        tier: z.union([z.literal(2), z.literal(3)]),
        identityType: z.enum(['bvn', 'nin', 'passport']),
        identityNumber: z.string().trim().min(6).max(32).regex(/^[a-zA-Z0-9]+$/),
      }),
    )
    .output(
      z.object({
        referenceId: z.string(),
        tier: z.union([z.literal(2), z.literal(3)]),
        status: z.literal('pending'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let dojahReferenceId: string | undefined;
      try {
        dojahReferenceId = await callDojahKyc(input.identityType, input.identityNumber);

        const [verificationRecord] = await ctx.db
          .insert(kycVerifications)
          .values({
            userId: ctx.user.id,
            provider: 'dojah',
            status: 'pending',
            tier: input.tier,
            referenceId: dojahReferenceId,
          })
          .returning();

        if (!verificationRecord) {
          throw new Error('Failed to insert KYC verification record');
        }

        await ctx.db
          .update(sponsorProfiles)
          .set({ kycStatus: 'pending', updatedAt: new Date() })
          .where(eq(sponsorProfiles.userId, ctx.user.id));

        return { referenceId: verificationRecord.referenceId, tier: input.tier, status: 'pending' };
      } catch (error) {
        captureException(error, {
          tags: {
            router: 'sponsor',
            procedure: 'startDojahIdentityCheck',
            role: 'sponsor',
            identityType: input.identityType,
          },
          extra: {
            tier: input.tier,
            dojahReferenceId: dojahReferenceId ?? 'not_yet_obtained',
          },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to start identity verification.',
        });
      }
    }),

  initiateDisbursement: roleProcedure('sponsor')
    .input(z.object({ disbursementId: z.string().uuid() }))
    .output(z.object({ status: z.literal('processing'), paystackReference: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 1. Load disbursement + verify it belongs to this sponsor
      const [disbursement] = await ctx.db
        .select({
          id: disbursements.id,
          amountKobo: disbursements.amountKobo,
          status: disbursements.status,
          sponsorship: {
            sponsorId: sponsorships.sponsorId,
            studentId: sponsorships.studentId,
          },
        })
        .from(disbursements)
        .innerJoin(sponsorships, eq(disbursements.sponsorshipId, sponsorships.id))
        .where(eq(disbursements.id, input.disbursementId))
        .limit(1);

      if (!disbursement) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Disbursement not found.' });
      }
      if (disbursement.sponsorship.sponsorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your disbursement.' });
      }
      if (disbursement.status !== 'scheduled') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Disbursement is not in scheduled state.',
        });
      }

      // 2. Get student's most recent verified Paystack recipient code
      const [bankAccount] = await ctx.db
        .select({ paystackRecipientCode: bankAccounts.paystackRecipientCode })
        .from(bankAccounts)
        .where(eq(bankAccounts.userId, disbursement.sponsorship.studentId))
        .orderBy(desc(bankAccounts.linkedAt))
        .limit(1);

      if (!bankAccount?.paystackRecipientCode) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Student has not linked a verified bank account.',
        });
      }

      // 3. Initiate the Paystack transfer
      const reference = `DOCULET-${input.disbursementId}-${Date.now()}`;
      const transfer = await initiatePaystackTransfer({
        amountKobo: disbursement.amountKobo,
        recipientCode: bankAccount.paystackRecipientCode,
        reference,
      });

      if (!transfer.success) {
        captureException(new Error(`Paystack transfer failed: ${transfer.error}`), {
          tags: { domain: 'payments', disbursementId: input.disbursementId },
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payment initiation failed. Please try again.',
        });
      }

      // 4. Mark disbursement as processing with Paystack reference
      await ctx.db
        .update(disbursements)
        .set({
          status: 'processing',
          paystackReference: transfer.paystackReference,
          updatedAt: new Date(),
        })
        .where(eq(disbursements.id, input.disbursementId));

      return { status: 'processing', paystackReference: transfer.paystackReference };
    }),
});
