import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const checklistKeys = ['kyc', 'school', 'bank', 'sponsor', 'documents'] as const;

export type ProofChecklistKey = (typeof checklistKeys)[number];

export type ProofChecklistStatus = {
  kycComplete: boolean;
  schoolComplete: boolean;
  bankComplete: boolean;
  sponsorComplete: boolean;
  documentsComplete: boolean;
  completedCount: number;
  totalCount: number;
  requiresSponsor: boolean;
};

export type ProofChecklistInputs = {
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed' | null;
  schoolComplete: boolean;
  bankStatus: 'not_started' | 'pending' | 'verified' | 'failed' | null;
  approvedDocumentCount: number;
  sponsorCount: number;
  fundingType: 'self' | 'sponsor' | 'corporate' | null;
};

export type ProofProgressSignals = {
  hasStudentProfile: boolean;
  kycStatus: ProofChecklistInputs['kycStatus'];
  bankStatus: ProofChecklistInputs['bankStatus'];
  uploadedDocumentCount: number;
  sponsorCount: number;
};

export type CertificateTokenPayload = {
  studentId: string;
  issuedAtIso: string;
  nonce: string;
};

export function calculateProofChecklistStatus(input: ProofChecklistInputs): ProofChecklistStatus {
  const requiresSponsor = input.fundingType === 'sponsor' || input.fundingType === 'corporate';

  const checklist = {
    kycComplete: input.kycStatus === 'verified',
    schoolComplete: input.schoolComplete,
    bankComplete: input.bankStatus === 'verified',
    sponsorComplete: requiresSponsor ? input.sponsorCount > 0 : true,
    documentsComplete: input.approvedDocumentCount > 0,
  };

  const effectiveKeys = requiresSponsor
    ? (['kyc', 'school', 'bank', 'sponsor', 'documents'] as const)
    : (['kyc', 'school', 'bank', 'documents'] as const);

  const completedCount = effectiveKeys.reduce((count, key) => {
    if (key === 'kyc') return checklist.kycComplete ? count + 1 : count;
    if (key === 'school') return checklist.schoolComplete ? count + 1 : count;
    if (key === 'bank') return checklist.bankComplete ? count + 1 : count;
    if (key === 'sponsor') return checklist.sponsorComplete ? count + 1 : count;
    return checklist.documentsComplete ? count + 1 : count;
  }, 0);

  return {
    ...checklist,
    completedCount,
    totalCount: effectiveKeys.length,
    requiresSponsor,
  };
}

export function hasProofProgress(signals: ProofProgressSignals): boolean {
  if (!signals.hasStudentProfile) {
    return false;
  }

  return (
    signals.kycStatus !== 'not_started' ||
    signals.bankStatus !== 'not_started' ||
    signals.uploadedDocumentCount > 0 ||
    signals.sponsorCount > 0
  );
}

export function getLatestIsoTimestamp(dates: Date[]): string | null {
  if (dates.length === 0) {
    return null;
  }

  const latest = dates.reduce((currentLatest, date) => {
    if (date.getTime() > currentLatest.getTime()) {
      return date;
    }

    return currentLatest;
  }, dates[0]);

  return latest.toISOString();
}

export function createTamperEvidentToken(input: {
  studentId: string;
  issuedAt: Date;
  secret: string;
}): string {
  const payload: CertificateTokenPayload = {
    studentId: input.studentId,
    issuedAtIso: input.issuedAt.toISOString(),
    nonce: randomUUID(),
  };

  const encodedPayload = encodePayload(payload);
  const signature = signPayload(encodedPayload, input.secret);

  return `${encodedPayload}.${signature}`;
}

export function verifyTamperEvidentToken(token: string, secret: string): boolean {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload, secret);

  return constantTimeEquals(signature, expectedSignature);
}

export function getSharePathFromToken(token: string): string {
  return `/certificate/${token}`;
}

function encodePayload(payload: CertificateTokenPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function constantTimeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
