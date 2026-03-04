import { and, count, desc, eq, gte, inArray, isNotNull, sum } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import {
  certificates,
  documents,
  profiles,
  schools,
  sponsorships,
  studentProfiles,
  users,
} from '@/db/schema';

export interface AnalyticsPeriodPoint {
  period: string;
  label: string;
  count: number;
}

export interface TopUniversity {
  id: string;
  name: string;
  studentCount: number;
}

export interface BreakdownItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AdminAnalyticsData {
  overviewStats: {
    totalUsers: number;
    activeStudents: number;
    pendingDocuments: number;
    certificatesIssued: number;
    revenueThisMonthKobo: number;
    flaggedItems: number;
  };
  applicationsByWeek: AnalyticsPeriodPoint[];
  applicationsByMonth: AnalyticsPeriodPoint[];
  approvalRate: number;
  avgReviewTimeHours: number;
  topUniversities: TopUniversity[];
  fundingBreakdown: BreakdownItem[];
  documentStatusBreakdown: BreakdownItem[];
  updatedAt: string;
}

function getStartOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getSixMonthsAgo(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function buildWeeklyBuckets(dates: Date[], weeksBack = 8): AnalyticsPeriodPoint[] {
  const now = new Date();
  const buckets = new Map<string, AnalyticsPeriodPoint>();

  for (let i = weeksBack - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = getISOWeekKey(d);
    if (!buckets.has(key)) {
      const weekNum = key.split('-W')[1];
      buckets.set(key, { period: key, label: `W${weekNum}`, count: 0 });
    }
  }

  for (const date of dates) {
    const key = getISOWeekKey(date);
    const bucket = buckets.get(key);
    if (bucket) bucket.count++;
  }

  return Array.from(buckets.values());
}

function buildMonthlyBuckets(dates: Date[], monthsBack = 6): AnalyticsPeriodPoint[] {
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const buckets = new Map<string, AnalyticsPeriodPoint>();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = getMonthKey(d);
    if (!buckets.has(key)) {
      buckets.set(key, { period: key, label: monthNames[d.getMonth()] ?? key, count: 0 });
    }
  }

  for (const date of dates) {
    const key = getMonthKey(date);
    const bucket = buckets.get(key);
    if (bucket) bucket.count++;
  }

  return Array.from(buckets.values());
}

export async function getAdminAnalytics(db: DrizzleDB): Promise<AdminAnalyticsData> {
  const startOfMonth = getStartOfMonth();
  const sixMonthsAgo = getSixMonthsAgo();

  const [
    totalUsersResult,
    activeStudentsResult,
    pendingDocsResult,
    certificatesResult,
    revenueResult,
    flaggedResult,
    recentProfileDates,
    reviewedDocsResult,
    approvalStatsResult,
    schoolStatsResult,
    fundingStatsResult,
    docStatusResult,
  ] = await Promise.all([
    db.select({ cnt: count() }).from(users),
    db.select({ cnt: count() }).from(profiles).where(eq(profiles.role, 'student')),
    db.select({ cnt: count() }).from(documents).where(eq(documents.status, 'pending')),
    db.select({ cnt: count() }).from(certificates),
    db
      .select({ total: sum(sponsorships.amountKobo) })
      .from(sponsorships)
      .where(and(eq(sponsorships.status, 'active'), gte(sponsorships.createdAt, startOfMonth))),
    db
      .select({ cnt: count() })
      .from(documents)
      .where(eq(documents.status, 'more_info_requested')),
    db
      .select({ createdAt: profiles.createdAt })
      .from(profiles)
      .where(gte(profiles.createdAt, sixMonthsAgo)),
    db
      .select({ createdAt: documents.createdAt, reviewedAt: documents.reviewedAt })
      .from(documents)
      .where(and(isNotNull(documents.reviewedAt), gte(documents.reviewedAt, sixMonthsAgo))),
    db
      .select({ status: documents.status, cnt: count() })
      .from(documents)
      .where(inArray(documents.status, ['approved', 'rejected']))
      .groupBy(documents.status),
    db
      .select({
        schoolId: studentProfiles.schoolId,
        schoolName: schools.name,
        studentCount: count(),
      })
      .from(studentProfiles)
      .leftJoin(schools, eq(studentProfiles.schoolId, schools.id))
      .where(isNotNull(studentProfiles.schoolId))
      .groupBy(studentProfiles.schoolId, schools.name)
      .orderBy(desc(count()))
      .limit(5),
    db
      .select({ fundingType: studentProfiles.fundingType, cnt: count() })
      .from(studentProfiles)
      .where(isNotNull(studentProfiles.fundingType))
      .groupBy(studentProfiles.fundingType),
    db
      .select({ status: documents.status, cnt: count() })
      .from(documents)
      .groupBy(documents.status),
  ]);

  const profileDates = recentProfileDates.map((r) => new Date(r.createdAt));
  const applicationsByWeek = buildWeeklyBuckets(profileDates, 8);
  const applicationsByMonth = buildMonthlyBuckets(profileDates, 6);

  let approvedCount = 0;
  let rejectedCount = 0;
  for (const row of approvalStatsResult) {
    if (row.status === 'approved') approvedCount = row.cnt;
    if (row.status === 'rejected') rejectedCount = row.cnt;
  }
  const totalReviewed = approvedCount + rejectedCount;
  const approvalRate =
    totalReviewed > 0 ? Math.round((approvedCount / totalReviewed) * 1000) / 10 : 0;

  let totalMs = 0;
  for (const doc of reviewedDocsResult) {
    if (doc.reviewedAt) {
      totalMs += new Date(doc.reviewedAt).getTime() - new Date(doc.createdAt).getTime();
    }
  }
  const avgReviewTimeHours =
    reviewedDocsResult.length > 0
      ? Math.round((totalMs / reviewedDocsResult.length / 3_600_000) * 10) / 10
      : 0;

  const topUniversities = schoolStatsResult.map((s) => ({
    id: s.schoolId!,
    name: s.schoolName ?? 'Unknown',
    studentCount: s.studentCount,
  }));

  const fundingTotal = fundingStatsResult.reduce((acc, r) => acc + r.cnt, 0);
  const fundingBreakdown: BreakdownItem[] = fundingStatsResult.map((r) => ({
    key: r.fundingType,
    label: r.fundingType,
    count: r.cnt,
    percentage: fundingTotal > 0 ? Math.round((r.cnt / fundingTotal) * 100) : 0,
  }));

  const docTotal = docStatusResult.reduce((acc, r) => acc + r.cnt, 0);
  const documentStatusBreakdown: BreakdownItem[] = docStatusResult.map((r) => ({
    key: r.status,
    label: r.status,
    count: r.cnt,
    percentage: docTotal > 0 ? Math.round((r.cnt / docTotal) * 100) : 0,
  }));

  return {
    overviewStats: {
      totalUsers: totalUsersResult[0]?.cnt ?? 0,
      activeStudents: activeStudentsResult[0]?.cnt ?? 0,
      pendingDocuments: pendingDocsResult[0]?.cnt ?? 0,
      certificatesIssued: certificatesResult[0]?.cnt ?? 0,
      revenueThisMonthKobo: Number(revenueResult[0]?.total ?? 0),
      flaggedItems: flaggedResult[0]?.cnt ?? 0,
    },
    applicationsByWeek,
    applicationsByMonth,
    approvalRate,
    avgReviewTimeHours,
    topUniversities,
    fundingBreakdown,
    documentStatusBreakdown,
    updatedAt: new Date().toISOString(),
  };
}
