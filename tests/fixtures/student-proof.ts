import type {
  ProofChecklistInputs,
  ProofProgressSignals,
} from '@/server/routers/student-proof-utils';

export const completeChecklistInputFixture: ProofChecklistInputs = {
  kycStatus: 'verified',
  bankStatus: 'verified',
  approvedDocumentCount: 2,
  sponsorCount: 1,
  schoolComplete: true,
  fundingType: 'self',
};

export const partialChecklistInputFixture: ProofChecklistInputs = {
  kycStatus: 'pending',
  bankStatus: 'verified',
  approvedDocumentCount: 0,
  sponsorCount: 0,
  schoolComplete: false,
  fundingType: 'sponsor',
};

export const activeProgressSignalsFixture: ProofProgressSignals = {
  hasStudentProfile: true,
  kycStatus: 'pending',
  bankStatus: 'not_started',
  uploadedDocumentCount: 1,
  sponsorCount: 0,
};

export const emptyProgressSignalsFixture: ProofProgressSignals = {
  hasStudentProfile: false,
  kycStatus: null,
  bankStatus: null,
  uploadedDocumentCount: 0,
  sponsorCount: 0,
};

export const tokenFixture = {
  studentId: 'be58d676-98ac-4c12-9d2b-e95f67a6f6d7',
  issuedAt: new Date('2026-03-01T10:00:00.000Z'),
  secret: 'test-secret',
};
