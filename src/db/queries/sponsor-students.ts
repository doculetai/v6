import { and, desc, eq, ne } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { programs, schools, sponsorships, studentProfiles, users } from '@/db/schema';

type SponsorshipStatus = (typeof sponsorships.$inferSelect)['status'];
type StudentKycStatus = (typeof studentProfiles.$inferSelect)['kycStatus'];
type StudentBankStatus = (typeof studentProfiles.$inferSelect)['bankStatus'];

export type SponsorStudentStatus = 'pending' | 'active' | 'completed';
export type SponsorStudentTier = 1 | 2 | 3;

export type SponsorStudentQueryRow = {
  sponsorshipId: string;
  studentId: string;
  studentEmail: string;
  amountKobo: number;
  currency: string;
  sponsorshipStatus: SponsorshipStatus;
  kycStatus: StudentKycStatus | null;
  bankStatus: StudentBankStatus | null;
  schoolName: string | null;
  programName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SponsorStudent = {
  sponsorshipId: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  studentInitials: string;
  universityName: string;
  programName: string;
  fundingAmountKobo: number;
  currency: string;
  tier: SponsorStudentTier;
  status: SponsorStudentStatus;
  updatedAt: Date;
};

const DEFAULT_UNIVERSITY_NAME = 'University pending';
const DEFAULT_PROGRAM_NAME = 'Program pending';

export function normalizeSponsorshipStatus(status: SponsorshipStatus): SponsorStudentStatus {
  if (status === 'active' || status === 'completed' || status === 'pending') {
    return status;
  }

  return 'pending';
}

export function deriveSponsorTier({
  kycStatus,
  bankStatus,
  sponsorshipStatus,
}: {
  kycStatus: StudentKycStatus | null;
  bankStatus: StudentBankStatus | null;
  sponsorshipStatus: SponsorshipStatus;
}): SponsorStudentTier {
  const hasIdentityTier = kycStatus === 'verified';
  const hasBankTier = hasIdentityTier && bankStatus === 'verified';
  const hasSponsorTier =
    hasBankTier && (sponsorshipStatus === 'active' || sponsorshipStatus === 'completed');

  if (hasSponsorTier) {
    return 3;
  }

  if (hasBankTier) {
    return 2;
  }

  return 1;
}

function emailToDisplayName(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const cleanedLocalPart = localPart.replace(/\+.*$/, '').replace(/[._-]+/g, ' ').trim();

  if (!cleanedLocalPart) {
    return email;
  }

  return cleanedLocalPart
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1).toLowerCase()}`)
    .join(' ');
}

function displayNameToInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? '');
  return initials.join('') || 'ST';
}

export function toSponsorStudent(row: SponsorStudentQueryRow): SponsorStudent {
  const studentName = emailToDisplayName(row.studentEmail);

  return {
    sponsorshipId: row.sponsorshipId,
    studentId: row.studentId,
    studentEmail: row.studentEmail,
    studentName,
    studentInitials: displayNameToInitials(studentName),
    universityName: row.schoolName ?? DEFAULT_UNIVERSITY_NAME,
    programName: row.programName ?? DEFAULT_PROGRAM_NAME,
    fundingAmountKobo: row.amountKobo,
    currency: row.currency,
    tier: deriveSponsorTier({
      kycStatus: row.kycStatus,
      bankStatus: row.bankStatus,
      sponsorshipStatus: row.sponsorshipStatus,
    }),
    status: normalizeSponsorshipStatus(row.sponsorshipStatus),
    updatedAt: row.updatedAt,
  };
}

async function getSponsorStudentRowBySponsorshipId({
  db,
  sponsorshipId,
  sponsorId,
}: {
  db: DrizzleDB;
  sponsorshipId: string;
  sponsorId: string;
}): Promise<SponsorStudentQueryRow | null> {
  const rows = await db
    .select({
      sponsorshipId: sponsorships.id,
      studentId: users.id,
      studentEmail: users.email,
      amountKobo: sponsorships.amountKobo,
      currency: sponsorships.currency,
      sponsorshipStatus: sponsorships.status,
      kycStatus: studentProfiles.kycStatus,
      bankStatus: studentProfiles.bankStatus,
      schoolName: schools.name,
      programName: programs.name,
      createdAt: sponsorships.createdAt,
      updatedAt: sponsorships.updatedAt,
    })
    .from(sponsorships)
    .innerJoin(users, eq(users.id, sponsorships.studentId))
    .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
    .leftJoin(programs, eq(programs.id, studentProfiles.programId))
    .leftJoin(schools, eq(schools.id, studentProfiles.schoolId))
    .where(and(eq(sponsorships.id, sponsorshipId), eq(sponsorships.sponsorId, sponsorId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getSponsorStudents({
  db,
  sponsorId,
}: {
  db: DrizzleDB;
  sponsorId: string;
}): Promise<SponsorStudent[]> {
  const rows = await db
    .select({
      sponsorshipId: sponsorships.id,
      studentId: users.id,
      studentEmail: users.email,
      amountKobo: sponsorships.amountKobo,
      currency: sponsorships.currency,
      sponsorshipStatus: sponsorships.status,
      kycStatus: studentProfiles.kycStatus,
      bankStatus: studentProfiles.bankStatus,
      schoolName: schools.name,
      programName: programs.name,
      createdAt: sponsorships.createdAt,
      updatedAt: sponsorships.updatedAt,
    })
    .from(sponsorships)
    .innerJoin(users, eq(users.id, sponsorships.studentId))
    .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
    .leftJoin(programs, eq(programs.id, studentProfiles.programId))
    .leftJoin(schools, eq(schools.id, studentProfiles.schoolId))
    .where(and(eq(sponsorships.sponsorId, sponsorId), ne(sponsorships.status, 'cancelled')))
    .orderBy(desc(sponsorships.updatedAt));

  return rows.map(toSponsorStudent);
}

export async function linkSponsorStudent({
  db,
  sponsorId,
  studentEmail,
  amountKobo,
  currency,
}: {
  db: DrizzleDB;
  sponsorId: string;
  studentEmail: string;
  amountKobo: number;
  currency: string;
}): Promise<SponsorStudent | null> {
  const normalizedEmail = studentEmail.trim().toLowerCase();

  const student = await db.query.users.findFirst({
    where: (table) => eq(table.email, normalizedEmail),
  });

  if (!student) {
    return null;
  }

  const studentProfile = await db.query.profiles.findFirst({
    where: (table) => and(eq(table.userId, student.id), eq(table.role, 'student')),
  });

  if (!studentProfile) {
    return null;
  }

  const existingLink = await db.query.sponsorships.findFirst({
    where: (table) => and(eq(table.sponsorId, sponsorId), eq(table.studentId, student.id)),
  });

  let sponsorshipId = existingLink?.id ?? null;

  if (existingLink) {
    await db
      .update(sponsorships)
      .set({
        amountKobo,
        currency,
        status: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(sponsorships.id, existingLink.id));
  } else {
    const createdLinks = await db
      .insert(sponsorships)
      .values({
        sponsorId,
        studentId: student.id,
        amountKobo,
        currency,
        status: 'pending',
      })
      .returning({ id: sponsorships.id });

    sponsorshipId = createdLinks[0]?.id ?? null;
  }

  if (!sponsorshipId) {
    return null;
  }

  const row = await getSponsorStudentRowBySponsorshipId({ db, sponsorshipId, sponsorId });
  return row ? toSponsorStudent(row) : null;
}

export async function removeSponsorStudentLink({
  db,
  sponsorId,
  sponsorshipId,
}: {
  db: DrizzleDB;
  sponsorId: string;
  sponsorshipId: string;
}): Promise<boolean> {
  const deletedRows = await db
    .delete(sponsorships)
    .where(and(eq(sponsorships.id, sponsorshipId), eq(sponsorships.sponsorId, sponsorId)))
    .returning({ id: sponsorships.id });

  return deletedRows.length > 0;
}
