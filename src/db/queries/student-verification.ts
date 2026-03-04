import { and, desc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { bankAccounts, kycVerifications, studentProfiles } from '@/db/schema';

export type VerificationTierNumber = 1 | 2 | 3;

export const verificationStatusValues = ['not_started', 'pending', 'verified', 'failed'] as const;

export type VerificationStatus = (typeof verificationStatusValues)[number];

type TierProgress = {
  tier: VerificationTierNumber;
  status: VerificationStatus;
  isComplete: boolean;
  updatedAt: Date | null;
};

export type StudentVerificationProgress = {
  completionPercent: number;
  overallStatus: VerificationStatus;
  tiers: [TierProgress, TierProgress, TierProgress];
};

export type StudentVerificationSnapshot = {
  profile: typeof studentProfiles.$inferSelect;
  latestKycByTier: Partial<Record<2 | 3, typeof kycVerifications.$inferSelect>>;
  latestBankAccount: typeof bankAccounts.$inferSelect | null;
  bankAccountMasked: string | null;
  progress: StudentVerificationProgress;
};

type ProfileQueryClient = Pick<DrizzleDB, 'query' | 'insert'>;

type ProgressInput = {
  hasEmail: boolean;
  hasPhone: boolean;
  latestTier2Kyc: typeof kycVerifications.$inferSelect | null;
  latestTier3Kyc: typeof kycVerifications.$inferSelect | null;
  latestBankAccount: typeof bankAccounts.$inferSelect | null;
  profileUpdatedAt: Date;
};

export type ComputeStudentVerificationProgressInput = ProgressInput;

type StartDojahCheckInput = {
  userId: string;
  tier: 2 | 3;
  referenceId: string;
};

type ConnectMonoAccountInput = {
  userId: string;
  monoAccountId: string;
  accountNumber: string;
  bankName: string;
};

function toTrackerStatus(status: 'pending' | 'verified' | 'failed' | null | undefined): VerificationStatus {
  if (!status) {
    return 'not_started';
  }

  return status;
}

function isVerified(status: VerificationStatus): boolean {
  return status === 'verified';
}

function getMostRecentDate(...values: Array<Date | null>): Date | null {
  const nonNullDates = values.filter((value): value is Date => value !== null);

  if (nonNullDates.length === 0) {
    return null;
  }

  return nonNullDates.sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
}

export function maskAccountNumber(accountNumber: string): string {
  const lastFour = accountNumber.slice(-4);

  if (!lastFour) {
    return '****';
  }

  return `****${lastFour}`;
}

export function computeStudentVerificationProgress({
  hasEmail,
  hasPhone,
  latestTier2Kyc,
  latestTier3Kyc,
  latestBankAccount,
  profileUpdatedAt,
}: ProgressInput): StudentVerificationProgress {
  const hasContactBasics = hasEmail && hasPhone;
  const tier1Status: VerificationStatus = hasContactBasics ? 'verified' : 'pending';
  const tier2Status = toTrackerStatus(latestTier2Kyc?.status);

  const tier3IdentityStatus = toTrackerStatus(latestTier3Kyc?.status);
  const bankConnected = latestBankAccount !== null;

  let tier3Status: VerificationStatus = 'not_started';

  if (tier3IdentityStatus === 'failed') {
    tier3Status = 'failed';
  } else if (tier3IdentityStatus === 'pending') {
    tier3Status = 'pending';
  } else if (tier3IdentityStatus === 'verified' && bankConnected) {
    tier3Status = 'verified';
  } else if (tier3IdentityStatus === 'verified' || bankConnected) {
    tier3Status = 'pending';
  } else if (tier2Status === 'verified') {
    tier3Status = 'pending';
  }

  const tiers: [TierProgress, TierProgress, TierProgress] = [
    {
      tier: 1,
      status: tier1Status,
      isComplete: isVerified(tier1Status),
      updatedAt: profileUpdatedAt,
    },
    {
      tier: 2,
      status: tier2Status,
      isComplete: isVerified(tier2Status),
      updatedAt: latestTier2Kyc?.updatedAt ?? null,
    },
    {
      tier: 3,
      status: tier3Status,
      isComplete: isVerified(tier3Status),
      updatedAt: getMostRecentDate(latestTier3Kyc?.updatedAt ?? null, latestBankAccount?.linkedAt ?? null),
    },
  ];

  const completeCount = tiers.filter((tier) => tier.isComplete).length;
  const completionPercent = Math.round((completeCount / tiers.length) * 100);

  const anyFailed = tiers.some((tier) => tier.status === 'failed');
  const anyPending = tiers.some((tier) => tier.status === 'pending');
  const allNotStarted = tiers.every((tier) => tier.status === 'not_started');

  const overallStatus: VerificationStatus = anyFailed
    ? 'failed'
    : completeCount === tiers.length
      ? 'verified'
      : anyPending
        ? 'pending'
        : allNotStarted
          ? 'not_started'
          : 'pending';

  return {
    completionPercent,
    overallStatus,
    tiers,
  };
}

async function ensureStudentProfile(db: ProfileQueryClient, userId: string) {
  const existingProfile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, userId),
  });

  if (existingProfile) {
    return existingProfile;
  }

  const [newProfile] = await db
    .insert(studentProfiles)
    .values({
      userId,
    })
    .returning();

  if (!newProfile) {
    throw new Error('Unable to create student profile');
  }

  return newProfile;
}

