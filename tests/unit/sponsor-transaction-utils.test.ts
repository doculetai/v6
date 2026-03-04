import { describe, expect, it } from 'vitest';

import { sponsorTransactionsFixture } from '../fixtures/sponsor-transactions';
import {
  countTransactionsByType,
  filterTransactionsByType,
  sortTransactionsByNewest,
} from '@/components/sponsor/transaction-utils';

describe('sponsor transaction utils', () => {
  it('filters by selected type and keeps all for all filter', () => {
    const all = filterTransactionsByType(sponsorTransactionsFixture, 'all');
    const fees = filterTransactionsByType(sponsorTransactionsFixture, 'fee');

    expect(all).toHaveLength(4);
    expect(fees).toHaveLength(1);
    expect(fees[0]?.type).toBe('fee');
  });

  it('returns type counts for filter chips', () => {
    const counts = countTransactionsByType(sponsorTransactionsFixture);

    expect(counts).toEqual({
      all: 4,
      credit: 0,
      debit: 2,
      fee: 1,
    });
  });

  it('sorts newest transactions first', () => {
    const sorted = sortTransactionsByNewest(sponsorTransactionsFixture);

    expect(sorted[0]?.id).toBe('txn_4');
    expect(sorted.at(-1)?.id).toBe('txn_1');
  });
});
