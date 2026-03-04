import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgePercent,
  RotateCcw,
} from 'lucide-react';

import { MoneyValue } from '@/components/ui/money-value';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import { cn } from '@/lib/utils';
import type {
  SponsorTransaction,
  SponsorTransactionSource,
  SponsorTransactionStatus,
  SponsorTransactionType,
} from '@/types/sponsor-transactions';

type TransactionCopyLabels = {
  types: Record<SponsorTransactionType, string>;
  statuses: Record<SponsorTransactionStatus, string>;
  sources: Record<SponsorTransactionSource, string>;
  columns: {
    transaction: string;
    amount: string;
    date: string;
    status: string;
    reference: string;
  };
  referenceFallback: string;
};

type TransactionRowVariant = 'table' | 'card';

interface TransactionRowProps {
  transaction: SponsorTransaction;
  labels: TransactionCopyLabels;
  variant?: TransactionRowVariant;
  className?: string;
}

function isOutflow(type: SponsorTransactionType): boolean {
  return type === 'debit' || type === 'fee';
}

function typeIcon(type: SponsorTransactionType) {
  if (type === 'credit') {
    return <ArrowDownCircle className="size-5" aria-hidden="true" />;
  }

  if (type === 'debit') {
    return <ArrowUpCircle className="size-5" aria-hidden="true" />;
  }

  if (type === 'fee') {
    return <BadgePercent className="size-5" aria-hidden="true" />;
  }

  return <RotateCcw className="size-5" aria-hidden="true" />;
}

function typeIconClass(type: SponsorTransactionType): string {
  if (type === 'credit') {
    return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary';
  }

  if (type === 'debit') {
    return 'bg-accent text-accent-foreground dark:bg-accent/80 dark:text-accent-foreground';
  }

  if (type === 'fee') {
    return 'bg-muted text-muted-foreground dark:bg-muted/80 dark:text-muted-foreground';
  }

  return 'bg-secondary text-secondary-foreground dark:bg-secondary/80 dark:text-secondary-foreground';
}

function statusClass(status: SponsorTransactionStatus): string {
  if (status === 'successful') {
    return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary';
  }

  if (status === 'pending') {
    return 'bg-muted text-muted-foreground dark:bg-muted/80 dark:text-muted-foreground';
  }

  if (status === 'failed') {
    return 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive';
  }

  return 'bg-secondary text-secondary-foreground dark:bg-secondary/80 dark:text-secondary-foreground';
}

function TransactionStatusPill({
  status,
  label,
}: {
  status: SponsorTransactionStatus;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusClass(status),
      )}
    >
      {label}
    </span>
  );
}

function TransactionAmount({ transaction }: { transaction: SponsorTransaction }) {
  const outflow = isOutflow(transaction.type);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-sm font-semibold',
        outflow
          ? 'text-foreground dark:text-foreground'
          : 'text-primary dark:text-primary',
      )}
    >
      <span aria-hidden="true">{outflow ? '-' : '+'}</span>
      <span aria-hidden="true">₦</span>
      <MoneyValue amountMinor={transaction.amountKobo} showCode={false} />
    </span>
  );
}

function TransactionRow({
  transaction,
  labels,
  variant = 'table',
  className,
}: TransactionRowProps) {
  const reference = transaction.reference ?? labels.referenceFallback;

  if (variant === 'table') {
    return (
      <div className={cn('flex min-w-0 items-center gap-3', className)}>
        <span
          className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-full',
            typeIconClass(transaction.type),
          )}
        >
          {typeIcon(transaction.type)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground dark:text-foreground">
            {labels.types[transaction.type]}
          </p>
          <p className="truncate text-xs text-muted-foreground dark:text-muted-foreground">
            {labels.sources[transaction.source]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <article
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-sm dark:border-border dark:bg-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
              typeIconClass(transaction.type),
            )}
          >
            {typeIcon(transaction.type)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground dark:text-foreground">
              {labels.types[transaction.type]}
            </p>
            <p className="truncate text-xs text-muted-foreground dark:text-muted-foreground">
              {labels.sources[transaction.source]}
            </p>
          </div>
        </div>

        <TransactionStatusPill
          status={transaction.status}
          label={labels.statuses[transaction.status]}
        />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
            {labels.columns.amount}
          </span>
          <TransactionAmount transaction={transaction} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
            {labels.columns.date}
          </span>
          <TimestampLabel
            className="text-sm text-foreground dark:text-foreground"
            value={transaction.createdAt}
            mode="absolute"
            locale="en-NG"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
            {labels.columns.reference}
          </span>
          <span className="truncate text-right text-xs font-medium text-muted-foreground dark:text-muted-foreground">
            {reference}
          </span>
        </div>
      </div>
    </article>
  );
}

export { TransactionAmount, TransactionRow, TransactionStatusPill };
export type { TransactionCopyLabels, TransactionRowProps };
