import { and, desc, eq, gt, inArray } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import {
  agentStudentAssignments,
  balanceVerifications,
  certificates,
  documents,
  kycVerifications,
  profiles,
} from '@/db/schema';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AgentActivityEventType =
  | 'document_uploaded'
  | 't2_verified'
  | 't3_verified'
  | 'cert_issued'
  | 'doc_approved'
  | 'doc_rejected';

export interface AgentActivityItem {
  id: string;
  studentId: string;
  studentName: string;
  eventType: AgentActivityEventType;
  eventLabel: string;
  createdAt: Date;
}

// ── Label map ─────────────────────────────────────────────────────────────────

const EVENT_LABELS: Record<AgentActivityEventType, string> = {
  document_uploaded: 'Document uploaded',
  t2_verified: 'Identity verified',
  t3_verified: 'Bank verified',
  cert_issued: 'Certificate issued',
  doc_approved: 'Document approved',
  doc_rejected: 'Document rejected',
};

// ── Query ─────────────────────────────────────────────────────────────────────

/**
 * Returns a paginated activity feed for the given agent's students.
 *
 * Events are sourced from four tables:
 *   - documents       — upload events (createdAt) and review events (reviewedAt)
 *   - kycVerifications — identity tier completions (verifiedAt, tier=2)
 *   - balanceVerifications — banking tier completions (verifiedAt)
 *   - certificates    — cert issuances (issuedAt)
 *
 * Pagination is cursor-based using an ISO date string. Only events strictly
 * after the cursor date are returned, ordered newest-first.
 */
export async function getAgentActivity(
  db: DrizzleDB,
  agentId: string,
  limit: number,
  cursor?: string,
): Promise<AgentActivityItem[]> {
  // Step 1: resolve the agent's assigned student IDs.
  const assignments = await db
    .select({ studentId: agentStudentAssignments.studentId })
    .from(agentStudentAssignments)
    .where(eq(agentStudentAssignments.agentId, agentId));

  if (assignments.length === 0) return [];

  const studentIds = assignments.map((a) => a.studentId);

  // Step 2: resolve display names for each student.
  const profileRows = await db
    .select({ userId: profiles.userId, fullName: profiles.fullName })
    .from(profiles)
    .where(inArray(profiles.userId, studentIds));

  const nameMap = new Map<string, string>(
    profileRows.map((p) => [p.userId, p.fullName ?? 'Unknown student']),
  );

  const cursorDate = cursor ? new Date(cursor) : undefined;

  // Step 3: fetch events in parallel from all four sources.
  const [docUploads, docReviews, kycRows, bankRows, certRows] = await Promise.all([
    // Document uploaded — use createdAt
    db
      .select({
        id: documents.id,
        userId: documents.userId,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(
        and(
          inArray(documents.userId, studentIds),
          cursorDate ? gt(documents.createdAt, cursorDate) : undefined,
        ),
      )
      .orderBy(desc(documents.createdAt))
      .limit(limit),

    // Document approved / rejected — use reviewedAt
    db
      .select({
        id: documents.id,
        userId: documents.userId,
        status: documents.status,
        reviewedAt: documents.reviewedAt,
      })
      .from(documents)
      .where(
        and(
          inArray(documents.userId, studentIds),
          inArray(documents.status, ['approved', 'rejected'] as const),
          cursorDate ? gt(documents.reviewedAt, cursorDate) : undefined,
        ),
      )
      .orderBy(desc(documents.reviewedAt))
      .limit(limit),

    // T2 identity verified (tier = 2, status = verified)
    db
      .select({
        id: kycVerifications.id,
        userId: kycVerifications.userId,
        tier: kycVerifications.tier,
        verifiedAt: kycVerifications.verifiedAt,
      })
      .from(kycVerifications)
      .where(
        and(
          inArray(kycVerifications.userId, studentIds),
          eq(kycVerifications.status, 'verified'),
          cursorDate ? gt(kycVerifications.verifiedAt, cursorDate) : undefined,
        ),
      )
      .orderBy(desc(kycVerifications.verifiedAt))
      .limit(limit),

    // T3 bank verified
    db
      .select({
        id: balanceVerifications.id,
        userId: balanceVerifications.userId,
        verifiedAt: balanceVerifications.verifiedAt,
      })
      .from(balanceVerifications)
      .where(
        and(
          inArray(balanceVerifications.userId, studentIds),
          cursorDate ? gt(balanceVerifications.verifiedAt, cursorDate) : undefined,
        ),
      )
      .orderBy(desc(balanceVerifications.verifiedAt))
      .limit(limit),

    // Certificate issued
    db
      .select({
        id: certificates.id,
        studentId: certificates.studentId,
        issuedAt: certificates.issuedAt,
      })
      .from(certificates)
      .where(
        and(
          inArray(certificates.studentId, studentIds),
          cursorDate ? gt(certificates.issuedAt, cursorDate) : undefined,
        ),
      )
      .orderBy(desc(certificates.issuedAt))
      .limit(limit),
  ]);

  // Step 4: build a flat event list from all sources.
  const items: AgentActivityItem[] = [];

  for (const row of docUploads) {
    const eventType: AgentActivityEventType = 'document_uploaded';
    items.push({
      id: `doc-upload-${row.id}`,
      studentId: row.userId,
      studentName: nameMap.get(row.userId) ?? 'Unknown student',
      eventType,
      eventLabel: EVENT_LABELS[eventType],
      createdAt: row.createdAt,
    });
  }

  for (const row of docReviews) {
    if (!row.reviewedAt) continue;
    const eventType: AgentActivityEventType =
      row.status === 'approved' ? 'doc_approved' : 'doc_rejected';
    items.push({
      id: `doc-review-${row.id}`,
      studentId: row.userId,
      studentName: nameMap.get(row.userId) ?? 'Unknown student',
      eventType,
      eventLabel: EVENT_LABELS[eventType],
      createdAt: row.reviewedAt,
    });
  }

  for (const row of kycRows) {
    if (!row.verifiedAt) continue;
    // tier 2 = identity (T2), tier 3 = reserved for future; map both to appropriate label
    const eventType: AgentActivityEventType = row.tier === 2 ? 't2_verified' : 't2_verified';
    items.push({
      id: `kyc-${row.id}`,
      studentId: row.userId,
      studentName: nameMap.get(row.userId) ?? 'Unknown student',
      eventType,
      eventLabel: EVENT_LABELS[eventType],
      createdAt: row.verifiedAt,
    });
  }

  for (const row of bankRows) {
    items.push({
      id: `bank-${row.id}`,
      studentId: row.userId,
      studentName: nameMap.get(row.userId) ?? 'Unknown student',
      eventType: 't3_verified',
      eventLabel: EVENT_LABELS['t3_verified'],
      createdAt: row.verifiedAt,
    });
  }

  for (const row of certRows) {
    items.push({
      id: `cert-${row.id}`,
      studentId: row.studentId,
      studentName: nameMap.get(row.studentId) ?? 'Unknown student',
      eventType: 'cert_issued',
      eventLabel: EVENT_LABELS['cert_issued'],
      createdAt: row.issuedAt,
    });
  }

  // Step 5: sort merged list newest-first and apply the limit.
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return items.slice(0, limit);
}
