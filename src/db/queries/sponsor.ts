import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import {
  certificates,
  disbursements,
  schools,
  sponsorProfiles,
  sponsorships,
  studentProfiles,
  users,
} from '@/db/schema';

type SponsorKycStatus = (typeof sponsorProfiles.$inferSelect)['kycStatus'];
type DisbursementStatus = (typeof disbursements.$inferSelect)['status'];
type SponsorshipStatus = (typeof sponsorships.$inferSelect)['status'];

type StudentVerificationProfile = {
  kycStatus: (typeof studentProfiles.$inferSelect)['kycStatus'];
  bankStatus: (typeof studentProfiles.$inferSelect)['bankStatus'];
};

export type SponsorActivityTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type SponsorWorkflowStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'certificate_issued'
  | 'rejected'
  | 'action_required'
  | 'expired';

export type SponsorDashboardStats = {
  totalFundedKobo: number;
  activeStudents: number;
  pendingDisbursements: number;
  kycTier: 1 | 2 | 3;
};

export type SponsorActivityEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: SponsorActivityTone;
};

export type LinkedStudentSummary = {
  id: string;
  name: string;
  universityName: string | null;
  tier: 1 | 2 | 3;
  status: SponsorWorkflowStatus;
};

function toSafeNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return 0;
}

function toIsoString(timestamp: Date | null): string | null {
  return timestamp ? timestamp.toISOString() : null;
}

function emailToDisplayName(email: string): string {
  const [localPart = 'student'] = email.split('@');
  const normalized = localPart.replace(/[._-]+/g, ' ').replace(/\d+/g, ' ').trim();
  if (!normalized) return 'Student';

  return normalized
    .split(' ')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(' ');
}

function getDisbursementEventTitle(status: DisbursementStatus): string {
  if (status === 'disbursed') return 'Disbursement sent';
  if (status === 'failed') return 'Disbursement failed';
  if (status === 'processing') return 'Disbursement processing';
  return 'Disbursement scheduled';
}

function getKycEventTitle(status: SponsorKycStatus): string {
  if (status === 'verified') return 'KYC tier completed';
  if (status === 'pending') return 'KYC submitted for review';
  if (status === 'failed') return 'KYC needs attention';
  return 'KYC not started';
}

function getKycEventDescription(status: SponsorKycStatus): string {
  if (status === 'verified') return 'Identity checks passed and your sponsor profile is trusted.';
  if (status === 'pending') return 'We are validating your identity documents.';
  if (status === 'failed') return 'Please update your verification details to continue funding.';
  return 'Complete your KYC to unlock higher funding confidence.';
}

function getSponsorshipEventDescription(status: SponsorshipStatus): string {
  if (status === 'active') return 'Student funding relationship is active.';
  if (status === 'completed') return 'Funding journey has been completed.';
  if (status === 'cancelled') return 'Funding relationship was cancelled.';
  return 'Pending sponsor confirmation.';
}

function getStudentTierFromVerification(
  profile: StudentVerificationProfile | undefined,
  sponsorshipStatus: SponsorshipStatus,
): 1 | 2 | 3 {
  if (!profile || profile.kycStatus !== 'verified' || profile.bankStatus !== 'verified') return 1;
  if (sponsorshipStatus === 'active' || sponsorshipStatus === 'completed') return 3;
  return 2;
}

export function getKycTierFromSponsorStatus(status: SponsorKycStatus): 1 | 2 | 3 {
  if (status === 'verified') return 3;
  if (status === 'pending') return 2;
  return 1;
}

export function getActivityToneFromDisbursementStatus(
  status: DisbursementStatus,
): SponsorActivityTone {
  if (status === 'disbursed') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'processing') return 'info';
  return 'neutral';
}

export function deriveStudentFundingStatus(
  sponsorshipStatus: SponsorshipStatus,
  hasCertificate: boolean,
): SponsorWorkflowStatus {
  if (hasCertificate) return 'certificate_issued';
  if (sponsorshipStatus === 'completed') return 'approved';
  if (sponsorshipStatus === 'active') return 'under_review';
  if (sponsorshipStatus === 'cancelled') return 'rejected';
  return 'submitted';
}

