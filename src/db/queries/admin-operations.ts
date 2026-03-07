import { and, desc, eq, gte, ilike, inArray, lt, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import type { DrizzleDB } from '@/db';
import { bankAccounts, certificatePayments, certificates, documents, notifications, profiles, programs, schools, sponsorships, studentProfiles, users } from '@/db/schema';
import { createTamperEvidentToken } from '@/server/routers/student-proof-utils';

export interface StudentRecordDoc {
  id: string;
  type: string;
  status: DocumentStatus;
  reviewedAt: Date | null;
  rejectionReason: string | null;
}

export interface StudentRecordSponsorship {
  id: string;
  sponsorName: string | null;
  sponsorEmail: string | null;
  amountKobo: number;
  currency: string;
  status: string;
  relationship: string | null;
}

export interface StudentRecordCertificate {
  certId: string;
  issuedAt: Date;
  status: string;
  token: string;
}

export interface StudentRecord {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  schoolName: string | null;
  programName: string | null;
  kycStatus: string;
  bankStatus: string;
  fundingType: string;
  bankAccountLinked: boolean;
  bankName: string | null;
  accountNumber: string | null;
  onboardingComplete: boolean;
  suspendedAt: Date | null;
  documents: StudentRecordDoc[];
  sponsorships: StudentRecordSponsorship[];
  certificate: StudentRecordCertificate | null;
}

export async function getStudentRecord(
  db: DrizzleDB,
  studentId: string,
): Promise<StudentRecord | null> {
  const [userRow] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: profiles.fullName,
      phone: profiles.phone,
      onboardingComplete: profiles.onboardingComplete,
      suspendedAt: profiles.suspendedAt,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, studentId))
    .limit(1);

  if (!userRow) return null;

  const [studentProfileRow] = await db
    .select({
      kycStatus: studentProfiles.kycStatus,
      bankStatus: studentProfiles.bankStatus,
      fundingType: studentProfiles.fundingType,
      schoolName: schools.name,
      programName: programs.name,
    })
    .from(studentProfiles)
    .leftJoin(schools, eq(schools.id, studentProfiles.schoolId))
    .leftJoin(programs, eq(programs.id, studentProfiles.programId))
    .where(eq(studentProfiles.userId, studentId))
    .limit(1);

  const [bankRow] = await db
    .select({ bankName: bankAccounts.bankName, accountNumber: bankAccounts.accountNumber })
    .from(bankAccounts)
    .where(eq(bankAccounts.userId, studentId))
    .orderBy(desc(bankAccounts.linkedAt))
    .limit(1);

  const docRows = await db
    .select({
      id: documents.id,
      type: documents.type,
      status: documents.status,
      reviewedAt: documents.reviewedAt,
      rejectionReason: documents.rejectionReason,
    })
    .from(documents)
    .where(eq(documents.userId, studentId))
    .orderBy(desc(documents.createdAt));

  const sponsorUser = alias(users, 'sponsor_user');

  const sponsorshipRows = await db
    .select({
      id: sponsorships.id,
      amountKobo: sponsorships.amountKobo,
      currency: sponsorships.currency,
      status: sponsorships.status,
      relationship: sponsorships.relationship,
      sponsorName: profiles.fullName,
      sponsorEmail: sponsorUser.email,
    })
    .from(sponsorships)
    .leftJoin(sponsorUser, eq(sponsorUser.id, sponsorships.sponsorId))
    .leftJoin(profiles, eq(profiles.userId, sponsorships.sponsorId))
    .where(eq(sponsorships.studentId, studentId))
    .orderBy(desc(sponsorships.createdAt));

  const [certRow] = await db
    .select({
      id: certificates.id,
      issuedAt: certificates.issuedAt,
      status: certificates.status,
      token: certificates.token,
    })
    .from(certificates)
    .where(eq(certificates.studentId, studentId))
    .orderBy(desc(certificates.issuedAt))
    .limit(1);

  return {
    userId: userRow.id,
    email: userRow.email,
    fullName: userRow.fullName ?? null,
    phone: userRow.phone ?? null,
    onboardingComplete: userRow.onboardingComplete ?? false,
    suspendedAt: userRow.suspendedAt ?? null,
    schoolName: studentProfileRow?.schoolName ?? null,
    programName: studentProfileRow?.programName ?? null,
    kycStatus: studentProfileRow?.kycStatus ?? 'not_started',
    bankStatus: studentProfileRow?.bankStatus ?? 'not_started',
    fundingType: studentProfileRow?.fundingType ?? 'self',
    bankAccountLinked: !!bankRow,
    bankName: bankRow?.bankName ?? null,
    accountNumber: bankRow?.accountNumber ?? null,
    documents: docRows as StudentRecordDoc[],
    sponsorships: sponsorshipRows.map((s) => ({
      id: s.id,
      sponsorName: s.sponsorName ?? null,
      sponsorEmail: s.sponsorEmail ?? null,
      amountKobo: s.amountKobo,
      currency: s.currency,
      status: s.status,
      relationship: s.relationship ?? null,
    })),
    certificate: certRow
      ? {
          certId: certRow.id,
          issuedAt: certRow.issuedAt,
          status: certRow.status,
          token: certRow.token,
        }
      : null,
  };
}

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'more_info_requested' | 'expired';
export type StatusFilter = DocumentStatus | 'all';

