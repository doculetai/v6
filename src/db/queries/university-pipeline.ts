import { eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { documents } from '@/db/schema';

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'more_info_requested';

export type PipelineRow = {
  /** document.id — used as DataTableShell row key */
  id: string;
  studentId: string;
  studentEmail: string;
  program: string | null;
  schoolName: string | null;
  /** Amount in kobo */
  amountKobo: number;
  kycTier: number | null;
  documentStatus: DocumentStatus;
  submittedAt: string;
  updatedAt: string;
  daysWaiting: number;
};

export type PipelineStats = {
  total: number;
  pending: number;
  approvedThisWeek: number;
  avgDaysWaiting: number;
};

function isWithinThisWeek(isoString: string): boolean {
  const date = new Date(isoString);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return date >= weekStart;
}

export async function getUniversityPipelineQueue(
  db: DrizzleDB,
): Promise<{ rows: PipelineRow[]; stats: PipelineStats }> {
  const docs = await db.query.documents.findMany({
    where: (t, { eq: eqOp }) => eqOp(t.type, 'bank_statement'),
    with: { user: true },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  if (docs.length === 0) {
    return { rows: [], stats: { total: 0, pending: 0, approvedThisWeek: 0, avgDaysWaiting: 0 } };
  }

  const userIds = docs.map((d) => d.userId);

  const profileRows = await db.query.studentProfiles.findMany({
    where: (t, { inArray }) => inArray(t.userId, userIds),
    with: {
      school: true,
      program: true,
      kycVerifications: {
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        limit: 1,
      },
    },
  });

  const sponsorshipRows = await db.query.sponsorships.findMany({
    where: (t, { and, inArray, ne }) =>
      and(inArray(t.studentId, userIds), ne(t.status, 'cancelled')),
  });

  const profilesByUserId = new Map(profileRows.map((p) => [p.userId, p]));
  // Prefer active > pending when multiple sponsorships exist per student
  const statusPriority: Record<string, number> = { active: 0, pending: 1, completed: 2 };
  const bestSponsorshipPerStudent = sponsorshipRows.reduce<
    Map<string, (typeof sponsorshipRows)[number]>
  >((map, s) => {
    const existing = map.get(s.studentId);
    if (
      !existing ||
      (statusPriority[s.status] ?? 99) < (statusPriority[existing.status] ?? 99)
    ) {
      map.set(s.studentId, s);
    }
    return map;
  }, new Map());
  const sponsorsByStudentId = bestSponsorshipPerStudent;

  const now = Date.now();

  const rows: PipelineRow[] = docs.map((doc) => {
    const profile = profilesByUserId.get(doc.userId);
    const sponsorship = sponsorsByStudentId.get(doc.userId);
    const latestKyc = profile?.kycVerifications[0];
    const daysWaiting = Math.floor((now - doc.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: doc.id,
      studentId: doc.userId,
      studentEmail: doc.user?.email ?? doc.userId,
      program: profile?.program?.name ?? null,
      schoolName: profile?.school?.name ?? null,
      amountKobo: sponsorship?.amountKobo ?? profile?.program?.tuitionAmount ?? 0,
      kycTier: latestKyc?.tier ?? null,
      documentStatus: doc.status as DocumentStatus,
      submittedAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      daysWaiting,
    };
  });

  const pendingRows = rows.filter((r) => r.documentStatus === 'pending');
  const approvedRows = rows.filter((r) => r.documentStatus === 'approved');
  const approvedThisWeek = approvedRows.filter((r) => isWithinThisWeek(r.updatedAt)).length;
  const avgDaysWaiting =
    pendingRows.length > 0
      ? Math.round(pendingRows.reduce((sum, r) => sum + r.daysWaiting, 0) / pendingRows.length)
      : 0;

  return {
    rows,
    stats: { total: rows.length, pending: pendingRows.length, approvedThisWeek, avgDaysWaiting },
  };
}

export async function reviewPipelineDocument(
  db: DrizzleDB,
  params: {
    documentId: string;
    action: 'approved' | 'rejected' | 'more_info_requested';
    reviewedBy: string;
    rejectionReason?: string;
  },
): Promise<void> {
  await db
    .update(documents)
    .set({
      status: params.action,
      reviewedAt: new Date(),
      reviewedBy: params.reviewedBy,
      rejectionReason: params.rejectionReason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, params.documentId));
}
