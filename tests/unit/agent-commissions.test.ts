import { describe, expect, it } from 'vitest';

import type { AgentCommissionRow } from '@/db/queries/agent-commissions';
import {
  AGENT_ID,
  OTHER_AGENT_ID,
  otherAgentCommission,
  paidCommission,
  pendingCommission1,
  pendingCommission2,
  processingCommission,
} from '../fixtures/agent-commissions';

/**
 * Pure eligibility filter — mirrors the WHERE clause in requestCommissionPayout.
 * A commission is eligible for payout if:
 *   1. Its id is in the requested set.
 *   2. Its agentId matches the requesting agent.
 *   3. Its status is 'pending'.
 */
function filterEligible(
  commissions: AgentCommissionRow[],
  commissionIds: string[],
  agentId: string,
): AgentCommissionRow[] {
  return commissions.filter(
    (c) => commissionIds.includes(c.id) && c.agentId === agentId && c.status === 'pending',
  );
}

const allCommissions: AgentCommissionRow[] = [
  pendingCommission1,
  pendingCommission2,
  processingCommission,
  paidCommission,
  otherAgentCommission,
];

describe('requestCommissionPayout eligibility logic', () => {
  it('selects all pending commissions that belong to the agent', () => {
    const eligible = filterEligible(
      allCommissions,
      [pendingCommission1.id, pendingCommission2.id],
      AGENT_ID,
    );
    expect(eligible).toHaveLength(2);
    expect(eligible.map((c) => c.id)).toEqual(
      expect.arrayContaining([pendingCommission1.id, pendingCommission2.id]),
    );
  });

  it('returns empty when commissionIds belong to a different agent', () => {
    const eligible = filterEligible(allCommissions, [otherAgentCommission.id], AGENT_ID);
    expect(eligible).toHaveLength(0);
  });

  it('returns empty when commission is already processing', () => {
    const eligible = filterEligible(allCommissions, [processingCommission.id], AGENT_ID);
    expect(eligible).toHaveLength(0);
  });

  it('returns empty when commission is already paid', () => {
    const eligible = filterEligible(allCommissions, [paidCommission.id], AGENT_ID);
    expect(eligible).toHaveLength(0);
  });

  it('returns empty when commissionIds list is for correct agent but ids do not match any row', () => {
    const eligible = filterEligible(
      allCommissions,
      ['00000000-0000-0000-0000-000000000999'],
      AGENT_ID,
    );
    expect(eligible).toHaveLength(0);
  });

  it('other agent cannot claim own pending commission using wrong agentId', () => {
    const eligible = filterEligible(
      allCommissions,
      [otherAgentCommission.id],
      OTHER_AGENT_ID,
    );
    expect(eligible).toHaveLength(1);
    expect(eligible[0].agentId).toBe(OTHER_AGENT_ID);
  });

  it('partial set: only pending + owned rows are returned when mixed ids are supplied', () => {
    const ids = [
      pendingCommission1.id,
      processingCommission.id,
      paidCommission.id,
      otherAgentCommission.id,
    ];
    const eligible = filterEligible(allCommissions, ids, AGENT_ID);
    expect(eligible).toHaveLength(1);
    expect(eligible[0].id).toBe(pendingCommission1.id);
  });
});
