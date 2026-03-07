import type { AgentCommissionRow } from '@/db/queries/agent-commissions';

export const AGENT_ID = '00000000-0000-0000-0000-000000000010';
export const OTHER_AGENT_ID = '00000000-0000-0000-0000-000000000011';

export const pendingCommission1: AgentCommissionRow = {
  id: '00000000-0000-0000-0000-000000000101',
  agentId: AGENT_ID,
  sponsorshipId: '00000000-0000-0000-0000-000000000201',
  amountKobo: 150000,
  currency: 'NGN',
  status: 'pending',
  description: 'Commission for student application',
  paidAt: null,
  createdAt: new Date('2026-02-01T08:00:00Z'),
  updatedAt: new Date('2026-02-01T08:00:00Z'),
};

export const pendingCommission2: AgentCommissionRow = {
  id: '00000000-0000-0000-0000-000000000102',
  agentId: AGENT_ID,
  sponsorshipId: '00000000-0000-0000-0000-000000000202',
  amountKobo: 250000,
  currency: 'NGN',
  status: 'pending',
  description: 'Commission for second student',
  paidAt: null,
  createdAt: new Date('2026-02-10T10:00:00Z'),
  updatedAt: new Date('2026-02-10T10:00:00Z'),
};

export const processingCommission: AgentCommissionRow = {
  id: '00000000-0000-0000-0000-000000000103',
  agentId: AGENT_ID,
  sponsorshipId: '00000000-0000-0000-0000-000000000203',
  amountKobo: 100000,
  currency: 'NGN',
  status: 'processing',
  description: 'Commission already requested for payout',
  paidAt: null,
  createdAt: new Date('2026-01-20T09:00:00Z'),
  updatedAt: new Date('2026-01-25T14:00:00Z'),
};

export const paidCommission: AgentCommissionRow = {
  id: '00000000-0000-0000-0000-000000000104',
  agentId: AGENT_ID,
  sponsorshipId: '00000000-0000-0000-0000-000000000204',
  amountKobo: 200000,
  currency: 'NGN',
  status: 'paid',
  description: 'Commission already settled',
  paidAt: new Date('2026-01-15T11:00:00Z'),
  createdAt: new Date('2026-01-10T08:00:00Z'),
  updatedAt: new Date('2026-01-15T11:00:00Z'),
};

export const otherAgentCommission: AgentCommissionRow = {
  id: '00000000-0000-0000-0000-000000000105',
  agentId: OTHER_AGENT_ID,
  sponsorshipId: '00000000-0000-0000-0000-000000000205',
  amountKobo: 75000,
  currency: 'NGN',
  status: 'pending',
  description: 'Commission belonging to a different agent',
  paidAt: null,
  createdAt: new Date('2026-02-05T08:00:00Z'),
  updatedAt: new Date('2026-02-05T08:00:00Z'),
};