export async function getSponsorDashboardStats(
  db: DrizzleDB,
  sponsorId: string,
): Promise<SponsorDashboardStats> {
  const [fundedRow, activeStudentsRow, pendingDisbursementsRow, sponsorProfile] = await Promise.all([
    db
      .select({ totalFundedKobo: sql<number>`coalesce(sum(${disbursements.amountKobo}), 0)` })
      .from(disbursements)
      .innerJoin(sponsorships, eq(disbursements.sponsorshipId, sponsorships.id))
      .where(and(eq(sponsorships.sponsorId, sponsorId), eq(disbursements.status, 'disbursed')))
      .limit(1),
    db
      .select({ activeStudents: sql<number>`count(distinct ${sponsorships.studentId})` })
      .from(sponsorships)
      .where(and(eq(sponsorships.sponsorId, sponsorId), eq(sponsorships.status, 'active')))
      .limit(1),
    db
      .select({ pendingDisbursements: sql<number>`count(*)` })
      .from(disbursements)
      .innerJoin(sponsorships, eq(disbursements.sponsorshipId, sponsorships.id))
      .where(
        and(
          eq(sponsorships.sponsorId, sponsorId),
          inArray(disbursements.status, ['scheduled', 'processing']),
        ),
      )
      .limit(1),
    db.query.sponsorProfiles.findFirst({ where: (table, { eq: isEqual }) => isEqual(table.userId, sponsorId) }),
  ]);

  return {
    totalFundedKobo: toSafeNumber(fundedRow[0]?.totalFundedKobo),
    activeStudents: toSafeNumber(activeStudentsRow[0]?.activeStudents),
    pendingDisbursements: toSafeNumber(pendingDisbursementsRow[0]?.pendingDisbursements),
    kycTier: getKycTierFromSponsorStatus(sponsorProfile?.kycStatus ?? 'not_started'),
  };
}

export async function getSponsorRecentActivity(
  db: DrizzleDB,
  sponsorId: string,
  limit = 10,
): Promise<SponsorActivityEvent[]> {
  const safeLimit = Math.max(1, Math.min(limit, 20));

  const [disbursementRows, sponsorshipRows, sponsorProfile] = await Promise.all([
    db
      .select({
        id: disbursements.id,
        status: disbursements.status,
        amountKobo: disbursements.amountKobo,
        studentEmail: users.email,
        disbursedAt: disbursements.disbursedAt,
        updatedAt: disbursements.updatedAt,
      })
      .from(disbursements)
      .innerJoin(sponsorships, eq(disbursements.sponsorshipId, sponsorships.id))
      .innerJoin(users, eq(sponsorships.studentId, users.id))
      .where(eq(sponsorships.sponsorId, sponsorId))
      .orderBy(desc(disbursements.updatedAt))
      .limit(safeLimit),
    db
      .select({
        id: sponsorships.id,
        status: sponsorships.status,
        studentEmail: users.email,
        createdAt: sponsorships.createdAt,
      })
      .from(sponsorships)
      .innerJoin(users, eq(sponsorships.studentId, users.id))
      .where(eq(sponsorships.sponsorId, sponsorId))
      .orderBy(desc(sponsorships.createdAt))
      .limit(safeLimit),
    db.query.sponsorProfiles.findFirst({ where: (table, { eq: isEqual }) => isEqual(table.userId, sponsorId) }),
  ]);

  const disbursementEvents: SponsorActivityEvent[] = disbursementRows
    .map((row) => {
      const timestamp = toIsoString(row.disbursedAt ?? row.updatedAt);
      if (!timestamp) return null;

      return {
        id: `disbursement-${row.id}`,
        title: getDisbursementEventTitle(row.status),
        description: `${emailToDisplayName(row.studentEmail)} · ₦${new Intl.NumberFormat('en-NG').format(row.amountKobo / 100)}`,
        timestamp,
        tone: getActivityToneFromDisbursementStatus(row.status),
      };
    })
    .filter((event): event is SponsorActivityEvent => Boolean(event));

  const sponsorshipEvents: SponsorActivityEvent[] = sponsorshipRows.map((row) => ({
    id: `sponsorship-${row.id}`,
    title: `Student linked: ${emailToDisplayName(row.studentEmail)}`,
    description: getSponsorshipEventDescription(row.status),
    timestamp: row.createdAt.toISOString(),
    tone: row.status === 'cancelled' ? 'warning' : 'info',
  }));

  const kycEvents: SponsorActivityEvent[] =
    sponsorProfile?.updatedAt instanceof Date
      ? [
          {
            id: `kyc-${sponsorProfile.id}`,
            title: getKycEventTitle(sponsorProfile.kycStatus),
            description: getKycEventDescription(sponsorProfile.kycStatus),
            timestamp: sponsorProfile.updatedAt.toISOString(),
            tone:
              sponsorProfile.kycStatus === 'verified'
                ? 'success'
                : sponsorProfile.kycStatus === 'failed'
                  ? 'warning'
                  : 'neutral',
          },
        ]
      : [];

  return [...disbursementEvents, ...sponsorshipEvents, ...kycEvents]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, safeLimit);
}

