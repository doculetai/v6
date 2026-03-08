'use client';

import { WarningCircle } from '@phosphor-icons/react';

import { ActivityTimeline } from '@/components/ui/activity-timeline';
import type { ActivityTone, ActivityTimelineItem } from '@/components/ui/activity-timeline';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import type { agentCopy } from '@/config/copy/agent';

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivityEvent = {
  eventType: 'cert_issued' | 'doc_approved' | 'doc_rejected' | 'kyc_complete' | 'student_joined';
  studentId: string;
  studentEmail: string | null;
  description: string;
  occurredAt: Date;
};

type Props = {
  events: ActivityEvent[] | null;
  copy: typeof agentCopy.activity;
};

// ── Event tone mapping ─────────────────────────────────────────────────────────

const eventTone: Record<ActivityEvent['eventType'], ActivityTone> = {
  cert_issued: 'success',
  doc_approved: 'success',
  doc_rejected: 'error',
  kyc_complete: 'success',
  student_joined: 'info',
};

// ── Main component ────────────────────────────────────────────────────────────

export function ActivityPageClient({ events, copy }: Props) {
  if (events === null) {
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

  const timelineItems: ActivityTimelineItem[] = events.map((event, index) => ({
    id: `${event.studentId}-${event.eventType}-${index}`,
    title: event.description,
    description: event.studentEmail ?? undefined,
    timestamp: event.occurredAt.toISOString(),
    tone: eventTone[event.eventType],
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {events.length === 0 ? (
        <EmptyState heading={copy.empty.title} body={copy.empty.description} />
      ) : (
        <ActivityTimeline items={timelineItems} />
      )}
    </div>
  );
}
