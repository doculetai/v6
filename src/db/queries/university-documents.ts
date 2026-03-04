import { count, desc, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { documents } from '@/db/schema';

export type DocumentStatus = (typeof documents.$inferSelect)['status'];
export type DocumentType = (typeof documents.$inferSelect)['type'];

const LIST_LIMIT = 200;

export async function listDocumentsForReview(
  db: DrizzleDB,
  filters?: { status?: DocumentStatus },
) {
  return db.query.documents.findMany({
    where: filters?.status ? eq(documents.status, filters.status) : undefined,
    with: { user: true },
    orderBy: [desc(documents.createdAt)],
    limit: LIST_LIMIT,
  });
}

export async function getDocumentById(db: DrizzleDB, documentId: string) {
  return db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    with: { user: true },
  });
}

export async function getDocumentStats(db: DrizzleDB) {
  const [total, pending, approved, moreInfo] = await Promise.all([
    db.select({ value: count() }).from(documents),
    db.select({ value: count() }).from(documents).where(eq(documents.status, 'pending')),
    db.select({ value: count() }).from(documents).where(eq(documents.status, 'approved')),
    db
      .select({ value: count() })
      .from(documents)
      .where(eq(documents.status, 'more_info_requested')),
  ]);

  return {
    total: total[0]?.value ?? 0,
    pending: pending[0]?.value ?? 0,
    approved: approved[0]?.value ?? 0,
    moreInfoRequested: moreInfo[0]?.value ?? 0,
  };
}

export async function reviewDocument(
  db: DrizzleDB,
  documentId: string,
  reviewerId: string,
  action: {
    status: 'approved' | 'rejected' | 'more_info_requested';
    rejectionReason?: string;
  },
) {
  const [updated] = await db
    .update(documents)
    .set({
      status: action.status,
      rejectionReason: action.rejectionReason ?? null,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    })
    .where(eq(documents.id, documentId))
    .returning();

  return updated;
}
