import type { UniversityProfileRow } from '@/db/queries/university-settings';

// ── Fixtures ──────────────────────────────────────────────────────────────────
// Typed to match the exact Drizzle $inferSelect shape of universityProfiles.
// Use these in unit tests — pass as arguments to pure query functions.

export const universityProfileFixture: UniversityProfileRow = {
  id: '00000000-0000-0000-0000-000000000001',
  userId: '00000000-0000-0000-0000-000000000002',
  institutionName: 'State University of New York',
  accreditationBody: 'MSCHE',
  contactEmail: 'admissions@suny.edu',
  contactPhone: '+1 (518) 000-0000',
  webhookUrl: 'https://admissions.suny.edu/webhooks/doculet',
  notifyOnSubmission: true,
  notifyOnApproval: true,
  notifyOnRejection: false,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-06-01T12:00:00.000Z'),
};

export const universityProfileMinimalFixture: UniversityProfileRow = {
  id: '00000000-0000-0000-0000-000000000003',
  userId: '00000000-0000-0000-0000-000000000004',
  institutionName: '',
  accreditationBody: null,
  contactEmail: null,
  contactPhone: null,
  webhookUrl: null,
  notifyOnSubmission: true,
  notifyOnApproval: true,
  notifyOnRejection: true,
  createdAt: new Date('2025-03-01T00:00:00.000Z'),
  updatedAt: new Date('2025-03-01T00:00:00.000Z'),
};

// ── Derived shapes (for tRPC output layer) ────────────────────────────────────

export const universitySettingsResponseFixture = {
  profile: {
    institutionName: universityProfileFixture.institutionName,
    accreditationBody: universityProfileFixture.accreditationBody,
    contactEmail: universityProfileFixture.contactEmail,
    contactPhone: universityProfileFixture.contactPhone,
    webhookUrl: universityProfileFixture.webhookUrl,
    notifyOnSubmission: universityProfileFixture.notifyOnSubmission,
    notifyOnApproval: universityProfileFixture.notifyOnApproval,
    notifyOnRejection: universityProfileFixture.notifyOnRejection,
  },
  session: {
    id: 'abc123xyz456efgh',
    email: 'admissions@suny.edu',
    lastSignedInAt: '2026-03-04T08:00:00.000Z',
  },
} as const;
