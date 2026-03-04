import { eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { sponsorProfiles } from '@/db/schema';

import {
  computeSponsorKycState,
  hasValue,
  type ConnectSponsorMonoInput,
  type ConnectSponsorMonoResult,
  type SponsorBankVerificationMethod,
  type SponsorIdentityMethod,
  type SponsorKycComputationInput,
  type SponsorKycStatus,
  type SponsorKycStatusSnapshot,
  type SponsorSourceOfFundsType,
  type SponsorType,
  type SponsorVerificationState,
  type SubmitSponsorBankStatementInput,
  type SubmitSponsorIdentityInput,
  type SubmitSponsorSourceOfFundsInput,
} from './sponsor-kyc-types';

export * from './sponsor-kyc-types';

type SponsorProfileRecord = typeof sponsorProfiles.$inferSelect;
type SponsorProfileInsert = typeof sponsorProfiles.$inferInsert;

function toWAT(date: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(date);
}

function mapProfileToSnapshot(
  profile: SponsorProfileRecord,
  computed: ReturnType<typeof computeSponsorKycState>,
): SponsorKycStatusSnapshot {
  const sourceOfFundsAmountNaira =
    typeof profile.sourceOfFundsAmountKobo === 'number'
      ? Math.floor(profile.sourceOfFundsAmountKobo / 100)
      : null;

  return {
    sponsorType: profile.sponsorType,
    isCorporate: profile.isCorporate,
    kycStatus: computed.kycStatus,
    tier: computed.tier,
    currentStep: computed.currentStep,
    identityMethod: profile.identityMethod,
    identityStatus: profile.identityStatus,
    hasIdentityNumber:
      (profile.identityMethod === 'nin' && hasValue(profile.nin)) ||
      (profile.identityMethod === 'passport' && hasValue(profile.passportNumber)),
    sourceOfFundsType: profile.sourceOfFundsType,
    sourceOfFundsAmountNaira,
    bankVerificationMethod: profile.bankVerificationMethod,
    bankStatus: profile.bankStatus,
    hasBankStatement: hasValue(profile.bankStatementFileName),
    hasMonoConnection: hasValue(profile.monoAccountId),
    corporateStatus: profile.corporateStatus,
    hasCorporateDetails:
      hasValue(profile.cacRegistrationNumber) &&
      hasValue(profile.directorBvn) &&
      hasValue(profile.sponsorshipLetterFileName),
    shouldOfferPdfFallback: computed.shouldOfferPdfFallback,
    securitySignals: {
      lastLoginLocation: null,
      lastLoginDevice: null,
      activeSessionCount: 1,
      suspiciousLoginAlerts: 0,
      lastUpdatedAtWAT: toWAT(profile.updatedAt),
    },
  };
}

async function getOrCreateSponsorProfile(db: DrizzleDB, userId: string): Promise<SponsorProfileRecord> {
  const existing = await db.query.sponsorProfiles.findFirst({
    where: (table) => eq(table.userId, userId),
  });

  if (existing) {
    return existing;
  }

  const insertPayload: SponsorProfileInsert = {
    userId,
    sponsorType: 'individual',
    isCorporate: false,
    kycStatus: 'draft',
    identityStatus: 'not_started',
    bankStatus: 'not_started',
    corporateStatus: 'not_started',
    tier: 1,
    currentStep: 1,
  };

  await db.insert(sponsorProfiles).values(insertPayload);

  const created = await db.query.sponsorProfiles.findFirst({
    where: (table) => eq(table.userId, userId),
  });

  if (!created) {
    throw new Error('Unable to create sponsor KYC profile.');
  }

  return created;
}

async function applyProfileUpdate(
  db: DrizzleDB,
  userId: string,
  patch: Partial<SponsorProfileRecord>,
): Promise<SponsorProfileRecord> {
  const current = await getOrCreateSponsorProfile(db, userId);
  const candidate: SponsorKycComputationInput = {
    sponsorType: (patch.sponsorType ?? current.sponsorType) as SponsorType,
    kycStatus: (patch.kycStatus ?? current.kycStatus) as SponsorKycStatus,
    identityMethod: (patch.identityMethod ?? current.identityMethod) as SponsorIdentityMethod | null,
    identityStatus: (patch.identityStatus ?? current.identityStatus) as SponsorVerificationState,
    nin: patch.nin ?? current.nin,
    passportNumber: patch.passportNumber ?? current.passportNumber,
    sourceOfFundsType:
      (patch.sourceOfFundsType ?? current.sourceOfFundsType) as SponsorSourceOfFundsType | null,
    sourceOfFundsAmountKobo: patch.sourceOfFundsAmountKobo ?? current.sourceOfFundsAmountKobo,
    bankVerificationMethod:
      (patch.bankVerificationMethod ?? current.bankVerificationMethod) as
        | SponsorBankVerificationMethod
        | null,
    bankStatus: (patch.bankStatus ?? current.bankStatus) as SponsorVerificationState,
    bankStatementFileName: patch.bankStatementFileName ?? current.bankStatementFileName,
    monoAccountId: patch.monoAccountId ?? current.monoAccountId,
    isCorporate: patch.isCorporate ?? current.isCorporate,
    cacRegistrationNumber: patch.cacRegistrationNumber ?? current.cacRegistrationNumber,
    directorBvn: patch.directorBvn ?? current.directorBvn,
    sponsorshipLetterFileName:
      patch.sponsorshipLetterFileName ?? current.sponsorshipLetterFileName,
    corporateStatus: (patch.corporateStatus ?? current.corporateStatus) as SponsorVerificationState,
  };
  const computed = computeSponsorKycState(candidate);

  await db
    .update(sponsorProfiles)
    .set({
      ...patch,
      tier: computed.tier,
      currentStep: computed.currentStep,
      kycStatus: computed.kycStatus,
      updatedAt: new Date(),
    })
    .where(eq(sponsorProfiles.userId, userId));

  return getOrCreateSponsorProfile(db, userId);
}

export async function getSponsorKycStatus(
  db: DrizzleDB,
  userId: string,
): Promise<SponsorKycStatusSnapshot> {
  const profile = await getOrCreateSponsorProfile(db, userId);
  const computed = computeSponsorKycState(profile);
  return mapProfileToSnapshot(profile, computed);
}

export async function submitSponsorIdentity(
  db: DrizzleDB,
  input: SubmitSponsorIdentityInput,
): Promise<SponsorKycStatusSnapshot> {
  const profile = await applyProfileUpdate(db, input.userId, {
    identityMethod: input.identityMethod,
    nin: input.identityMethod === 'nin' ? input.nin ?? null : null,
    passportNumber: input.identityMethod === 'passport' ? input.passportNumber ?? null : null,
    identityStatus: 'submitted',
  });

  const computed = computeSponsorKycState(profile);
  return mapProfileToSnapshot(profile, computed);
}

export async function submitSponsorSourceOfFunds(
  db: DrizzleDB,
  input: SubmitSponsorSourceOfFundsInput,
): Promise<SponsorKycStatusSnapshot> {
  const isCorporateSponsor = input.sponsorType === 'corporate';
  const hasCorporateDetails =
    hasValue(input.cacRegistrationNumber) &&
    hasValue(input.directorBvn) &&
    hasValue(input.sponsorshipLetterFileName);

  const profile = await applyProfileUpdate(db, input.userId, {
    sponsorType: input.sponsorType,
    isCorporate: isCorporateSponsor,
    sourceOfFundsType: input.sourceOfFundsType,
    sourceOfFundsAmountKobo: Math.floor(input.sourceOfFundsAmountNaira * 100),
    cacRegistrationNumber: isCorporateSponsor ? input.cacRegistrationNumber ?? null : null,
    directorBvn: isCorporateSponsor ? input.directorBvn ?? null : null,
    sponsorshipLetterFileName: isCorporateSponsor ? input.sponsorshipLetterFileName ?? null : null,
    corporateStatus: isCorporateSponsor
      ? hasCorporateDetails
        ? 'submitted'
        : 'not_started'
      : 'not_started',
  });

  const computed = computeSponsorKycState(profile);
  return mapProfileToSnapshot(profile, computed);
}

export async function submitSponsorBankStatement(
  db: DrizzleDB,
  input: SubmitSponsorBankStatementInput,
): Promise<SponsorKycStatusSnapshot> {
  const profile = await applyProfileUpdate(db, input.userId, {
    bankVerificationMethod: 'pdf',
    bankStatus: 'submitted',
    bankStatementFileName: input.fileName,
    bankStatementUploadedAt: new Date(),
  });

  const computed = computeSponsorKycState(profile);
  return mapProfileToSnapshot(profile, computed);
}

export async function connectSponsorMono(
  db: DrizzleDB,
  input: ConnectSponsorMonoInput,
): Promise<ConnectSponsorMonoResult> {
  const failedConnection = Boolean(input.shouldFail) || input.monoAccountId.startsWith('fail_');

  if (failedConnection) {
    const failedProfile = await applyProfileUpdate(db, input.userId, {
      bankVerificationMethod: 'mono',
      bankStatus: 'failed',
      monoAccountId: null,
    });
    const failedComputed = computeSponsorKycState(failedProfile);

    return {
      snapshot: mapProfileToSnapshot(failedProfile, failedComputed),
      status: 'failed',
      fallbackToPdf: true,
    };
  }

  const profile = await applyProfileUpdate(db, input.userId, {
    bankVerificationMethod: 'mono',
    bankStatus: 'submitted',
    monoAccountId: `${input.bankName}-${input.accountNumber}-${input.monoAccountId}`,
    monoLinkedAt: new Date(),
  });
  const computed = computeSponsorKycState(profile);

  return {
    snapshot: mapProfileToSnapshot(profile, computed),
    status: 'connected',
    fallbackToPdf: false,
  };
}
