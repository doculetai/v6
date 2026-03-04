import { DataTableShell, type DataTableColumn } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import type { SponsorTransaction } from '@/types/sponsor-transactions';

import {
  TransactionAmount,
  TransactionRow,
  TransactionStatusPill,
  type TransactionCopyLabels,
} from './TransactionRow';

interface TransactionListProps {
  transactions: readonly SponsorTransaction[];
  labels: TransactionCopyLabels;
  emptyState: {
    title: string;
    description: string;
  };
  loading?: boolean;
}

function TransactionList({
  transactions,
  labels,
  emptyState,
  loading = false,
}: TransactionListProps) {
  const columns: ReadonlyArray<DataTableColumn<SponsorTransaction>> = [
    {
      key: 'id',
      header: labels.columns.transaction,
      cell: (transaction) => <TransactionRow transaction={transaction} labels={labels} variant="table" />,
      className: 'w-[34%] min-w-[220px]',
    },
    {
      key: 'amountKobo',
      header: labels.columns.amount,
      cell: (transaction) => <TransactionAmount transaction={transaction} />,
      className: 'w-[16%] whitespace-nowrap',
    },
    {
      key: 'createdAt',
      header: labels.columns.date,
      cell: (transaction) => (
        <TimestampLabel value={transaction.createdAt} mode="absolute" locale="en-NG" className="text-sm" />
      ),
      className: 'w-[20%] whitespace-nowrap',
    },
    {
      key: 'status',
      header: labels.columns.status,
      cell: (transaction) => (
        <TransactionStatusPill
          status={transaction.status}
          label={labels.statuses[transaction.status]}
        />
      ),
      className: 'w-[14%] whitespace-nowrap',
    },
    {
      key: 'reference',
      header: labels.columns.reference,
      cell: (transaction) => (
        <span className="text-xs text-muted-foreground dark:text-muted-foreground">
          {transaction.reference ?? labels.referenceFallback}
        </span>
      ),
      className: 'w-[16%] whitespace-nowrap',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        <DataTableShell columns={columns} rows={[]} loading />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        heading={emptyState.title}
        body={emptyState.description}
        className="rounded-xl border border-border bg-card dark:border-border dark:bg-card"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden md:block">
        <DataTableShell columns={columns} rows={transactions} />
      </div>

      <div className="space-y-3 md:hidden">
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            labels={labels}
            variant="card"
          />
        ))}
      </div>
    </div>
  );
}

export { TransactionList };
export type { TransactionListProps };
