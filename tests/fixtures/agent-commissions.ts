import type { agentCommissions } from '@/db/schema';

type AgentCommissionRow = typeof agentCommissions.$inferSelect;

export function agentCommissionFixture(
  overrides: Partial<{
    id: string;
    agentId: string;
    amountKobo: number;
    status: 'pending' | 'processing' | 'paid' | 'cancelled';
  }> = {},
): AgentCommissionRow {
  return {
    id: overrides.id ?? 'commission-001',
    agentId: overrides.agentId ?? 'agent-001',
    sponsorshipId: null,
    amountKobo: overrides.amountKobo ?? 5000000,
    currency: 'NGN',
    status: overrides.status ?? 'pending',
    description: 'Commission for cert issuance',
    paidAt: null,
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
  };
}
