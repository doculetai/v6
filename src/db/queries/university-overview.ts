import { and, count, desc, eq, gte, or } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { documents } from '@/db/schema/documents';
import { profiles } from '@/db/schema/users';

/**
 * Returns the start of today in WAT (UTC+1) as a UTC Date.
 * Assumes documents.reviewedAt was inserted without an explicit timezone offset
 * (timezone-naive Postgres timestamp), meaning it stores UTC wall-clock time.
 * This boundary must be compared against reviewedAt UTC values consistently.
 */
function startOfDayWAT(): Date {
  const watOffsetMs = 60 * 60 * 1000; // WAT = UTC+1
  const watNow = new Date(Date.now() + watOffsetMs);
  watNow.setUTCHours(0, 0, 0, 0);
  return new Date(watNow.getTime() - watOffsetMs);
}

export type RecentDocumentItem = {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  type: 'passport' | 'bank_statement' | 'offer_letter' | 'affidavit' | 'cac';
  createdAt: string;
};

export type UniversityOverviewData = {
  pendingCount: number;
  approvedTodayCount: number;
  flaggedCount: number;
  totalStudents: number;
  recentActivity: RecentDocumentItem[];
};

/**
 * Returns aggregate overview data for the university dashboard.
 *
 * MVP scope: queries are global (all universities). Scoping to a specific
 * university requires a universityProfiles table with a schoolId FK — that
 * schema addition is tracked separately and will unlock per-university filtering.
 */
export async function getUniversityOverview(db: DrizzleDB): Promise<UniversityOverviewData> {
  const todayStart = startOfDayWAT();

  const [
    [{ pendingCount }],
    [{ approvedTodayCount }],
    [{ flaggedCount }],
    [{ totalStudents }],
    recentDocs,
  ] = await Promise.all([
    db
      .select({ pendingCount: count() })
      .from(documents)
      .where(eq(documents.status, 'pending')),

    db
      .select({ approvedTodayCount: count() })
      .from(documents)
      .where(
        and(
          eq(documents.status, 'approved'),
          gte(documents.reviewedAt, todayStart),
        ),
      ),

    db
      .select({ flaggedCount: count() })
      .from(documents)
      .where(
        or(
          eq(documents.status, 'rejected'),
          eq(documents.status, 'more_info_requested'),
        ),
      ),

    db
      .select({ totalStudents: count() })
      .from(profiles)
      .where(eq(profiles.role, 'student')),

    db
      .select({
        id: documents.id,
        status: documents.status,
        type: documents.type,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(10),
  ]);

  const recentActivity: RecentDocumentItem[] = recentDocs.map((doc) => ({
    id: doc.id,
    status: doc.status,
    type: doc.type,
    createdAt: doc.createdAt.toISOString(),
  }));

  return {
    pendingCount,
    approvedTodayCount,
    flaggedCount,
    totalStudents,
    recentActivity,
  };
}
