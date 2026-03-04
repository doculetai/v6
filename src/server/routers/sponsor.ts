import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  cancelSponsorDisbursementRecord,
  createSponsorDisbursementRecord,
  getSponsorSponsorshipForDisbursement,
  listSponsorDisbursements,
  listSponsorStudentsForDisbursements,
} from '@/db/queries/sponsor-disbursements';
import { users } from '@/db/schema';

import { createTRPCRouter, roleProcedure } from '../trpc';

const disbursementStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);

const disbursementSchema = z.object({
  id: z.string().uuid(),
  sponsorshipId: z.string().uuid(),
  amountKobo: z.number().int(),
  status: disbursementStatusSchema,
  paystackReference: z.string().nullable(),
  scheduledAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  disbursedAt: z.string().datetime().nullable(),
  studentId: z.string().uuid(),
  studentEmail: z.string().email(),
  studentDisplayName: z.string(),
});

const disbursementStudentSchema = z.object({
  sponsorshipId: z.string().uuid(),
  studentId: z.string().uuid(),
  studentEmail: z.string().email(),
  studentDisplayName: z.string(),
});

const getDisbursementsOutputSchema = z.object({
  disbursements: z.array(disbursementSchema),
  students: z.array(disbursementStudentSchema),
  summary: z.object({
    totalKobo: z.number().int(),
    pendingCount: z.number().int(),
    completedCount: z.number().int(),
    failedCount: z.number().int(),
  }),
});

const createDisbursementInputSchema = z.object({
  sponsorshipId: z.string().uuid(),
  amountKobo: z.number().int().min(100_000).max(50_000_000_000),
  note: z.string().trim().max(160).optional(),
  scheduledAt: z.string().optional(),
});

const paystackInitializeResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  data: z
    .object({
      authorization_url: z.string().url(),
      access_code: z.string(),
      reference: z.string(),
    })
    .optional(),
});

const cancelDisbursementInputSchema = z.object({
  disbursementId: z.string().uuid(),
});

const cancelDisbursementOutputSchema = z.object({
  disbursement: disbursementSchema,
});

async function resolveSponsorEmail(ctx: {
  db: typeof import('@/db').db;
  user: { id: string; email?: string | null };
}) {
  if (ctx.user.email) {
    return ctx.user.email;
  }

  const [sponsorUser] = await ctx.db
    .select({
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, ctx.user.id))
    .limit(1);

  if (!sponsorUser?.email) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to resolve sponsor email.',
    });
  }

  return sponsorUser.email;
}

function isValidDateString(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

export const sponsorRouter = createTRPCRouter({
  getDisbursements: roleProcedure('sponsor')
    .output(getDisbursementsOutputSchema)
    .query(async ({ ctx }) => {
      const [disbursements, students] = await Promise.all([
        listSponsorDisbursements(ctx.db, ctx.user.id),
        listSponsorStudentsForDisbursements(ctx.db, ctx.user.id),
      ]);

      const summary = disbursements.reduce(
        (acc, disbursement) => {
          if (disbursement.status === 'pending' || disbursement.status === 'processing') {
            acc.pendingCount += 1;
          }
          if (disbursement.status === 'completed') {
            acc.completedCount += 1;
            acc.totalKobo += disbursement.amountKobo;
          }
          if (disbursement.status === 'failed') {
            acc.failedCount += 1;
          }
          return acc;
        },
        { totalKobo: 0, pendingCount: 0, completedCount: 0, failedCount: 0 },
      );

      return {
        disbursements: disbursements.map((item) => ({
          ...item,
          scheduledAt: item.scheduledAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          createdAt: item.createdAt.toISOString(),
          disbursedAt: item.disbursedAt?.toISOString() ?? null,
        })),
        students,
        summary,
      };
    }),

  createDisbursement: roleProcedure('sponsor')
    .input(createDisbursementInputSchema)
    .output(
      z.object({
        disbursement: disbursementSchema,
        paystackAuthorizationUrl: z.string().url(),
        paystackAccessCode: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.scheduledAt && !isValidDateString(input.scheduledAt)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid schedule date.' });
      }

      const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : new Date();
      if (input.scheduledAt && scheduledAt.getTime() <= Date.now()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Schedule date must be in the future.' });
      }

      const sponsorship = await getSponsorSponsorshipForDisbursement(
        ctx.db,
        ctx.user.id,
        input.sponsorshipId,
      );
      if (!sponsorship) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sponsorship record not found for this sponsor.',
        });
      }

      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecretKey) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Paystack configuration is missing.',
        });
      }

      const sponsorEmail = await resolveSponsorEmail({
        db: ctx.db,
        user: ctx.user,
      });

      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sponsorEmail,
          amount: input.amountKobo,
          currency: 'NGN',
          metadata: {
            sponsorId: ctx.user.id,
            sponsorshipId: input.sponsorshipId,
            studentId: sponsorship.studentId,
            studentEmail: sponsorship.studentEmail,
            scheduleWAT: scheduledAt.toISOString(),
            note: input.note ?? null,
          },
        }),
      });

      if (!paystackResponse.ok) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: 'Paystack initialize request failed.',
        });
      }

      const payload = await paystackResponse.json();
      const parsedPayload = paystackInitializeResponseSchema.safeParse(payload);
      if (!parsedPayload.success || !parsedPayload.data.status || !parsedPayload.data.data) {
        throw new TRPCError({
          code: 'BAD_GATEWAY',
          message: 'Paystack initialize response was invalid.',
        });
      }

      const created = await createSponsorDisbursementRecord(ctx.db, {
        sponsorshipId: input.sponsorshipId,
        amountKobo: input.amountKobo,
        scheduledAt,
        paystackReference: parsedPayload.data.data.reference,
      });

      return {
        disbursement: {
          id: created.id,
          sponsorshipId: created.sponsorshipId,
          amountKobo: created.amountKobo,
          status: 'pending',
          paystackReference: created.paystackReference,
          scheduledAt: created.scheduledAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
          createdAt: created.createdAt.toISOString(),
          disbursedAt: created.disbursedAt?.toISOString() ?? null,
          studentId: sponsorship.studentId,
          studentEmail: sponsorship.studentEmail,
          studentDisplayName: sponsorship.studentDisplayName,
        },
        paystackAuthorizationUrl: parsedPayload.data.data.authorization_url,
        paystackAccessCode: parsedPayload.data.data.access_code,
      };
    }),

  cancelDisbursement: roleProcedure('sponsor')
    .input(cancelDisbursementInputSchema)
    .output(cancelDisbursementOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const disbursement = await cancelSponsorDisbursementRecord(ctx.db, ctx.user.id, input.disbursementId);

      if (!disbursement) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Disbursement not found for this sponsor.',
        });
      }

      return {
        disbursement: {
          ...disbursement,
          scheduledAt: disbursement.scheduledAt.toISOString(),
          updatedAt: disbursement.updatedAt.toISOString(),
          createdAt: disbursement.createdAt.toISOString(),
          disbursedAt: disbursement.disbursedAt?.toISOString() ?? null,
        },
      };
    }),
});