export async function getStudentVerificationSnapshot(
  db: DrizzleDB,
  userId: string,
  userEmail: string | null | undefined,
  userPhone: string | null | undefined,
): Promise<StudentVerificationSnapshot> {
  const profile = await ensureStudentProfile(db, userId);

  const recentKycChecks = await db
    .select()
    .from(kycVerifications)
    .where(and(eq(kycVerifications.userId, userId), eq(kycVerifications.provider, 'dojah')))
    .orderBy(desc(kycVerifications.createdAt));

  const latestKycByTier: Partial<Record<2 | 3, typeof kycVerifications.$inferSelect>> = {};

  for (const check of recentKycChecks) {
    if ((check.tier === 2 || check.tier === 3) && !latestKycByTier[check.tier]) {
      latestKycByTier[check.tier] = check;
    }

    if (latestKycByTier[2] && latestKycByTier[3]) {
      break;
    }
  }

  const [latestBankAccount] = await db
    .select()
    .from(bankAccounts)
    .where(and(eq(bankAccounts.userId, userId), eq(bankAccounts.provider, 'mono')))
    .orderBy(desc(bankAccounts.linkedAt))
    .limit(1);

  const progress = computeStudentVerificationProgress({
    hasEmail: Boolean(userEmail),
    hasPhone: Boolean(userPhone),
    latestTier2Kyc: latestKycByTier[2] ?? null,
    latestTier3Kyc: latestKycByTier[3] ?? null,
    latestBankAccount: latestBankAccount ?? null,
    profileUpdatedAt: profile.updatedAt,
  });

  return {
    profile,
    latestKycByTier,
    latestBankAccount: latestBankAccount ?? null,
    bankAccountMasked: latestBankAccount ? maskAccountNumber(latestBankAccount.accountNumber) : null,
    progress,
  };
}

export async function startDojahIdentityCheck(db: DrizzleDB, input: StartDojahCheckInput) {
  return db.transaction(async (tx) => {
    await ensureStudentProfile(tx, input.userId);

    const [verificationRecord] = await tx
      .insert(kycVerifications)
      .values({
        userId: input.userId,
        provider: 'dojah',
        status: 'pending',
        tier: input.tier,
        referenceId: input.referenceId,
      })
      .returning();

    await tx
      .update(studentProfiles)
      .set({
        kycStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.userId, input.userId));

    if (!verificationRecord) {
      throw new Error('Unable to start Dojah verification');
    }

    return verificationRecord;
  });
}

export async function connectMonoAccount(db: DrizzleDB, input: ConnectMonoAccountInput) {
  return db.transaction(async (tx) => {
    await ensureStudentProfile(tx, input.userId);

    const existingConnection = await tx.query.bankAccounts.findFirst({
      where: and(
        eq(bankAccounts.userId, input.userId),
        eq(bankAccounts.provider, 'mono'),
        eq(bankAccounts.monoAccountId, input.monoAccountId),
      ),
    });

    const linkedAccount = existingConnection
      ? existingConnection
      : (
          await tx
            .insert(bankAccounts)
            .values({
              userId: input.userId,
              provider: 'mono',
              accountNumber: input.accountNumber,
              bankName: input.bankName,
              monoAccountId: input.monoAccountId,
            })
            .returning()
        )[0];

    await tx
      .update(studentProfiles)
      .set({
        bankStatus: 'verified',
        onboardingStep: 3,
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.userId, input.userId));

    if (!linkedAccount) {
      throw new Error('Unable to connect Mono account');
    }

    return linkedAccount;
  });
}
