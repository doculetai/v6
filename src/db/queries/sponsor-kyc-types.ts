import { sponsorProfiles } from '@/db/schema';

export const sponsorIdentityMethods = ['nin', 'passport'] as const;
export const sponsorSourceOfFundsTypes = [
  'salary',
  'business',
  'savings',
  'investment',
] as const;
export const sponsorBankVerificationMethods = ['pdf', 'mono'] as const;
export const sponsorVerificationStates = [
  'not_started',
  'submitted',
  'under_review',
  'verified',
  'failed',
] as const;
export const sponsorKycStatuses = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'certificate_issued',
  'rejected',
  'action_required',
  'expired',
] as const;
export const sponsorTypes = ['individual', 'corporate', 'self'] as const;

export type SponsorIdentityMethod = (typeof sponsorIdentityMethods)[number];
export type SponsorSourceOfFundsType = (typeof sponsorSourceOfFundsTypes)[number];
export type SponsorBankVerificationMethod = (typeof sponsorBankVerificationMethods)[number];
export type SponsorVerificationState = (typeof sponsorVerificationStates)[number];
export type SponsorKycStatus = (typeof sponsorKycStatuses)[number];
export type SponsorType = (typeof sponsorTypes)[number];

type SponsorProfileRecord = typeof sponsorProfiles.$inferSelect;

const VERIFICATION_COMPLETE_STATES: SponsorVerificationState[] = [
  'submitted',
  'under_review',
  'verified',
];
const TERMINAL_STATUSES = new Set<SponsorKycStatus>([
  'approved',
  'certificate_issued',
  'rejected',
  'expired',
]);

export type SponsorKycComputationInput = Pick<
  SponsorProfileRecord,
  | 'sponsorType'
  | 'kycStatus'
  | 'identityMethod'
  | 'identityStatus'
  | 'nin'
  | 'passportNumber'
  | 'sourceOfFundsType'
  | 'sourceOfFundsAmountKobo'
  | 'bankVerificationMethod'
  | 'bankStatus'
  | 'bankStatementFileName'
  | 'monoAccountId'
  | 'isCorporate'
  | 'cacRegistrationNumber'
  | 'directorBvn'
  | 'sponsorshipLetterFileName'
  | 'corporateStatus'
>;

export type SponsorKycComputedState = {
  tier: 1 | 2 | 3;
  currentStep: number;
  kycStatus: SponsorKycStatus;
  identityComplete: boolean;
  sourceOfFundsComplete: boolean;
  bankComplete: boolean;
  corporateRequired: boolean;
  corporateComplete: boolean;
  shouldOfferPdfFallback: boolean;
};

export type SponsorKycStatusSnapshot = {
  sponsorType: SponsorType;
  isCorporate: boolean;
  kycStatus: SponsorKycStatus;
  tier: 1 | 2 | 3;
  currentStep: number;
  identityMethod: SponsorIdentityMethod | null;
  identityStatus: SponsorVerificationState;
  hasIdentityNumber: boolean;
  sourceOfFundsType: SponsorSourceOfFundsType | null;
  sourceOfFundsAmountNaira: number | null;
  bankVerificationMethod: SponsorBankVerificationMethod | null;
  bankStatus: SponsorVerificationState;
  hasBankStatement: boolean;
  hasMonoConnection: boolean;
  corporateStatus: SponsorVerificationState;
  hasCorporateDetails: boolean;
  shouldOfferPdfFallback: boolean;
  securitySignals: {
    lastLoginLocation: string | null;
    lastLoginDevice: string | null;
    activeSessionCount: number;
    suspiciousLoginAlerts: number;
    lastUpdatedAtWAT: string;
  };
};

export type SubmitSponsorIdentityInput = {
  userId: string;
  identityMethod: SponsorIdentityMethod;
  nin?: string;
  passportNumber?: string;
};

export type SubmitSponsorSourceOfFundsInput = {
  userId: string;
  sponsorType: SponsorType;
  sourceOfFundsType: SponsorSourceOfFundsType;
  sourceOfFundsAmountNaira: number;
  cacRegistrationNumber?: string;
  directorBvn?: string;
  sponsorshipLetterFileName?: string;
};