export interface OperationsQueueRow {
  id: string;
  type: string;
  status: DocumentStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  studentId: string;
  studentEmail: string;
  reviewerEmail: string | null;
  schoolName: string | null;
  kycStatus: string | null;
  bankStatus: string | null;
}

export interface OperationsStats {
  pending: number;
  approved: number;
  rejected: number;
  moreInfoRequested: number;
  expired: number;
  approvedToday: number;
  rejectedToday: number;
}

export async function getOperationsQueue(
  db: DrizzleDB,
  filters: {
    status?: StatusFilter;
    search?: string;
    limit?: number;
    offset?: number;
  },
): Promise<OperationsQueueRow[]> {
  const reviewerUser = alias(users, 'reviewer_user');

  const conditions = [];
  if (filters.status && filters.status !== 'all') {
    conditions.push(eq(documents.status, filters.status));
  }
  if (filters.search?.trim()) {
    conditions.push(ilike(users.email, `%${filters.search.trim()}%`));
  }

  const rows = await db
    .select({
      id: documents.id,
      type: documents.type,
      status: documents.status,
      rejectionReason: documents.rejectionReason,
      reviewedAt: documents.reviewedAt,
      createdAt: documents.createdAt,
      studentId: users.id,
      studentEmail: users.email,
      reviewerEmail: reviewerUser.email,
      schoolName: schools.name,
      kycStatus: studentProfiles.kycStatus,
      bankStatus: studentProfiles.bankStatus,
    })
    .from(documents)
    .innerJoin(users, eq(documents.userId, users.id))
    .leftJoin(reviewerUser, eq(documents.reviewedBy, reviewerUser.id))
    .leftJoin(studentProfiles, eq(studentProfiles.userId, documents.userId))
    .leftJoin(schools, eq(schools.id, studentProfiles.schoolId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(documents.createdAt))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);

  return rows as OperationsQueueRow[];
}

