import { and, avg, count, eq, sql } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { certificates, programs, studentProfiles, universityProfiles } from '@/db/schema';

export type UniversityOverviewData = {
  totalPrograms: number;
  enrolledStudents: number;
  pendingApplications: number;
  totalStudents: number;
  certsIssued: number;
  avgProofTargetKobo: number;
  programs: Array<{
    id: string;
    name: string;
    enrolledCount: number;
    certsIssued: number;
    tuitionAmount: number;
  }>;
};

export async function getUniversityOverview(
  db: DrizzleDB,
  userId: string,
): Promise<UniversityOverviewData> {
  const uniProfile = await db.query.universityProfiles.findFirst({
    where: (t, { eq: eqFn }) => eqFn(t.userId, userId),
    columns: { schoolId: true },
  });

  if (!uniProfile?.schoolId) {
    return {
      totalPrograms: 0,
      enrolledStudents: 0,
      pendingApplications: 0,
      totalStudents: 0,
      certsIssued: 0,
      avgProofTargetKobo: 0,
      programs: [],
    };
  }

  const schoolId = uniProfile.schoolId;

  const [[{ totalPrograms }], [{ enrolledStudents }], [{ pendingApplications }], [{ certsIssued }], programRows, [avgRow]] =
    await Promise.all([
      db
        .select({ totalPrograms: count() })
        .from(programs)
        .where(eq(programs.schoolId, schoolId)),

      db
        .select({ enrolledStudents: count() })
        .from(studentProfiles)
        .where(eq(studentProfiles.schoolId, schoolId)),

      db
        .select({ pendingApplications: count() })
        .from(studentProfiles)
        .where(eq(studentProfiles.schoolId, schoolId)),

      db
        .select({ certsIssued: sql<number>`count(distinct ${certificates.studentId})::int` })
        .from(certificates)
        .innerJoin(studentProfiles, eq(certificates.studentId, studentProfiles.userId))
        .where(and(eq(studentProfiles.schoolId, schoolId), eq(certificates.status, 'active'))),

      db
        .select({
          id: programs.id,
          name: programs.name,
          tuitionAmount: programs.tuitionAmount,
          enrolledCount: sql<number>`count(distinct ${studentProfiles.userId})::int`,
          certsIssued: sql<number>`count(distinct ${certificates.studentId})::int`,
        })
        .from(programs)
        .leftJoin(studentProfiles, eq(studentProfiles.programId, programs.id))
        .leftJoin(
          certificates,
          and(eq(certificates.studentId, studentProfiles.userId), eq(certificates.status, 'active')),
        )
        .where(eq(programs.schoolId, schoolId))
        .groupBy(programs.id, programs.name, programs.tuitionAmount)
        .orderBy(programs.name),

      db
        .select({ avgKobo: avg(programs.tuitionAmount) })
        .from(programs)
        .where(and(eq(programs.schoolId, schoolId), eq(programs.status, 'active'))),
    ]);

  return {
    totalPrograms,
    enrolledStudents,
    pendingApplications,
    totalStudents: enrolledStudents,
    certsIssued,
    avgProofTargetKobo: avgRow?.avgKobo ? Math.round(Number(avgRow.avgKobo)) : 0,
    programs: programRows.map((p) => ({
      id: p.id,
      name: p.name,
      enrolledCount: p.enrolledCount,
      certsIssued: p.certsIssued,
      tuitionAmount: p.tuitionAmount,
    })),
  };
}
