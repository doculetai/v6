import type { UniversityStudentRow, UniversityStudentMetrics } from '@/db/queries/university-students';

// ─── Student Rows ─────────────────────────────────────────

export const verifiedStudentFixture: UniversityStudentRow = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'ada.obi@student.example.com',
  kycStatus: 'verified',
  bankStatus: 'verified',
  tier: 3,
  amountKobo: 25_000_00, // ₦25,000.00
  submittedAt: '2026-01-15T09:00:00.000Z',
  schoolName: 'University of Lagos',
  programName: 'Computer Science',
};

export const pendingStudentFixture: UniversityStudentRow = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'emeka.chukwu@student.example.com',
  kycStatus: 'pending',
  bankStatus: 'not_started',
  tier: 1,
  amountKobo: 0,
  submittedAt: '2026-02-20T14:30:00.000Z',
  schoolName: 'Covenant University',
  programName: 'Business Administration',
};

export const notStartedStudentFixture: UniversityStudentRow = {
  id: '33333333-3333-3333-3333-333333333333',
  email: 'fatima.musa@student.example.com',
  kycStatus: 'not_started',
  bankStatus: 'not_started',
  tier: 0,
  amountKobo: 0,
  submittedAt: '2026-03-01T11:00:00.000Z',
  schoolName: null,
  programName: null,
};

export const failedStudentFixture: UniversityStudentRow = {
  id: '44444444-4444-4444-4444-444444444444',
  email: 'tunde.adesanya@student.example.com',
  kycStatus: 'failed',
  bankStatus: 'not_started',
  tier: 0,
  amountKobo: 0,
  submittedAt: '2026-02-10T08:45:00.000Z',
  schoolName: 'Obafemi Awolowo University',
  programName: 'Law',
};

export const tier2StudentFixture: UniversityStudentRow = {
  id: '55555555-5555-5555-5555-555555555555',
  email: 'ngozi.nwosu@student.example.com',
  kycStatus: 'verified',
  bankStatus: 'verified',
  tier: 2,
  amountKobo: 50_000_00, // ₦50,000.00
  submittedAt: '2026-01-28T16:00:00.000Z',
  schoolName: 'Ahmadu Bello University',
  programName: 'Medicine and Surgery',
};

/** Full fixture set covering all KYC states and tier levels. */
export const universityStudentsFixture: UniversityStudentRow[] = [
  verifiedStudentFixture,
  pendingStudentFixture,
  notStartedStudentFixture,
  failedStudentFixture,
  tier2StudentFixture,
];

// ─── Metrics ──────────────────────────────────────────────

export const universityStudentMetricsFixture: UniversityStudentMetrics = {
  total: 5,
  kycVerified: 2,
  kycPending: 2,  // pending + not_started
  kycFailed: 1,
};

/** Empty state: no students enrolled yet. */
export const emptyUniversityStudentsFixture: UniversityStudentRow[] = [];
