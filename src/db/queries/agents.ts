import { and, countDistinct, eq, gte, isNotNull, sql, sum } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { agentCommissions } from '@/db/schema';

export async function getAgentCommissions(db: DrizzleDB, agentId: string) {
  return db
    .select({
      id: agentCommissions.id,
      studentId: agentCommissions.studentId,
      studentName: agentCommissions.studentName,
      universityName: agentCommissions.universityName,
      tier: agentCommissions.tier,
      eventType: agentCommissions.eventType,
      amountKobo: agentCommissions.amountKobo,
      status: agentCommissions.status,
      paidAt: agentCommissions.paidAt,
      createdAt: agentCommissions.createdAt,
      updatedAt: agentCommissions.updatedAt,
    })
    .from(agentCommissions)
    .where(eq(agentCommissions.agentId, agentId))
    .orderBy(sql`${agentCommissions.createdAt} desc`);
}

export async function getAgentCommissionStats(db: DrizzleDB, agentId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [pending, paidMonth, lifetime] = await Promise.all([
    db
      .select({ total: sum(agentCommissions.amountKobo) })
      .from(agentCommissions)
      .where(
        and(eq(agentCommissions.agentId, agentId), eq(agentCommissions.status, 'pending')),
      ),
    db
      .select({ total: sum(agentCommissions.amountKobo) })
      .from(agentCommissions)
      .where(
        and(
          eq(agentCommissions.agentId, agentId),
          eq(agentCommissions.status, 'paid'),
          isNotNull(agentCommissions.paidAt),
          gte(agentCommissions.paidAt, startOfMonth),
        ),
      ),
    db
      .select({ total: sum(agentCommissions.amountKobo) })
      .from(agentCommissions)
      .where(
        and(eq(agentCommissions.agentId, agentId), eq(agentCommissions.status, 'paid')),
      ),
  ]);

  return {
    pendingPayout: Number(pending[0]?.total ?? 0),
    paidThisMonth: Number(paidMonth[0]?.total ?? 0),
    totalLifetime: Number(lifetime[0]?.total ?? 0),
  };
}

export async function getAgentOverviewStats(db: DrizzleDB, agentId: string) {
  const [totals, pendingKobo, earnedKobo] = await Promise.all([
    db
      .select({
        totalStudents: countDistinct(agentCommissions.studentId),
        activeStudents: countDistinct(
          sql`case when ${agentCommissions.status} = 'pending' then ${agentCommissions.studentId} end`,
        ),
      })
      .from(agentCommissions)
      .where(eq(agentCommissions.agentId, agentId)),
    db
      .select({ total: sum(agentCommissions.amountKobo) })
      .from(agentCommissions)
      .where(
        and(eq(agentCommissions.agentId, agentId), eq(agentCommissions.status, 'pending')),
      ),
    db
      .select({ total: sum(agentCommissions.amountKobo) })
      .from(agentCommissions)
      .where(
        and(eq(agentCommissions.agentId, agentId), eq(agentCommissions.status, 'paid')),
      ),
  ]);

  return {
    totalStudents: Number(totals[0]?.totalStudents ?? 0),
    activeStudents: Number(totals[0]?.activeStudents ?? 0),
    pendingCommissions: Number(pendingKobo[0]?.total ?? 0),
    totalEarned: Number(earnedKobo[0]?.total ?? 0),
  };
}
