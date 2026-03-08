'use client';

import { ChartLine, Pulse, WarningCircle } from '@/components/icons';

import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader, PageShell } from '@/components/layout/content-primitives';
import type { agentCopy } from '@/config/copy/agent';

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivityItem = {
  id: string;
  studentId: string;
  studentName: string;
  eventType: string;
  eventLabel: string;
  createdAt: Date;
};

type Props = {
  items: ActivityItem[] | null;
  copy: typeof agentCopy.activity;
};

// ── Time formatting ────────────────────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diffMs = now - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Activity row ──────────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Pulse weight="duotone" className="size-4 text-primary" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.studentName}</p>
        <p className="text-sm text-muted-foreground">{item.eventLabel}</p>
      </div>

      <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {formatTimeAgo(item.createdAt)}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActivityPageClient({ items, copy }: Props) {
  if (items === null) {
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

  return (
    <PageShell>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {items.length === 0 ? (
        <EmptyState
          heading={copy.empty.title}
          body={copy.empty.description}
          illustration={
            <ChartLine size={32} weight="duotone" className="text-muted-foreground/50" />
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
