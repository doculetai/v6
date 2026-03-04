import { and, eq, inArray } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { sponsorships, studentProfiles } from '@/db/schema';

// ─── Types ────────────────────────────────────────────────

export type UniversityStudentRow = {
  /** studentProfiles.userId — used as the DataTableShell row id */
  id: string;
  email: string;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  bankStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  /**
   * Highest verified KYC tier (1–3). 0 = no verified tier yet.
   * Tier 1 = identity, Tier 2 = + bank, Tier 3 = + sponsor + admin review.
   */
  tier: number;
  /** Sum of amountKobo across active sponsorships for this student. */
  amountKobo: number;
  /** ISO string of studentProfiles.createdAt */
  submittedAt: string;
  schoolName: string | null;
  programName: string | null;
};

export type UniversityStudentMetrics = {
  total: number;
  kycVerified: number;
  kycPending: number;
  kycFailed: number;
};

// ─── Helpers ──────────────────────────────────────────────

function computeMaxVerifiedTier(
  verifications: Array<{ status: string; tier: number }>,
): number {
  return verifications.reduce(
    (max, v) => (v.status === 'verified' ? Math.max(max, v.tier) : max),
    0,
  );
}

// ─── Queries ──────────────────────────────────────────────

/**
 * Returns all student profiles with joined user, school, program, and KYC
 * verification data, enriched with aggregated sponsorship amounts.
 *
 * NOTE: Currently returns ALL students in the system. Once a
 * `university_profiles` table is added to link university accounts to
 * specific schools, filter by `schoolId` here.
 */
export async function getUniversityStudents(
  db: DrizzleDB,
): Promise<UniversityStudentRow[]> {
  const profiles = await db.query.studentProfiles.findMany({
    with: {
      user: true,
      school: true,
      program: true,
      kycVerifications: true,
    },
  });

  if (profiles.length === 0) {
    return [];
  }

  const userIds = profiles.map((p) => p.userId);

  const activeSponsorships = await db
    .select({
      studentId: sponsorships.studentId,
      amountKobo: sponsorships.amountKobo,
    })
    .from(sponsorships)
    .where(
      and(
        inArray(sponsorships.studentId, userIds),
        eq(sponsorships.status, 'active'),
      ),
    );

  const amountByStudent = activeSponsorships.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.studentId] = (acc[s.studentId] ?? 0) + s.amountKobo;
      return acc;
    },
    {},
  );

  return profiles.map((p) => ({
    id: p.userId,
    email: p.user.email,
    kycStatus: p.kycStatus,
    bankStatus: p.bankStatus,
    tier: computeMaxVerifiedTier(p.kycVerifications),
    amountKobo: amountByStudent[p.userId] ?? 0,
    submittedAt: p.createdAt.toISOString(),
    schoolName: p.school?.name ?? null,
    programName: p.program?.name ?? null,
  }));
}

/**
 * Returns aggregate counts used by the metrics row.
 *
 * NOTE: Same scoping caveat as getUniversityStudents.
 */
export async function getUniversityStudentMetrics(
  db: DrizzleDB,
): Promise<UniversityStudentMetrics> {
  const rows = await db
    .select({ kycStatus: studentProfiles.kycStatus })
    .from(studentProfiles);

  return {
    total: rows.length,
    kycVerified: rows.filter((r) => r.kycStatus === 'verified').length,
    kycPending: rows.filter(
      (r) => r.kycStatus === 'pending' || r.kycStatus === 'not_started',
    ).length,
    kycFailed: rows.filter((r) => r.kycStatus === 'failed').length,
  };
}
