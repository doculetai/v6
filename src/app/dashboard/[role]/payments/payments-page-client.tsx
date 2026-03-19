'use client';

import { useState } from 'react';

import { CurrencyCircleDollar, Funnel } from '@/components/icons';

import { Grid, PageShell } from '@/components/layout/content-primitives';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import { adminCopy } from '@/config/copy/admin';
import { trpc } from '@/trpc/client';

type TransactionRow = {
  id: string;
  type: string;
  entityType: string;
  entityId: string | null;
  amountKobo: number;
  currency: string;
  userId: string | null;
  meta: string | null;
  createdAt: Date;
};

type TransactionType = 'disbursement' | 'platform_fee' | 'refund' | 'reversal' | 'credit' | 'debit';

interface PaymentsPageClientProps {
  initialTransactions: TransactionRow[];
}

const ledgerCopy = adminCopy.ledger;
const paymentsCopy = adminCopy.payments;

const TRANSACTION_TYPES: TransactionType[] = [
  'disbursement',
  'platform_fee',
  'refund',
  'reversal',
  'credit',
  'debit',
];

function isTransactionType(value: string): value is TransactionType {
  return (TRANSACTION_TYPES as readonly string[]).includes(value);
}

function formatKobo(kobo: number, currency: string): string {
  const amount = kobo / 100;
  if (currency === 'NGN') {
    return `\u20A6${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function TypeBadge({ type }: { type: string }) {
  const label = isTransactionType(type)
    ? ledgerCopy.types[type]
    : type;

  const styles: Record<string, string> = {
    disbursement: 'bg-primary/10 text-primary border-primary/20',
    platform_fee: 'bg-muted text-muted-foreground border-border',
    refund: 'bg-destructive/10 text-destructive border-destructive/20',
    reversal: 'bg-destructive/10 text-destructive border-destructive/20',
    credit: 'bg-success/10 text-success border-success/20',
    debit: 'bg-primary/10 text-primary border-primary/20',
  };

  const style = styles[type] ?? 'bg-muted text-muted-foreground border-border';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function TransactionTableRow({ tx }: { tx: TransactionRow }) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <TypeBadge type={tx.type} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {tx.entityType}
        {tx.entityId ? (
          <span className="ml-1 text-xs text-muted-foreground/60">
            ({tx.entityId.slice(0, 8)})
          </span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground font-mono">
        {formatKobo(tx.amountKobo, tx.currency)}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{tx.currency}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(tx.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

function TransactionCard({ tx }: { tx: TransactionRow }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <TypeBadge type={tx.type} />
        <span className="text-sm font-medium text-foreground font-mono">
          {formatKobo(tx.amountKobo, tx.currency)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {tx.entityType}
        {tx.entityId ? ` (${tx.entityId.slice(0, 8)})` : ''}
      </p>
      <p className="text-xs text-muted-foreground">
        {new Date(tx.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export function PaymentsPageClient({ initialTransactions }: PaymentsPageClientProps) {
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(undefined);

  const { data: transactions = initialTransactions, isLoading } =
    trpc.admin.listTransactions.useQuery(
      { type: typeFilter, limit: 50 },
      { initialData: !typeFilter ? initialTransactions : undefined },
    );

  // Compute summary metrics from current data
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amountKobo, 0);
  const disbursementCount = transactions.filter((tx) => tx.type === 'disbursement').length;
  const refundCount = transactions.filter(
    (tx) => tx.type === 'refund' || tx.type === 'reversal',
  ).length;

  return (
    <PageShell>
      {/* Summary metrics */}
      <Grid cols={{ sm: 2, lg: 4 }} gap="sm">
        <MetricCard
          label={paymentsCopy.title}
          value={transactions.length}
          loading={isLoading}
        />
        <MetricCard
          label={ledgerCopy.types.disbursement}
          value={disbursementCount}
          loading={isLoading}
        />
        <MetricCard
          label={ledgerCopy.types.refund}
          value={refundCount}
          loading={isLoading}
        />
        <MetricCard
          label={ledgerCopy.table.amount}
          value={formatKobo(totalVolume, 'NGN')}
          loading={isLoading}
        />
      </Grid>

      {/* Type filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Funnel className="size-4 text-muted-foreground" weight="duotone" aria-hidden="true" />
        <Button
          variant={typeFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTypeFilter(undefined)}
        >
          {ledgerCopy.filters.type}: All
        </Button>
        {TRANSACTION_TYPES.map((t) => (
          <Button
            key={t}
            variant={typeFilter === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter(t)}
          >
            {ledgerCopy.types[t]}
          </Button>
        ))}
      </div>

      {/* Empty state */}
      {!isLoading && transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
          <CurrencyCircleDollar className="size-10 text-muted-foreground/50" weight="duotone" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">{paymentsCopy.empty.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{paymentsCopy.empty.description}</p>
          </div>
        </div>
      ) : null}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/40" />
          ))}
        </div>
      ) : null}

      {/* Desktop table */}
      {!isLoading && transactions.length > 0 ? (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {ledgerCopy.table.type}
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {ledgerCopy.table.entity}
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {ledgerCopy.table.amount}
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {ledgerCopy.table.currency}
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {ledgerCopy.table.date}
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <TransactionTableRow key={tx.id} tx={tx} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Mobile cards */}
      {!isLoading && transactions.length > 0 ? (
        <ul role="list" className="grid gap-3 md:hidden">
          {transactions.map((tx) => (
            <li key={tx.id}>
              <TransactionCard tx={tx} />
            </li>
          ))}
        </ul>
      ) : null}
    </PageShell>
  );
}
