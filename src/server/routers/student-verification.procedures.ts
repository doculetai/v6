import { TRPCError } from '@trpc/server';
import { captureException } from '@sentry/nextjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  connectMonoAccount,
  getStudentVerificationSnapshot,
  startDojahIdentityCheck,
  verificationStatusValues,
} from '@/db/queries/student-verification';
import { documents, studentProfiles } from '@/db/schema';
import { callDojahKyc } from '@/lib/services/dojah';
import { resolveNextKycTier } from '@/lib/kyc/resolve-tier';
import { createPaystackRecipient } from '@/lib/paystack/create-recipient';
import { updateBankRecipientCode } from '@/db/queries/update-bank-recipient';

import { roleProcedure } from '../trpc';

const verificationStatusSchema = z.object({
  fundingType: z.enum(['self', 'sponsor', 'corporate']).nullable(),
  phoneLastFour: z.string().nullable(),
  completionPercent: z.number().int().min(0).max(100),
  proofTargetKobo: z.number().int().nullable(),
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
    daysSinceLinked: z.number().int().nullable(),
  }),
  kycFailedAttempts: z.number().int().min(0),
  kycFailureReason: z.string().nullable(),
  eligibleForManualReview: z.boolean(),
});

const dojahIdentityTypeValues = ['bvn', 'nin', 'passport'] as const;

const startDojahIdentityCheckInputSchema = z.object({
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
  monoAccountId: z.string().nullable(),
  linkedAt: z.date(),
});

function toDojahTier(value: number | null | undefined): 2 | 3 | null {
  if (value === 2 || value === 3) return value;
  return null;
}

