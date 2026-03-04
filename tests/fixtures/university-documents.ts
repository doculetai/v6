import type { documents, users } from '@/db/schema';

export type DocumentFixture = typeof documents.$inferSelect & {
  user: typeof users.$inferSelect;
};

const studentUser: typeof users.$inferSelect = {
  id: '00000000-0000-0000-0000-000000000010',
  email: 'student@example.com',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

export const pendingBankStatement: DocumentFixture = {
  id: '00000000-0000-0000-0000-000000000001',
  userId: '00000000-0000-0000-0000-000000000010',
  type: 'bank_statement',
  storageUrl: 'https://example.com/documents/bank-statement.pdf',
  status: 'pending',
  rejectionReason: null,
  reviewedAt: null,
  reviewedBy: null,
  createdAt: new Date('2026-01-15T10:00:00Z'),
  updatedAt: new Date('2026-01-15T10:00:00Z'),
  user: studentUser,
};

export const approvedPassport: DocumentFixture = {
  id: '00000000-0000-0000-0000-000000000002',
  userId: '00000000-0000-0000-0000-000000000010',
  type: 'passport',
  storageUrl: 'https://example.com/documents/passport.pdf',
  status: 'approved',
  rejectionReason: null,
  reviewedAt: new Date('2026-01-16T14:00:00Z'),
  reviewedBy: '00000000-0000-0000-0000-000000000020',
  createdAt: new Date('2026-01-14T09:00:00Z'),
  updatedAt: new Date('2026-01-16T14:00:00Z'),
  user: studentUser,
};

export const rejectedOfferLetter: DocumentFixture = {
  id: '00000000-0000-0000-0000-000000000003',
  userId: '00000000-0000-0000-0000-000000000010',
  type: 'offer_letter',
  storageUrl: 'https://example.com/documents/offer-letter.pdf',
  status: 'rejected',
  rejectionReason: 'The offer letter provided is expired. Please upload a current letter.',
  reviewedAt: new Date('2026-01-17T11:30:00Z'),
  reviewedBy: '00000000-0000-0000-0000-000000000020',
  createdAt: new Date('2026-01-13T08:00:00Z'),
  updatedAt: new Date('2026-01-17T11:30:00Z'),
  user: studentUser,
};

export const moreInfoRequestedAffidavit: DocumentFixture = {
  id: '00000000-0000-0000-0000-000000000004',
  userId: '00000000-0000-0000-0000-000000000010',
  type: 'affidavit',
  storageUrl: 'https://example.com/documents/affidavit.pdf',
  status: 'more_info_requested',
  rejectionReason: 'Please provide a notarised copy of the affidavit.',
  reviewedAt: new Date('2026-01-18T09:00:00Z'),
  reviewedBy: '00000000-0000-0000-0000-000000000020',
  createdAt: new Date('2026-01-12T07:00:00Z'),
  updatedAt: new Date('2026-01-18T09:00:00Z'),
  user: studentUser,
};

export const allDocumentFixtures: DocumentFixture[] = [
  pendingBankStatement,
  approvedPassport,
  rejectedOfferLetter,
  moreInfoRequestedAffidavit,
];
