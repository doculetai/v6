import type {
  SponsorTransaction,
  SponsorTransactionFilter,
  SponsorTransactionSummary,
  SponsorTransactionType,
} from '@/types/sponsor-transactions';

function filterTransactionsByType(
  transactions: readonly SponsorTransaction[],
  type: SponsorTransactionFilter,
): SponsorTransaction[] {
  if (type === 'all') {
    return [...transactions];
  }

  return transactions.filter((transaction) => transaction.type === type);
}

function countTransactionsByType(transactions: readonly SponsorTransaction[]) {
  const counts: Record<SponsorTransactionFilter, number> = {
    all: transactions.length,
    credit: 0,
    debit: 0,
    fee: 0,
  };

  for (const transaction of transactions) {
    if (transaction.type in counts && transaction.type !== 'refund') {
      counts[transaction.type as Exclude<SponsorTransactionType, 'refund'>] += 1;
    }
  }

  return counts;
}

function sortTransactionsByNewest(
  transactions: readonly SponsorTransaction[],
): SponsorTransaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function calculateTransactionSummary(
  transactions: readonly SponsorTransaction[],
): SponsorTransactionSummary {
  let totalSpentKobo = 0;
  let totalPendingKobo = 0;

  for (const transaction of transactions) {
    const isOutflow = transaction.type === 'debit' || transaction.type === 'fee';

    if (isOutflow && transaction.status === 'successful') {
      totalSpentKobo += transaction.amountKobo;
      continue;
    }

    if (isOutflow && transaction.status === 'pending') {
      totalPendingKobo += transaction.amountKobo;
    }
  }

  return {
    totalSpentKobo,
    totalPendingKobo,
    updatedAt: new Date().toISOString(),
  };
}

export {
  calculateTransactionSummary,
  countTransactionsByType,
  filterTransactionsByType,
  sortTransactionsByNewest,
};