function toVerificationStatusOutput(
  snapshot: Awaited<ReturnType<typeof getStudentVerificationSnapshot>>,
  extras: {
    phoneLastFour: string | null;
    proofTargetKobo: number | null;
  },
) {
  const tier3OrTier2 = snapshot.latestKycByTier[3] ?? snapshot.latestKycByTier[2] ?? null;
  const latestTier = toDojahTier(tier3OrTier2?.tier);

  return {
    fundingType: snapshot.profile.fundingType,
    phoneLastFour: extras.phoneLastFour,
    completionPercent: snapshot.progress.completionPercent,
    proofTargetKobo: extras.proofTargetKobo,
    overallStatus: snapshot.progress.overallStatus,
    tiers: snapshot.progress.tiers,
    latestDojahCheck: {
      tier: latestTier,
      status: tier3OrTier2?.status ?? null,
      referenceId: tier3OrTier2?.referenceId ?? null,
      updatedAt: tier3OrTier2?.updatedAt ?? null,
    },
    monoConnection: (() => {
      const linkedAt = snapshot.latestBankAccount?.linkedAt ?? null;
      const daysSinceLinked =
        linkedAt !== null
          ? Math.floor((Date.now() - linkedAt.getTime()) / (24 * 60 * 60 * 1000))
          : null;

      return {
        isConnected: snapshot.latestBankAccount !== null,
        bankName: snapshot.latestBankAccount?.bankName ?? null,
        accountNumberMasked: snapshot.bankAccountMasked,
        monoAccountId: snapshot.latestBankAccount?.monoAccountId ?? null,
        linkedAt,
        daysSinceLinked,
      };
    })(),
    kycFailedAttempts: snapshot.kycFailedAttempts,
    kycFailureReason: snapshot.kycFailureReason,
    eligibleForManualReview: snapshot.kycFailedAttempts >= 2,
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
        const [snapshot, profileWithProgram] = await Promise.all([
          getStudentVerificationSnapshot(
            ctx.db,
            ctx.user.id,
            ctx.user.email,
            ctx.user.phone,
          ),
          ctx.db.query.studentProfiles.findFirst({
            where: eq(studentProfiles.userId, ctx.user.id),
            columns: {},
            with: {
              program: {
                columns: {
                  tuitionAmount: true,
                },
              },
            },
          }),
        ]);

        const phoneDigits = (ctx.user.phone ?? '').replace(/\D/g, '');
        const phoneLastFour = phoneDigits.length >= 4 ? phoneDigits.slice(-4) : null;

        return toVerificationStatusOutput(snapshot, {
          phoneLastFour,
          proofTargetKobo: profileWithProgram?.program?.tuitionAmount ?? null,
        });
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
        // Auto-resolve which tier to verify based on current state
        const snapshot = await getStudentVerificationSnapshot(
          ctx.db,
          ctx.user.id,
          ctx.user.email,
          ctx.user.phone,
        );
        const tier = resolveNextKycTier({
          hasEmail: Boolean(ctx.user.email),
          hasPhone: Boolean(ctx.user.phone),
          tier2Status: snapshot.progress.tiers[1]?.status ?? 'not_started',
          tier3Status: snapshot.progress.tiers[2]?.status ?? 'not_started',
          bankConnected: snapshot.latestBankAccount !== null,
        });

        if (!tier || tier === 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: tier === 1
              ? 'Please verify your phone number first.'
              : 'No identity check is needed right now. Your verification may already be in progress.',
          });
        }

        dojahReferenceId = await callDojahKyc(input.identityType, input.identityNumber);
        const record = await startDojahIdentityCheck(ctx.db, {
          userId: ctx.user.id,
          tier,
          referenceId: dojahReferenceId,
        });

        return { referenceId: record.referenceId, tier, status: 'pending' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        captureException(error, {
          tags: {
            router: 'student',
            procedure: 'startDojahIdentityCheck',
            role: 'student',
            identityType: input.identityType,
          },
          extra: {
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

  sendContactOtp: roleProcedure('student')
    .input(z.object({
      channel: z.enum(['phone', 'email']),
      value: z.string().trim().min(5).max(254),
    }))
    .output(z.object({ sent: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updatePayload = input.channel === 'phone'
          ? { phone: input.value }
          : { email: input.value };

        const { error } = await ctx.supabase.auth.updateUser(updatePayload);

        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }

        return { sent: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        captureException(error, {
          tags: { router: 'student', procedure: 'sendContactOtp', role: 'student', channel: input.channel },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to send verification code.',
        });
      }
    }),

  verifyContactOtp: roleProcedure('student')
    .input(z.object({
      channel: z.enum(['phone', 'email']),
      value: z.string().trim().min(5).max(254),
      token: z.string().trim().length(6).regex(/^[0-9]+$/),
    }))
    .output(z.object({ verified: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const otpPayload = input.channel === 'phone'
          ? { phone: input.value, token: input.token, type: 'phone_change' as const }
          : { email: input.value, token: input.token, type: 'email_change' as const };

        const { error } = await ctx.supabase.auth.verifyOtp(otpPayload);

        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }

        return { verified: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        captureException(error, {
          tags: { router: 'student', procedure: 'verifyContactOtp', role: 'student', channel: input.channel },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to verify code.',
        });
      }
    }),

  requestManualKycReview: roleProcedure('student')
    .input(
      z.object({
        governmentIdStorageUrl: z.string().url(),
        selfieStorageUrl: z.string().url(),
      }),
    )
    .output(z.object({ submitted: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.transaction(async (tx) => {
          await tx.insert(documents).values([
            {
              userId: ctx.user.id,
              type: 'passport',
              storageUrl: input.governmentIdStorageUrl,
              status: 'pending',
            },
            {
              userId: ctx.user.id,
              type: 'affidavit',
              storageUrl: input.selfieStorageUrl,
              status: 'pending',
            },
          ]);

          await tx
            .update(studentProfiles)
            .set({ kycStatus: 'pending', updatedAt: new Date() })
            .where(eq(studentProfiles.userId, ctx.user.id));
        });

        return { submitted: true };
      } catch (error) {
        captureException(error, {
          tags: { router: 'student', procedure: 'requestManualKycReview', role: 'student' },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to submit manual review request.',
        });
      }
    }),
};