export async function getOperationsStats(db: DrizzleDB): Promise<OperationsStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [statusRows, approvedTodayRow, rejectedTodayRow] = await Promise.all([
    db
      .select({ status: documents.status, count: sql<number>`count(*)::int` })
      .from(documents)
      .groupBy(documents.status),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(
        and(
          eq(documents.status, 'approved'),
          gte(documents.reviewedAt, startOfDay),
          lt(documents.reviewedAt, endOfDay),
        ),
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(
        and(
          eq(documents.status, 'rejected'),
          gte(documents.reviewedAt, startOfDay),
          lt(documents.reviewedAt, endOfDay),
        ),
      ),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of statusRows) {
    statusCounts[row.status] = row.count;
  }

  return {
    pending: statusCounts['pending'] ?? 0,
    approved: statusCounts['approved'] ?? 0,
    rejected: statusCounts['rejected'] ?? 0,
    moreInfoRequested: statusCounts['more_info_requested'] ?? 0,
    expired: statusCounts['expired'] ?? 0,
    approvedToday: approvedTodayRow[0]?.count ?? 0,
    rejectedToday: rejectedTodayRow[0]?.count ?? 0,
  };
}

export async function reviewDocument(
  db: DrizzleDB,
  documentId: string,
  reviewerId: string,
  decision: { status: DocumentStatus; reason?: string },
): Promise<void> {
  await db
    .update(documents)
    .set({
      status: decision.status,
      rejectionReason: decision.reason ?? null,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId));
}

export async function bulkReviewDocuments(
  db: DrizzleDB,
  documentIds: string[],
  reviewerId: string,
  decision: { status: DocumentStatus; reason?: string },
): Promise<void> {
  if (documentIds.length === 0) return;
  await db
    .update(documents)
    .set({
      status: decision.status,
      rejectionReason: decision.reason ?? null,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      updatedAt: new Date(),
    })
    .where(inArray(documents.id, documentIds));
}

export interface IssueCertificateInput {
  studentId: string;
  sponsorshipId: string | null;
  adminId: string;
  waivePayment: boolean;
  secret: string;
}

export interface IssueCertificateResult {
  certificateId: string;
  token: string;
  issuedAt: Date;
  paymentStatus: 'paid' | 'waived';
}

export type IssueCertificateBlocker =
  | { type: 'payment_required' }
  | { type: 'documents_not_approved' }
  | { type: 'kyc_not_verified' }
  | { type: 'bank_not_verified' }
  | { type: 'sponsorship_not_found' }
  | { type: 'certificate_already_active' }
  | { type: 'student_not_found' };

export async function validateAndIssueCertificate(
  db: DrizzleDB,
  input: IssueCertificateInput,
): Promise<IssueCertificateResult | IssueCertificateBlocker> {
  const { studentId, sponsorshipId, adminId, waivePayment, secret } = input;

  // Verify student exists
  const student = await db.query.users.findFirst({
    where: eq(users.id, studentId),
    columns: { id: true },
  });
  if (!student) {
    return { type: 'student_not_found' };
  }

  // Check student profile for KYC + bank verification
  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, studentId),
    columns: { kycStatus: true, bankStatus: true, fundingType: true },
  });

  if (!profile || profile.kycStatus !== 'verified') {
    return { type: 'kyc_not_verified' };
  }

  if (profile.bankStatus !== 'verified') {
    return { type: 'bank_not_verified' };
  }

  // Check that at least one document is approved
  const approvedDoc = await db.query.documents.findFirst({
    where: and(eq(documents.userId, studentId), eq(documents.status, 'approved')),
    columns: { id: true },
  });
  if (!approvedDoc) {
    return { type: 'documents_not_approved' };
  }

  // If a sponsorshipId is provided, confirm it exists and is active/completed
  if (sponsorshipId) {
    const sponsorship = await db.query.sponsorships.findFirst({
      where: and(
        eq(sponsorships.id, sponsorshipId),
        eq(sponsorships.studentId, studentId),
        inArray(sponsorships.status, ['active', 'completed']),
      ),
      columns: { id: true },
    });
    if (!sponsorship) {
      return { type: 'sponsorship_not_found' };
    }
  }

  // Check that no active certificate already exists for this student
  const existing = await db.query.certificates.findFirst({
    where: and(eq(certificates.studentId, studentId), eq(certificates.status, 'active')),
    columns: { id: true },
  });
  if (existing) {
    return { type: 'certificate_already_active' };
  }

  // Check payment — either a prior paid certificatePayments row exists, or admin waives
  if (!waivePayment) {
    const paidPayment = await db.query.certificatePayments.findFirst({
      where: and(
        eq(certificatePayments.studentId, studentId),
        eq(certificatePayments.status, 'paid'),
      ),
      columns: { id: true },
    });
    if (!paidPayment) {
      return { type: 'payment_required' };
    }
  }
  const resolvedPaymentStatus: 'paid' | 'waived' = waivePayment ? 'waived' : 'paid';

  // All validations passed — issue the certificate
  const issuedAt = new Date();
  const token = createTamperEvidentToken({ studentId, issuedAt, secret });

  const [created] = await db
    .insert(certificates)
    .values({
      studentId,
      sponsorshipId: sponsorshipId ?? undefined,
      token,
      issuedAt,
      status: 'active',
      paymentStatus: resolvedPaymentStatus,
      metaJson: {
        signatureVersion: 1,
        issuedByAdminId: adminId,
        issuedByProcedure: 'admin.issueCertificate',
      },
    })
    .returning({
      id: certificates.id,
      token: certificates.token,
      issuedAt: certificates.issuedAt,
      paymentStatus: certificates.paymentStatus,
    });

  if (!created) {
    throw new Error('Certificate insert returned no rows');
  }

  // Create in-app notification for the student
  await db.insert(notifications).values({
    userId: studentId,
    type: 'cert_issued',
    title: 'Your proof of funds certificate is ready',
    body: 'Your certificate has been issued and is available on your dashboard.',
    link: '/dashboard/student/proof',
    priority: 'normal',
  });

  return {
    certificateId: created.id,
    token: created.token,
    issuedAt: created.issuedAt,
    paymentStatus: created.paymentStatus as 'paid' | 'waived',
  };
}
