'use client';

import { AlertCircle } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import type { agentCopy } from '@/config/copy/agent';
import { cn, formatNGN } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Commission = {
  id: string;
  amountKobo: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
};

type Props = {
  commissions: Commission[] | null;
  copy: typeof agentCopy.commissions;
};

// ── Status badge ──────────────────────────────────────────────────────────────

const statusBadgeClass: Record<Commission['status'], string> = {
  paid: 'bg-primary/10 text-primary',
  processing: 'bg-warning/10 text-warning',
  pending: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function CommissionCard({
  commission,
  copy,
}: {
  commission: Commission;
  copy: Props['copy'];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-foreground">
          {commission.description ?? copy.table.event}
        </p>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
            statusBadgeClass[commission.status],
          )}
        >
          {copy.statusLabels[commission.status]}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.amount}</dt>
          <dd className="font-mono font-medium text-foreground">
            {formatNGN(commission.amountKobo)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.date}</dt>
          <dd className="text-muted-foreground">{formatDate(commission.createdAt)}</dd>
        </div>
      </dl>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommissionsPageClient({ commissions, copy }: Props) {
  if (commissions === null) {
    return (
      <div className="space-y-6">
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12 text-center">
          <AlertCircle className="size-8 text-destructive/60" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{copy.error.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {commissions.length === 0 ? (
        <EmptyState heading={copy.empty.title} body={copy.empty.description} />
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            {commissions.map((commission) => (
              <CommissionCard key={commission.id} commission={commission} copy={copy} />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.event}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    {copy.table.amount}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.status}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.date}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commissions.map((commission) => (
                  <tr
                    key={commission.id}
                    className="bg-card transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {commission.description ?? '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-foreground">
                      {formatNGN(commission.amountKobo)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          statusBadgeClass[commission.status],
                        )}
                      >
                        {copy.statusLabels[commission.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(commission.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