export type SubmitSponsorBankStatementInput = {
  userId: string;
  fileName: string;
};

export type ConnectSponsorMonoInput = {
  userId: string;
  monoAccountId: string;
  bankName: string;
  accountNumber: string;
  shouldFail?: boolean;
};

export type ConnectSponsorMonoResult = {
  snapshot: SponsorKycStatusSnapshot;
  status: 'connected' | 'failed';
  fallbackToPdf: boolean;
};

export function hasValue(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function isVerificationComplete(state: SponsorVerificationState): boolean {
  return VERIFICATION_COMPLETE_STATES.includes(state);
}

function resolveKycStatus(
  profile: SponsorKycComputationInput,
  computed: Omit<SponsorKycComputedState, 'kycStatus'>,
): SponsorKycStatus {
  if (TERMINAL_STATUSES.has(profile.kycStatus as SponsorKycStatus)) {
    return profile.kycStatus as SponsorKycStatus;
  }

  if (
    profile.identityStatus === 'failed' ||
    profile.corporateStatus === 'failed' ||
    computed.shouldOfferPdfFallback
  ) {
    return 'action_required';
  }

  if (computed.tier === 3) {
    return 'under_review';
  }

  if (computed.identityComplete || computed.sourceOfFundsComplete || computed.bankComplete) {
    return 'submitted';
  }

  return 'draft';
}

export function computeSponsorKycState(
  profile: SponsorKycComputationInput,
): SponsorKycComputedState {
  const hasIdentityNumber =
    (profile.identityMethod === 'nin' && hasValue(profile.nin)) ||
    (profile.identityMethod === 'passport' && hasValue(profile.passportNumber));
  const identityComplete = hasIdentityNumber && isVerificationComplete(profile.identityStatus);

  const sourceOfFundsComplete =
    profile.sourceOfFundsType !== null &&
    profile.sourceOfFundsType !== undefined &&
    typeof profile.sourceOfFundsAmountKobo === 'number' &&
    profile.sourceOfFundsAmountKobo > 0;

  const hasPdfStatement = hasValue(profile.bankStatementFileName);
  const hasMonoConnection = hasValue(profile.monoAccountId);
  const bankEvidenceComplete =
    (profile.bankVerificationMethod === 'pdf' && hasPdfStatement) ||
    (profile.bankVerificationMethod === 'mono' && hasMonoConnection);
  const bankComplete = bankEvidenceComplete && isVerificationComplete(profile.bankStatus);

  const corporateRequired = profile.isCorporate || profile.sponsorType === 'corporate';
  const corporateDetailsComplete =
    hasValue(profile.cacRegistrationNumber) &&
    hasValue(profile.directorBvn) &&
    hasValue(profile.sponsorshipLetterFileName);
  const corporateComplete =
    !corporateRequired ||
    (corporateDetailsComplete && isVerificationComplete(profile.corporateStatus));

  let tier: 1 | 2 | 3 = 1;
  if (identityComplete && sourceOfFundsComplete && bankComplete) {
    tier = corporateComplete ? 3 : 2;
  }

  let currentStep = 1;
  if (identityComplete && !sourceOfFundsComplete) {
    currentStep = 2;
  } else if (identityComplete && sourceOfFundsComplete && !bankComplete) {
    currentStep = 3;
  } else if (
    identityComplete &&
    sourceOfFundsComplete &&
    bankComplete &&
    corporateRequired &&
    !corporateComplete
  ) {
    currentStep = 4;
  } else if (identityComplete && sourceOfFundsComplete && bankComplete && corporateComplete) {
    currentStep = corporateRequired ? 5 : 4;
  }

  const shouldOfferPdfFallback =
    profile.bankVerificationMethod === 'mono' && profile.bankStatus === 'failed';

  const nextWithoutKyc = {
    tier,
    currentStep,
    identityComplete,
    sourceOfFundsComplete,
    bankComplete,
    corporateRequired,
    corporateComplete,
    shouldOfferPdfFallback,
  };

  return {
    ...nextWithoutKyc,
    kycStatus: resolveKycStatus(profile, nextWithoutKyc),
  };
}
