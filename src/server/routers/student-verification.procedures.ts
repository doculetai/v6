import { TRPCError } from '@trpc/server';
import { captureException } from '@sentry/nextjs';
import { z } from 'zod';

import {
  connectMonoAccount,
  getStudentVerificationSnapshot,
  startDojahIdentityCheck,
  verificationStatusValues,
} from '@/db/queries/student-verification';

import { roleProcedure } from '../trpc';

const verificationStatusSchema = z.object({
  completionPercent: z.number().int().min(0).max(100),
  overallStatus: z.enum(verificationStatusValues),
  tiers: z.array(
    z.object({
      tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      status: z.enum(verificationStatusValues),
      isComplete: z.boolean(),
      updatedAt: z.date().nullable(),
    }),
  ),
  latestDojahCheck: z.object({
    tier: z.union([z.literal(2), z.literal(3)]).nullable(),
    status: z.enum(['pending', 'verified', 'failed']).nullable(),
    referenceId: z.string().nullable(),
    updatedAt: z.date().nullable(),
  }),
  monoConnection: z.object({
    isConnected: z.boolean(),
    bankName: z.string().nullable(),
    accountNumberMasked: z.string().nullable(),
    monoAccountId: z.string().nullable(),
    linkedAt: z.date().nullable(),
  }),
});

const dojahIdentityTypeValues = ['bvn', 'nin', 'passport'] as const;

const startDojahIdentityCheckInputSchema = z.object({
  tier: z.union([z.literal(2), z.literal(3)]),
  identityType: z.enum(dojahIdentityTypeValues),
  identityNumber: z.string().trim().min(6).max(32).regex(/^[a-zA-Z0-9]+$/),
});

const startDojahIdentityCheckOutputSchema = z.object({
  referenceId: z.string(),
  tier: z.union([z.literal(2), z.literal(3)]),
  status: z.literal('pending'),
});

const connectMonoBankAccountInputSchema = z.object({
  monoAccountId: z.string().trim().min(4).max(128),
  bankName: z.string().trim().min(2).max(120),
  accountNumber: z.string().trim().regex(/^\d{10}$/),
});

const connectMonoBankAccountOutputSchema = z.object({
  bankName: z.string(),
  accountNumberMasked: z.string(),
  monoAccountId: z.string(),
  linkedAt: z.date(),
});

function toDojahTier(value: number | null | undefined): 2 | 3 | null {
  if (value === 2 || value === 3) return value;
  return null;
}

function toVerificationStatusOutput(
  snapshot: Awaited<ReturnType<typeof getStudentVerificationSnapshot>>,
) {
  const tier3OrTier2 = snapshot.latestKycByTier[3] ?? snapshot.latestKycByTier[2] ?? null;
  const latestTier = toDojahTier(tier3OrTier2?.tier);

  return {
    completionPercent: snapshot.progress.completionPercent,
    overallStatus: snapshot.progress.overallStatus,
    tiers: snapshot.progress.tiers,
    latestDojahCheck: {
      tier: latestTier,
      status: tier3OrTier2?.status ?? null,
      referenceId: tier3OrTier2?.referenceId ?? null,
      updatedAt: tier3OrTier2?.updatedAt ?? null,
    },
    monoConnection: {
      isConnected: snapshot.latestBankAccount !== null,
      bankName: snapshot.latestBankAccount?.bankName ?? null,
      accountNumberMasked: snapshot.bankAccountMasked,
      monoAccountId: snapshot.latestBankAccount?.monoAccountId ?? null,
      linkedAt: snapshot.latestBankAccount?.linkedAt ?? null,
    },
  };
}

export const verificationProcedures = {
  getVerificationStatus: roleProcedure('student')
    .output(verificationStatusSchema)
    .query(async ({ ctx }) => {
      try {
        const snapshot = await getStudentVerificationSnapshot(
          ctx.db,
          ctx.user.id,
          ctx.user.email,
          ctx.user.phone,
        );

        return toVerificationStatusOutput(snapshot);
      } catch (error) {
        captureException(error, {
          tags: { router: 'student', procedure: 'getVerificationStatus', role: 'student' },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to load verification status.',
        });
      }
    }),

  startDojahIdentityCheck: roleProcedure('student')
    .input(startDojahIdentityCheckInputSchema)
    .output(startDojahIdentityCheckOutputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const referenceId = `dojah_${input.tier}_${crypto.randomUUID()}`;
        const record = await startDojahIdentityCheck(ctx.db, {
          userId: ctx.user.id,
          tier: input.tier,
          referenceId,
        });

        return { referenceId: record.referenceId, tier: input.tier, status: 'pending' };
      } catch (error) {
        captureException(error, {
          tags: { router: 'student', procedure: 'startDojahIdentityCheck', role: 'student' },
          extra: { tier: input.tier, identityType: input.identityType },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to start identity verification.',
        });
      }
    }),

  connectMonoBankAccount: roleProcedure('student')
    .input(connectMonoBankAccountInputSchema)
    .output(connectMonoBankAccountOutputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const linkedAccount = await connectMonoAccount(ctx.db, {
          userId: ctx.user.id,
          monoAccountId: input.monoAccountId,
          bankName: input.bankName,
          accountNumber: input.accountNumber,
        });

        return {
          bankName: linkedAccount.bankName,
          accountNumberMasked: `****${linkedAccount.accountNumber.slice(-4)}`,
          monoAccountId: linkedAccount.monoAccountId,
          linkedAt: linkedAccount.linkedAt,
        };
      } catch (error) {
        captureException(error, {
          tags: { router: 'student', procedure: 'connectMonoBankAccount', role: 'student' },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to connect bank account.',
        });
      }
    }),
};
