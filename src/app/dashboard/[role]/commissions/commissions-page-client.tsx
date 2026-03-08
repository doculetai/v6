'use client';

import { ArrowCircleUp, WarningCircle } from '@phosphor-icons/react';

import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import type { agentCopy } from '@/config/copy/agent';
import { trpc } from '@/trpc/client';
import { cn, formatNGN } from '@/lib/utils';

import {
  type AgentCommission,
  formatDate,
  statusBadgeClass,
} from '../_components/agent-commission-shared';

// ── Types ─────────────────────────────────────────────────────────────────────

type Commission = AgentCommission;

type Props = {
  commissions: Commission[] | null;
  copy: typeof agentCopy.commissions;
};

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
  const requestPayoutMutation = trpc.agent.requestPayout.useMutation();

  const hasPending =
    commissions !== null && commissions.some((c) => c.status === 'pending');

  if (commissions === null) {
    return (
      <div className="space-y-6">
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12 text-center">
          <WarningCircle
            weight="duotone"
            size={32}
            className="text-destructive/60"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{copy.error.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        {hasPending && (
          <button
            type="button"
            onClick={() => requestPayoutMutation.mutate()}
            disabled={requestPayoutMutation.isPending}
            className={cn(
              'inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground',
              'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <ArrowCircleUp weight="duotone" size={20} aria-hidden="true" />
            {requestPayoutMutation.isPending ? copy.payoutDialog.confirmCta : copy.requestPayout}
          </button>
        )}
      </div>

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
