import type { OperationsQueueRow, OperationsStats } from '@/db/queries/admin-operations';

export const adminOperationsFixtures = {
  pendingRow: {
    id: 'doc-001',
    type: 'passport',
    status: 'pending',
    rejectionReason: null,
    reviewedAt: null,
    createdAt: new Date('2026-02-10T09:00:00Z'),
    studentEmail: 'aisha.ibrahim@example.com',
    reviewerEmail: null,
    schoolName: 'University of Michigan',
    kycStatus: 'verified',
    bankStatus: 'not_started',
  } satisfies OperationsQueueRow,

  approvedRow: {
    id: 'doc-002',
    type: 'bank_statement',
    status: 'approved',
    rejectionReason: null,
    reviewedAt: new Date('2026-02-15T14:30:00Z'),
    createdAt: new Date('2026-02-12T11:00:00Z'),
    studentEmail: 'emeka.okonkwo@example.com',
    reviewerEmail: 'admin@doculet.ai',
    schoolName: 'Boston University',
    kycStatus: 'verified',
    bankStatus: 'verified',
  } satisfies OperationsQueueRow,

  rejectedRow: {
    id: 'doc-003',
    type: 'offer_letter',
    status: 'rejected',
    rejectionReason: 'Document appears to be altered. Please resubmit the original.',
    reviewedAt: new Date('2026-02-14T16:00:00Z'),
    createdAt: new Date('2026-02-11T08:00:00Z'),
    studentEmail: 'fatima.aliyu@example.com',
    reviewerEmail: 'admin@doculet.ai',
    schoolName: null,
    kycStatus: 'pending',
    bankStatus: 'not_started',
  } satisfies OperationsQueueRow,

  moreInfoRow: {
    id: 'doc-004',
    type: 'affidavit',
    status: 'more_info_requested',
    rejectionReason: 'Notarisation stamp is not clearly visible. Please resubmit.',
    reviewedAt: new Date('2026-02-16T10:00:00Z'),
    createdAt: new Date('2026-02-13T13:45:00Z'),
    studentEmail: 'chidi.nwosu@example.com',
    reviewerEmail: 'admin@doculet.ai',
    schoolName: 'Northeastern University',
    kycStatus: 'verified',
    bankStatus: 'not_started',
  } satisfies OperationsQueueRow,

  stats: {
    pending: 12,
    approved: 47,
    rejected: 8,
    moreInfoRequested: 3,
    approvedToday: 5,
    rejectedToday: 2,
  } satisfies OperationsStats,
};

export const adminOperationsQueue: OperationsQueueRow[] = [
  adminOperationsFixtures.pendingRow,
  adminOperationsFixtures.approvedRow,
  adminOperationsFixtures.rejectedRow,
  adminOperationsFixtures.moreInfoRow,
];
