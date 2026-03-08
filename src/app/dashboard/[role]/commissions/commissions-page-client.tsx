'use client';

import { useState } from 'react';
import { Certificate, Money, WarningCircle } from '@/components/icons';

import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import type { agentCopy } from '@/config/copy/agent';
import { agentCopy as agentCopyData } from '@/config/copy/agent';
import { cn, formatNGN } from '@/lib/utils';
import { trpc } from '@/trpc/client';

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
  selected,
  onToggle,
}: {
  commission: Commission;
  copy: Props['copy'];
  selected: boolean;
  onToggle: () => void;
}) {
  const isPending = commission.status === 'pending';

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 space-y-3 transition-colors',
        isPending && selected ? 'border-primary/50 bg-primary/5' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isPending && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              aria-label={`Select commission from ${formatDate(commission.createdAt)}`}
              className="size-4 shrink-0 rounded border-border accent-primary"
            />
          )}
          <p className="truncate text-sm font-medium text-foreground">
            {commission.description ?? copy.table.event}
          </p>
        </div>
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

      {commission.certIssued && (
        <div className="flex items-center gap-1.5 text-xs text-primary">
          <Certificate size={14} weight="duotone" aria-hidden="true" />
          <span>{copy.eventLabels.certificateIssued}</span>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommissionsPageClient({ commissions: initialCommissions, copy }: Props) {
  const [commissions, setCommissions] = useState<Commission[] | null>(initialCommissions);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const requestPayout = trpc.agent.requestPayout.useMutation({
    onSuccess: (result) => {
      setSelectedIds(new Set());
      setPayoutSuccess(true);
      setPayoutError(null);
      // Optimistically transition selected commissions to 'processing'
      setCommissions((prev) =>
        prev === null
          ? null
          : prev.map((c) =>
              selectedIds.has(c.id) && c.status === 'pending'
                ? { ...c, status: 'processing' as const }
                : c,
            ),
      );
      void result;
    },
    onError: (err) => {
      setPayoutError(err.message);
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (commissions === null) {
    return (
      <PageShell>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12 text-center">
          <WarningCircle weight="duotone" className="size-8 text-destructive/60" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">{copy.error.title}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{copy.error.description}</p>
        </div>
      </PageShell>
    );
  }

  const pendingCommissions = commissions.filter((c) => c.status === 'pending');
  const pendingTotalKobo = pendingCommissions.reduce((sum, c) => sum + c.amountKobo, 0);
  const hasSelected = selectedIds.size > 0;

  return (
    <PageShell>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {commissions.length === 0 ? (
        <EmptyState
          heading={agentCopyData.emptyStates.commissions.heading}
          body={agentCopyData.emptyStates.commissions.body}
          illustration={
            <Money size={32} weight="duotone" className="text-muted-foreground/50" />
          }
        />
      ) : (
        <>
          {/* Payout summary bar */}
          {pendingCommissions.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">{copy.payoutDialog.amountLabel}</p>
                <p className="font-mono text-sm font-medium text-foreground">
                  {formatNGN(pendingTotalKobo)}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  disabled={!hasSelected || requestPayout.isPending}
                  onClick={() => {
                    setPayoutError(null);
                    setPayoutSuccess(false);
                    requestPayout.mutate({ commissionIds: [...selectedIds] });
                  }}
                  className={cn(
                    'min-h-[44px] rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    hasSelected && !requestPayout.isPending
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'cursor-not-allowed bg-muted text-muted-foreground',
                  )}
                >
                  {requestPayout.isPending ? copy.requestingPayout : copy.requestPayout}
                </button>
                {!hasSelected && (
                  <p className="text-xs text-muted-foreground">
                    {copy.payoutSelectHint}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {payoutSuccess && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              {copy.payoutSuccess}
            </div>
          )}
          {payoutError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {payoutError}
            </div>
          )}

          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            {commissions.map((commission) => (
              <CommissionCard
                key={commission.id}
                commission={commission}
                copy={copy}
                selected={selectedIds.has(commission.id)}
                onToggle={() => toggleSelect(commission.id)}
              />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-10 px-4 py-3" aria-label="Select" />
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.student}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.date}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    {copy.table.amount}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.status}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commissions.map((commission) => (
                  <tr
                    key={commission.id}
                    className={cn(
                      'transition-colors',
                      commission.status === 'pending' && selectedIds.has(commission.id)
                        ? 'bg-primary/5'
                        : 'bg-card hover:bg-muted/30',
                    )}
                  >
                    <td className="px-4 py-3">
                      {commission.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(commission.id)}
                          onChange={() => toggleSelect(commission.id)}
                          aria-label={`Select commission from ${formatDate(commission.createdAt)}`}
                          className="size-4 rounded border-border accent-primary"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      <div className="flex flex-col gap-1">
                        <span>{commission.description ?? '\u2014'}</span>
                        {commission.certIssued && (
                          <span className="inline-flex items-center gap-1 text-xs text-primary">
                            <Certificate size={12} weight="duotone" aria-hidden="true" />
                            {copy.eventLabels.certificateIssued}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(commission.paidAt ?? commission.createdAt)}
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
                        {commission.status === 'pending'
                          ? agentCopyData.commissionRow.pending
                          : commission.status === 'paid'
                            ? agentCopyData.commissionRow.paid
                            : copy.statusLabels[commission.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
