import type { ComputeStudentVerificationProgressInput, VerificationStatus } from '@/db/queries/student-verification';
import { bankAccounts, kycVerifications } from '@/db/schema';

type KycVerificationRecord = typeof kycVerifications.$inferSelect;
type BankAccountRecord = typeof bankAccounts.$inferSelect;

type VerificationFixture = {
  name: string;
  input: ComputeStudentVerificationProgressInput;
  expected: {
    completionPercent: number;
    overallStatus: VerificationStatus;
    tierStatuses: [VerificationStatus, VerificationStatus, VerificationStatus];
  };
};

function createKycRecord(partial: Pick<KycVerificationRecord, 'tier' | 'status'>): KycVerificationRecord {
  return {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    provider: 'dojah',
    status: partial.status,
    tier: partial.tier,
    verifiedAt: partial.status === 'verified' ? new Date('2026-03-01T08:00:00.000Z') : null,
    referenceId: `ref_${partial.tier}_${partial.status}`,
    createdAt: new Date('2026-03-01T08:00:00.000Z'),
    updatedAt: new Date('2026-03-01T08:10:00.000Z'),
  };
}

function createBankRecord(): BankAccountRecord {
  return {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    provider: 'mono',
    accountNumber: '0123456789',
    bankName: 'Zenith Bank',
    monoAccountId: 'mono_acc_12345',
    paystackRecipientCode: null,
    linkedAt: new Date('2026-03-01T09:00:00.000Z'),
    createdAt: new Date('2026-03-01T09:00:00.000Z'),
    updatedAt: new Date('2026-03-01T09:00:00.000Z'),
  };
}

const profileUpdatedAt = new Date('2026-03-01T07:00:00.000Z');

export const verificationProgressFixtures: VerificationFixture[] = [
  {
    name: 'initial state with only email available',
    input: {
      hasEmail: true,
      hasPhone: false,
      latestTier2Kyc: null,
      latestTier3Kyc: null,
      latestBankAccount: null,
      profileUpdatedAt,
    },
    expected: {
      completionPercent: 0,
      overallStatus: 'pending',
      tierStatuses: ['pending', 'not_started', 'not_started'],
    },
  },
  {
    name: 'tier 2 verified but tier 3 pending due to missing mono',
    input: {
      hasEmail: true,
      hasPhone: true,
      latestTier2Kyc: createKycRecord({ tier: 2, status: 'verified' }),
      latestTier3Kyc: null,
      latestBankAccount: null,
      profileUpdatedAt,
    },
    expected: {
      completionPercent: 67,
      overallStatus: 'pending',
      tierStatuses: ['verified', 'verified', 'pending'],
    },
  },
  {
    name: 'all tiers complete when tier 3 identity and mono are complete',
    input: {
      hasEmail: true,
      hasPhone: true,
      latestTier2Kyc: createKycRecord({ tier: 2, status: 'verified' }),
      latestTier3Kyc: createKycRecord({ tier: 3, status: 'verified' }),
      latestBankAccount: createBankRecord(),
      profileUpdatedAt,
    },
    expected: {
      completionPercent: 100,
      overallStatus: 'verified',
      tierStatuses: ['verified', 'verified', 'verified'],
    },
  },
  {
    name: 'tier 3 failed dominates overall status',
    input: {
      hasEmail: true,
      hasPhone: true,
      latestTier2Kyc: createKycRecord({ tier: 2, status: 'verified' }),
      latestTier3Kyc: createKycRecord({ tier: 3, status: 'failed' }),
      latestBankAccount: createBankRecord(),
      profileUpdatedAt,
    },
    expected: {
      completionPercent: 67,
      overallStatus: 'failed',
      tierStatuses: ['verified', 'verified', 'failed'],
    },
  },
];
