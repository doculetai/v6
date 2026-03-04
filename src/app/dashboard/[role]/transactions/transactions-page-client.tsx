'use client';

import { ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TransactionList } from '@/components/sponsor/TransactionList';
import { TransactionSummaryBar } from '@/components/sponsor/TransactionSummaryBar';
import {
  countTransactionsByType,
  filterTransactionsByType,
  sortTransactionsByNewest,
} from '@/components/sponsor/transaction-utils';
import { FilterBar } from '@/components/ui/filter-bar';
import { PageHeader } from '@/components/ui/page-header';
import { sponsorCopy } from '@/config/copy/sponsor';
import type {
  SponsorTransaction,
  SponsorTransactionFilter,
  SponsorTransactionSummary,
} from '@/types/sponsor-transactions';

type TransactionsPageClientProps = {
  initialTransactions: SponsorTransaction[];
  initialSummary: SponsorTransactionSummary;
};

function TransactionsPageClient({
  initialTransactions,
  initialSummary,
}: TransactionsPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<SponsorTransactionFilter>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () => countTransactionsByType(initialTransactions),
    [initialTransactions],
  );

  const labels = {
    types: sponsorCopy.transactions.types,
    statuses: sponsorCopy.transactions.statuses,
    sources: {
      disbursement: sponsorCopy.transactions.sources.disbursement,
      paystack_charge: sponsorCopy.transactions.sources.paystackCharge,
      paystack_fee: sponsorCopy.transactions.sources.paystackFee,
      paystack_refund: sponsorCopy.transactions.sources.paystackRefund,
      paystack_credit: sponsorCopy.transactions.sources.paystackCredit,
    },
    columns: {
      transaction: sponsorCopy.transactions.table.transaction,
      amount: sponsorCopy.transactions.table.amount,
      date: sponsorCopy.transactions.table.date,
      status: sponsorCopy.transactions.table.status,
      reference: sponsorCopy.transactions.table.reference,
    },
    referenceFallback: sponsorCopy.transactions.referenceFallback,
  };

  const filteredTransactions = useMemo(() => {
    const byType = filterTransactionsByType(initialTransactions, activeFilter);
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortTransactionsByNewest(byType);
    }

    const matches = byType.filter((transaction) => {
      const reference = transaction.reference?.toLowerCase() ?? '';
      const typeLabel = labels.types[transaction.type].toLowerCase();
      const sourceLabel = labels.sources[transaction.source].toLowerCase();

      return (
        reference.includes(normalizedQuery) ||
        typeLabel.includes(normalizedQuery) ||
        sourceLabel.includes(normalizedQuery)
      );
    });

    return sortTransactionsByNewest(matches);
  }, [activeFilter, initialTransactions, labels.sources, labels.types, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={sponsorCopy.transactions.title}
        subtitle={sponsorCopy.transactions.subtitle}
        badge={
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary dark:bg-primary/20 dark:text-primary">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {sponsorCopy.transactions.trustLabel}
          </span>
        }
      />

      <TransactionSummaryBar
        summary={initialSummary}
        labels={{
          totalSpent: sponsorCopy.transactions.summary.totalSpent,
          totalPending: sponsorCopy.transactions.summary.totalPending,
          lastUpdated: sponsorCopy.transactions.summary.lastUpdated,
        }}
      />

      <FilterBar
        query={query}
        queryPlaceholder={sponsorCopy.transactions.filter.searchPlaceholder}
        chips={[
          {
            key: 'all',
            label: sponsorCopy.transactions.filter.chips.all,
            count: counts.all,
          },
          {
            key: 'credit',
            label: sponsorCopy.transactions.filter.chips.credit,
            count: counts.credit,
          },
          {
            key: 'debit',
            label: sponsorCopy.transactions.filter.chips.debit,
            count: counts.debit,
          },
          {
            key: 'fee',
            label: sponsorCopy.transactions.filter.chips.fee,
            count: counts.fee,
          },
        ]}
        activeChip={activeFilter}
        onChipChange={(value) => setActiveFilter(value as SponsorTransactionFilter)}
        onQueryChange={setQuery}
      />

      <TransactionList
        transactions={filteredTransactions}
        labels={labels}
        emptyState={{
          title: sponsorCopy.transactions.empty.title,
          description: sponsorCopy.transactions.empty.description,
        }}
      />
    </div>
  );
}

export { TransactionsPageClient };
export type { TransactionsPageClientProps };
