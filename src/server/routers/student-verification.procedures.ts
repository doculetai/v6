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

async function callDojahKyc(
  identityType: 'bvn' | 'nin' | 'passport',
  identityNumber: string,
): Promise<string> {
  const appId = process.env.DOJAH_APP_ID;
  const privateKey = process.env.DOJAH_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error('Missing DOJAH_APP_ID or DOJAH_PRIVATE_KEY');
  }

  const base =
    identityType === 'passport'
      ? 'https://api.dojah.io/api/v1/kyc/passport'
      : `https://api.dojah.io/api/v1/kyc/${identityType}`;
  const params = new URLSearchParams();
  if (identityType === 'passport') {
    params.set('passport', identityNumber);
    params.set('country', 'NG');
  } else {
    params.set(identityType, identityNumber);
  }
  const url = `${base}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AppId: appId,
      Authorization: privateKey,
      Accept: 'application/json',
    },
  });

  const dojahResponseSchema = z.object({
    entity: z.object({ reference_id: z.string() }).optional(),
    error: z.string().optional(),
  });

  const parsed = dojahResponseSchema.safeParse(await response.json());
  if (!parsed.success || !response.ok) {
    const errorMsg = parsed.success ? parsed.data.error : undefined;
    throw new Error(errorMsg ?? `Dojah API error: ${response.status}`);
  }

  if (parsed.data.error) {
    throw new Error(parsed.data.error);
  }

  const referenceId = parsed.data.entity?.reference_id;
  if (!referenceId) {
    throw new Error('Dojah returned no reference_id');
  }

  return referenceId;
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
