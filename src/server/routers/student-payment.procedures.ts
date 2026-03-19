import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { certificatePayments, certificates } from '@/db/schema';
import { insertAuditLog } from '@/db/queries/audit-log';

import { roleProcedure } from '../trpc';

const CERTIFICATE_FEE_KOBO = 8_000_000; // N80,000
const RENEWAL_FEE_KOBO = 4_000_000; // N40,000

export const paymentProcedures = {
  /** Initialize a certificate payment — returns Paystack inline config */
  initializeCertificatePayment: roleProcedure('student')
    .input(z.object({ certificateId: z.string().uuid() }))
    .output(
      z.object({
        paymentId: z.string(),
        amountKobo: z.number(),
        currency: z.string(),
        paystackPublicKey: z.string(),
        reference: z.string(),
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify certificate belongs to this student
      const cert = await ctx.db.query.certificates.findFirst({
        where: and(
          eq(certificates.id, input.certificateId),
          eq(certificates.studentId, ctx.user!.id),
        ),
        columns: { id: true, paymentStatus: true },
      });

      if (!cert) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Certificate not found.' });
      }

      if (cert.paymentStatus === 'paid' || cert.paymentStatus === 'waived') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Certificate has already been paid for.',
        });
      }

      // Check if there's an existing pending payment
      const existingPayment = await ctx.db.query.certificatePayments.findFirst({
        where: and(
          eq(certificatePayments.certificateId, input.certificateId),
          eq(certificatePayments.status, 'pending'),
        ),
      });

      if (existingPayment) {
        // Reuse existing pending payment reference
        return {
          paymentId: existingPayment.id,
          amountKobo: existingPayment.amountKobo,
          currency: existingPayment.currency,
          paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '',
          reference: existingPayment.paystackReference ?? `cert-${existingPayment.id}`,
          email: ctx.user!.email ?? '',
        };
      }

      // Determine fee (first cert vs renewal)
      const existingPaidCerts = await ctx.db.query.certificates.findMany({
        where: and(
          eq(certificates.studentId, ctx.user!.id),
          eq(certificates.paymentStatus, 'paid'),
        ),
        columns: { id: true },
      });

      const amountKobo = existingPaidCerts.length > 0 ? RENEWAL_FEE_KOBO : CERTIFICATE_FEE_KOBO;
      const reference = `cert-pay-${input.certificateId}-${Date.now()}`;

      const [payment] = await ctx.db
        .insert(certificatePayments)
        .values({
          certificateId: input.certificateId,
          studentId: ctx.user!.id,
          paidByUserId: ctx.user!.id,
          amountKobo,
          currency: 'NGN',
          paystackReference: reference,
          status: 'pending',
        })
        .returning({ id: certificatePayments.id });

      if (!payment) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return {
        paymentId: payment.id,
        amountKobo,
        currency: 'NGN',
        paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '',
        reference,
        email: ctx.user!.email ?? '',
      };
    }),

  /** Confirm certificate payment after Paystack callback */
  confirmCertificatePayment: roleProcedure('student')
    .input(
      z.object({
        reference: z.string(),
      }),
    )
    .output(z.object({ success: z.boolean(), certificateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the payment by reference
      const payment = await ctx.db.query.certificatePayments.findFirst({
        where: eq(certificatePayments.paystackReference, input.reference),
      });

      if (!payment || payment.studentId !== ctx.user!.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Payment not found.' });
      }

      if (payment.status === 'paid') {
        return { success: true, certificateId: payment.certificateId };
      }

      // Verify with Paystack API
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecret) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Payment verification unavailable.',
        });
      }

      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(input.reference)}`,
        {
          headers: { Authorization: `Bearer ${paystackSecret}` },
        },
      );

      const verifyData = await verifyRes.json() as {
        status: boolean;
        data?: { status: string; amount: number };
      };

      if (!verifyData.status || verifyData.data?.status !== 'success') {
        // Mark payment as failed
        await ctx.db
          .update(certificatePayments)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(certificatePayments.id, payment.id));

        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Payment verification failed.',
        });
      }

      // Mark payment as paid
      await ctx.db
        .update(certificatePayments)
        .set({ status: 'paid', paidAt: new Date(), updatedAt: new Date() })
        .where(eq(certificatePayments.id, payment.id));

      // Mark certificate as paid
      await ctx.db
        .update(certificates)
        .set({ paymentStatus: 'paid' })
        .where(eq(certificates.id, payment.certificateId));

      await insertAuditLog(ctx.db, {
        actorId: ctx.user!.id,
        action: 'certificate.paid',
        entityType: 'certificate',
        entityId: payment.certificateId,
        meta: { reference: input.reference, amountKobo: payment.amountKobo },
      });

      return { success: true, certificateId: payment.certificateId };
    }),

  /** Get certificate payment status */
  getCertificatePaymentStatus: roleProcedure('student')
    .input(z.object({ certificateId: z.string().uuid() }))
    .output(
      z.object({
        paymentStatus: z.enum(['unpaid', 'paid', 'waived']),
        amountKobo: z.number().nullable(),
        paidAt: z.date().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cert = await ctx.db.query.certificates.findFirst({
        where: and(
          eq(certificates.id, input.certificateId),
          eq(certificates.studentId, ctx.user!.id),
        ),
        columns: { paymentStatus: true },
      });

      if (!cert) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const payment = await ctx.db.query.certificatePayments.findFirst({
        where: and(
          eq(certificatePayments.certificateId, input.certificateId),
          eq(certificatePayments.status, 'paid'),
        ),
        columns: { amountKobo: true, paidAt: true },
      });

      return {
        paymentStatus: cert.paymentStatus,
        amountKobo: payment?.amountKobo ?? null,
        paidAt: payment?.paidAt ?? null,
      };
    }),
};
