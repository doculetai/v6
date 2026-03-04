import { desc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { partnerStudents, schools, studentProfiles } from '@/db/schema';

export type PartnerStudentRow = {
  id: string;
  studentId: string;
  tier: number;
  verifiedAt: Date;
  schoolName: string | null;
};

export async function listPartnerStudents(
  db: DrizzleDB,
  partnerId: string,
): Promise<PartnerStudentRow[]> {
  return db
    .select({
      id: partnerStudents.id,
      studentId: partnerStudents.studentId,
      tier: partnerStudents.tier,
      verifiedAt: partnerStudents.verifiedAt,
      schoolName: schools.name,
    })
    .from(partnerStudents)
    .leftJoin(studentProfiles, eq(partnerStudents.studentId, studentProfiles.userId))
    .leftJoin(schools, eq(studentProfiles.schoolId, schools.id))
    .where(eq(partnerStudents.partnerId, partnerId))
    .orderBy(desc(partnerStudents.verifiedAt));
}
