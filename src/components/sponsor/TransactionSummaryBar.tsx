import { Clock3, Wallet } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { MoneyValue } from '@/components/ui/money-value';
import { TimestampLabel } from '@/components/ui/timestamp-label';
import type { SponsorTransactionSummary } from '@/types/sponsor-transactions';

interface TransactionSummaryBarProps {
  summary: SponsorTransactionSummary;
  labels: {
    totalSpent: string;
    totalPending: string;
    lastUpdated: string;
  };
}

function SummaryValue({ amountKobo }: { amountKobo: number }) {
  return (
    <p className="inline-flex items-center gap-1 text-2xl font-semibold tracking-tight text-foreground dark:text-foreground">
      <span aria-hidden="true">₦</span>
      <MoneyValue amountMinor={amountKobo} showCode={false} />
    </p>
  );
}

function TransactionSummaryBar({ summary, labels }: TransactionSummaryBarProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="border-border bg-card shadow-sm dark:border-border dark:bg-card">
        <CardContent className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">{labels.totalSpent}</p>
              <SummaryValue amountKobo={summary.totalSpentKobo} />
            </div>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
              <Wallet className="size-5" aria-hidden="true" />
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm dark:border-border dark:bg-card">
        <CardContent className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">{labels.totalPending}</p>
              <SummaryValue amountKobo={summary.totalPendingKobo} />
            </div>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground dark:bg-secondary/80 dark:text-secondary-foreground">
              <Clock3 className="size-5" aria-hidden="true" />
            </span>
          </div>

          <p className="mt-3 text-xs text-muted-foreground dark:text-muted-foreground">
            {labels.lastUpdated}{' '}
            <TimestampLabel value={summary.updatedAt} mode="absolute" locale="en-NG" className="text-xs" />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export { TransactionSummaryBar };
export type { TransactionSummaryBarProps };