export async function getSponsorLinkedStudents(
  db: DrizzleDB,
  sponsorId: string,
  limit = 10,
): Promise<LinkedStudentSummary[]> {
  const safeLimit = Math.max(1, Math.min(limit, 20));

  const sponsorshipRows = await db
    .select({
      id: sponsorships.id,
      studentId: sponsorships.studentId,
      status: sponsorships.status,
      updatedAt: sponsorships.updatedAt,
      studentEmail: users.email,
    })
    .from(sponsorships)
    .innerJoin(users, eq(sponsorships.studentId, users.id))
    .where(eq(sponsorships.sponsorId, sponsorId))
    .orderBy(desc(sponsorships.updatedAt))
    .limit(safeLimit * 3);

  if (sponsorshipRows.length === 0) return [];

  const uniqueByStudent = new Map<string, (typeof sponsorshipRows)[number]>();
  for (const row of sponsorshipRows) {
    if (!uniqueByStudent.has(row.studentId)) uniqueByStudent.set(row.studentId, row);
    if (uniqueByStudent.size >= safeLimit) break;
  }

  const selectedRows = [...uniqueByStudent.values()];
  const studentIds = selectedRows.map((row) => row.studentId);
  const sponsorshipIds = selectedRows.map((row) => row.id);

  const [studentProfileRows, certificateRows] = await Promise.all([
    db
      .select({
        userId: studentProfiles.userId,
        universityName: schools.name,
        kycStatus: studentProfiles.kycStatus,
        bankStatus: studentProfiles.bankStatus,
      })
      .from(studentProfiles)
      .leftJoin(schools, eq(studentProfiles.schoolId, schools.id))
      .where(inArray(studentProfiles.userId, studentIds)),
    db
      .select({ sponsorshipId: certificates.sponsorshipId })
      .from(certificates)
      .where(
        and(
          inArray(certificates.sponsorshipId, sponsorshipIds),
          eq(certificates.status, 'active'),
        ),
      ),
  ]);

  const profileMap = new Map(studentProfileRows.map((row) => [row.userId, row]));
  const certificateSponsorshipIds = new Set(
    certificateRows
      .map((row) => row.sponsorshipId)
      .filter((value): value is string => typeof value === 'string'),
  );

  return selectedRows.map((row) => {
    const studentProfile = profileMap.get(row.studentId);
    const hasCertificate = certificateSponsorshipIds.has(row.id);

    return {
      id: row.studentId,
      name: emailToDisplayName(row.studentEmail),
      universityName: studentProfile?.universityName ?? null,
      tier: getStudentTierFromVerification(studentProfile, row.status),
      status: deriveStudentFundingStatus(row.status, hasCertificate),
    };
  });
}
