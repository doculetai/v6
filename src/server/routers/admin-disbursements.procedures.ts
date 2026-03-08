import { TRPCError } from '@trpc/server';
import { captureException } from '@sentry/nextjs';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { bankAccounts, disbursements, sponsorships } from '@/db/schema';
import { insertAuditLog } from '@/db/queries/audit-log';
import { initiatePaystackTransfer } from '@/lib/paystack/initiate-transfer';

import { createTRPCRouter, roleProcedure } from '../trpc';

export const adminDisbursementsRouter = createTRPCRouter({
  initiateDisbursement: roleProcedure('admin')
    .input(z.object({ disbursementId: z.string().uuid() }))
    .output(z.object({ status: z.literal('processing'), paystackReference: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 1. Load disbursement — no ownership check; admin can initiate for any sponsorship
      const [disbursement] = await ctx.db
        .select({
          id: disbursements.id,
          amountKobo: disbursements.amountKobo,
          status: disbursements.status,
          sponsorship: {
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

      // 2. Get student's Paystack recipient code from their linked bank account
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

      // 3. Atomically claim the disbursement — prevents double-spend on concurrent requests
      const reference = `DOCULET-${input.disbursementId}`;
      const [claimed] = await ctx.db
        .update(disbursements)
        .set({ status: 'processing', updatedAt: new Date() })
        .where(and(eq(disbursements.id, input.disbursementId), eq(disbursements.status, 'scheduled')))
        .returning({ id: disbursements.id });

      if (!claimed) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Disbursement is not in scheduled state.',
        });
      }

      // 4. Call Paystack — idempotent reference means retries are safe
      const transfer = await initiatePaystackTransfer({
        amountKobo: disbursement.amountKobo,
        recipientCode: bankAccount.paystackRecipientCode,
        reference,
      });

      if (!transfer.success) {
        // Roll back the status so the admin can retry
        await ctx.db
          .update(disbursements)
          .set({ status: 'scheduled', paystackReference: null, updatedAt: new Date() })
          .where(eq(disbursements.id, input.disbursementId));

        captureException(new Error(`Paystack transfer failed: ${transfer.error}`), {
          tags: { domain: 'payments', disbursementId: input.disbursementId, actor: 'admin' },
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payment initiation failed. Please try again.',
        });
      }

      // 5. Persist paystackReference — Sentry alert if this fails (transfer already live)
      try {
        await ctx.db
          .update(disbursements)
          .set({ paystackReference: transfer.paystackReference, updatedAt: new Date() })
          .where(eq(disbursements.id, input.disbursementId));
      } catch (dbError) {
        captureException(dbError, {
          tags: { domain: 'payments', procedure: 'admin.initiateDisbursement' },
          extra: {
            disbursementId: input.disbursementId,
            paystackReference: transfer.paystackReference,
            transferCode: transfer.transferCode,
            note: 'Paystack transfer succeeded but DB update failed — REQUIRES MANUAL RECONCILIATION',
          },
        });
        // Return success — the transfer IS live, Sentry will alert ops
        return { status: 'processing', paystackReference: transfer.paystackReference };
      }

      await insertAuditLog(ctx.db, {
        actorId: ctx.user.id,
        action: 'admin.initiateDisbursement',
        entityType: 'disbursement',
        entityId: input.disbursementId,
        meta: { paystackReference: transfer.paystackReference },
        ip: ctx.ip ?? undefined,
        userAgent: ctx.userAgent ?? undefined,
      });

      return { status: 'processing', paystackReference: transfer.paystackReference };
    }),
});
