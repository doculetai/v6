'use client';

import { useState } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { cn, formatNGN } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Disbursement = {
  id: string;
  sponsorshipId: string;
  studentEmail: string | null;
  amountKobo: number;
  currency: string;
  scheduledAt: Date;
  disbursedAt: Date | null;
  status: 'scheduled' | 'processing' | 'disbursed' | 'failed';
  paystackReference: string | null;
};

type Copy = typeof sponsorCopy.disbursements;

type DisbursementsPageClientProps = {
  disbursements: Disbursement[];
  copy: Copy;
};

type FilterStatus = 'all' | Disbursement['status'];

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Disbursement['status'] }) {
  const classes: Record<Disbursement['status'], string> = {
    scheduled: 'bg-primary/10 text-primary',
    processing: 'bg-muted text-muted-foreground',
    disbursed: 'bg-primary/10 text-primary',
    failed: 'bg-destructive/10 text-destructive',
  };

  const labels: Record<Disbursement['status'], string> = {
    scheduled: 'Scheduled',
    processing: 'Processing',
    disbursed: 'Disbursed',
    failed: 'Failed',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        classes[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DisbursementsPageClient({ disbursements, copy }: DisbursementsPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  const filters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: copy.filterByStatus },
    { value: 'scheduled', label: copy.statusLabels.pending },
    { value: 'processing', label: copy.statusLabels.processing },
    { value: 'disbursed', label: copy.statusLabels.completed },
    { value: 'failed', label: copy.statusLabels.failed },
  ];

  const filtered =
    activeFilter === 'all'
      ? disbursements
      : disbursements.filter((d) => d.status === activeFilter);

  const isEmpty = filtered.length === 0;

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeFilter === filter.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {filter.value === 'all' ? 'All' : filter.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <EmptyState heading={copy.empty.title} body={copy.empty.description} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.table.student}
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  {copy.table.amount}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Scheduled
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.table.date}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.table.status}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id} className="bg-card transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-foreground">
                    {d.studentEmail ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {formatNGN(d.amountKobo)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(d.scheduledAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.disbursedAt ? (
                      new Date(d.disbursedAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
