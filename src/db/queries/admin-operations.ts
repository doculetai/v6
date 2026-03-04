import { and, desc, eq, gte, ilike, inArray, lt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import type { DrizzleDB } from '@/db';
import { documents, schools, studentProfiles, users } from '@/db/schema';

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'more_info_requested';
export type StatusFilter = DocumentStatus | 'all';

export interface OperationsQueueRow {
  id: string;
  type: string;
  status: DocumentStatus;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
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

  const [allDocs, approvedToday, rejectedToday] = await Promise.all([
    db.select({ id: documents.id, status: documents.status }).from(documents),
    db
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(
          eq(documents.status, 'approved'),
          gte(documents.reviewedAt, startOfDay),
          lt(documents.reviewedAt, endOfDay),
        ),
      ),
    db
      .select({ id: documents.id })
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
  for (const doc of allDocs) {
    statusCounts[doc.status] = (statusCounts[doc.status] ?? 0) + 1;
  }

  return {
    pending: statusCounts['pending'] ?? 0,
    approved: statusCounts['approved'] ?? 0,
    rejected: statusCounts['rejected'] ?? 0,
    moreInfoRequested: statusCounts['more_info_requested'] ?? 0,
    approvedToday: approvedToday.length,
    rejectedToday: rejectedToday.length,
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
