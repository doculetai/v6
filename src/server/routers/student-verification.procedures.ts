import { TRPCError } from '@trpc/server';
import { captureException } from '@sentry/nextjs';
import { z } from 'zod';

import {
  connectMonoAccount,
  getStudentVerificationSnapshot,
  startDojahIdentityCheck,
  verificationStatusValues,
} from '@/db/queries/student-verification';
import { callDojahKyc } from '@/lib/services/dojah';
import { createPaystackRecipient } from '@/lib/paystack/create-recipient';
import { updateBankRecipientCode } from '@/db/queries/update-bank-recipient';

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


const monoAuthResponseSchema = z.object({
  id: z.string().optional(),
  message: z.string().optional(),
});

const monoAccountResponseSchema = z.object({
  account: z
    .object({
      name: z.string().optional(),
      accountNumber: z.string().optional(),
      institution: z.object({ name: z.string().optional() }).optional(),
    })
    .optional(),
  message: z.string().optional(),
});

type MonoAccountDetails = {
  monoAccountId: string;
  accountNumber: string;
  bankName: string;
};

async function exchangeMonoCodeAndVerify(monoCode: string): Promise<MonoAccountDetails> {
  const secretKey = process.env.MONO_SECRET_KEY;
  if (!secretKey) throw new Error('Missing MONO_SECRET_KEY');

  // Step 1: exchange code for account ID
  const authRes = await fetch('https://api.withmono.com/v2/accounts/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'mono-sec-key': secretKey,
    },
    body: JSON.stringify({ code: monoCode }),
  });

  const authParsed = monoAuthResponseSchema.safeParse(await authRes.json());
  if (!authParsed.success || !authRes.ok || !authParsed.data.id) {
    const msg = authParsed.success ? authParsed.data.message : undefined;
    throw new Error(msg ?? 'Mono auth exchange failed');
  }

  const accountId = authParsed.data.id;
  if (!/^[a-zA-Z0-9_-]+$/.test(accountId)) {
    throw new Error('Mono returned an unexpected account ID format');
  }

  // Step 2: get account details
  const accountRes = await fetch(`https://api.withmono.com/v2/accounts/${accountId}`, {
    headers: { 'mono-sec-key': secretKey },
  });

  const accountParsed = monoAccountResponseSchema.safeParse(await accountRes.json());
  if (!accountParsed.success || !accountRes.ok || !accountParsed.data.account) {
    const msg = accountParsed.success ? accountParsed.data.message : undefined;
    throw new Error(msg ?? 'Mono account fetch failed');
  }

  const account = accountParsed.data.account;
  const accountNumber = account.accountNumber;
  if (!accountNumber) {
    throw new Error('Mono returned no accountNumber');
  }

  return {
    monoAccountId: accountId,
    accountNumber,
    bankName: account.institution?.name ?? account.name ?? 'Unknown Bank',
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
      let dojahReferenceId: string | undefined;
      try {
        dojahReferenceId = await callDojahKyc(input.identityType, input.identityNumber);
        const record = await startDojahIdentityCheck(ctx.db, {
          userId: ctx.user.id,
          tier: input.tier,
          referenceId: dojahReferenceId,
        });

        return { referenceId: record.referenceId, tier: input.tier, status: 'pending' };
      } catch (error) {
        captureException(error, {
          tags: {
            router: 'student',
            procedure: 'startDojahIdentityCheck',
            role: 'student',
            identityType: input.identityType,
          },
          extra: {
            tier: input.tier,
            // Include dojahReferenceId so ops can manually recover if DB write failed after Dojah succeeded
            dojahReferenceId: dojahReferenceId ?? 'not_yet_obtained',
          },
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
        // input.monoAccountId is the code from the Mono widget
        const verified = await exchangeMonoCodeAndVerify(input.monoAccountId);

        const linkedAccount = await connectMonoAccount(ctx.db, {
          userId: ctx.user.id,
          monoAccountId: verified.monoAccountId,
          bankName: verified.bankName,
          accountNumber: verified.accountNumber,
        });

        // Fire-and-forget: create Paystack recipient (non-blocking, failures logged to Sentry)
        void createPaystackRecipient({
          name: verified.bankName,
          accountNumber: verified.accountNumber,
          bankName: verified.bankName,
        }).then(async (result) => {
          if (result.success) {
            await updateBankRecipientCode(ctx.db, verified.monoAccountId, result.recipientCode);
          } else {
            captureException(new Error(`Paystack recipient creation failed: ${result.error}`), {
              tags: { domain: 'payments', operation: 'create-recipient' },
            });
          }
        }).catch((err: unknown) => {
          captureException(err, { tags: { domain: 'payments', operation: 'create-recipient' } });
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
          message: 'Unable to connect bank account. Please try again.',
        });
      }
    }),
};
