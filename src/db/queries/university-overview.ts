import { count, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { programs, studentProfiles } from '@/db/schema/students';
import { universityProfiles } from '@/db/schema/university';

export type UniversityOverviewData = {
  totalPrograms: number;
  enrolledStudents: number;
  pendingApplications: number;
  totalStudents: number;
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
    return { totalPrograms: 0, enrolledStudents: 0, pendingApplications: 0, totalStudents: 0 };
  }

  const schoolId = uniProfile.schoolId;

  const [[{ totalPrograms }], [{ enrolledStudents }], [{ pendingApplications }]] =
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
    ]);

  return {
    totalPrograms,
    enrolledStudents,
    pendingApplications,
    totalStudents: enrolledStudents,
  };
}
