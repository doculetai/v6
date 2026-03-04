'use client';

import { AlertCircle, TrendingUp } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import type { agentCopy } from '@/config/copy/agent';
import { cn, formatNGN } from '@/lib/utils';

import {
  type AgentCommission,
  formatDate,
  statusBadgeClass,
} from '../_components/agent-commission-shared';

// ── Types ─────────────────────────────────────────────────────────────────────

type CommissionEvent = AgentCommission;

type Props = {
  commissions: CommissionEvent[] | null;
  copy: typeof agentCopy.activity;
  commissionStatusLabels: typeof agentCopy.commissions.statusLabels;
}

// ── Activity item ─────────────────────────────────────────────────────────────

function ActivityItem({
  event,
  copy,
  commissionStatusLabels,
}: {
  event: CommissionEvent;
  copy: Props['copy'];
  commissionStatusLabels: Props['commissionStatusLabels'];
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <TrendingUp className="size-4 text-primary" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{copy.commissionLabel}</p>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              statusBadgeClass[event.status],
            )}
          >
            {commissionStatusLabels[event.status]}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {event.description ?? formatNGN(event.amountKobo)}
        </p>

        <p className="text-xs text-muted-foreground">
          {copy.dateLabel}: {formatDate(event.createdAt)}
        </p>
      </div>

      <p className="shrink-0 font-mono text-sm font-medium text-foreground">
        {formatNGN(event.amountKobo)}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActivityPageClient({ commissions, copy, commissionStatusLabels }: Props) {
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
        <div className="space-y-3">
          {commissions.map((event) => (
            <ActivityItem
              key={event.id}
              event={event}
              copy={copy}
              commissionStatusLabels={commissionStatusLabels}
            />
          ))}
        </div>
      )}
    </div>
  );
}
