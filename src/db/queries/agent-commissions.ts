import { and, eq, inArray } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { agentCommissions } from '@/db/schema';

export interface AgentCommissionRow {
  id: string;
  agentId: string;
  sponsorshipId: string | null;
  amountKobo: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Returns all commissions for the given agent, optionally filtered by status.
 */
export async function getAgentCommissions(
  db: DrizzleDB,
  agentId: string,
  status?: 'pending' | 'processing' | 'paid' | 'cancelled',
): Promise<AgentCommissionRow[]> {
  const conditions = [eq(agentCommissions.agentId, agentId)];

  if (status) {
    conditions.push(eq(agentCommissions.status, status));
  }

  const rows = await db
    .select()
    .from(agentCommissions)
    .where(and(...conditions))
    .orderBy(agentCommissions.createdAt);

  return rows.map((r) => ({
    id: r.id,
    agentId: r.agentId,
    sponsorshipId: r.sponsorshipId ?? null,
    amountKobo: r.amountKobo,
    currency: r.currency,
    status: r.status as AgentCommissionRow['status'],
    description: r.description ?? null,
    paidAt: r.paidAt ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

/**
 * Transitions eligible commission rows from 'pending' to 'processing'.
 *
 * Eligibility rules (both must hold):
 *   1. The commission's agentId matches the requesting agentId (ownership guard).
 *   2. The commission's current status is 'pending' (not already in-flight or settled).
 *
 * Returns the count of rows actually updated.
 */
export async function requestCommissionPayout(
  db: DrizzleDB,
  commissionIds: string[],
  agentId: string,
): Promise<number> {
  if (commissionIds.length === 0) return 0;

  const updated = await db
    .update(agentCommissions)
    .set({
      status: 'processing',
      updatedAt: new Date(),
    })
    .where(
      and(
        inArray(agentCommissions.id, commissionIds),
        eq(agentCommissions.agentId, agentId),
        eq(agentCommissions.status, 'pending'),
      ),
    )
    .returning({ id: agentCommissions.id });

  return updated.length;
}
