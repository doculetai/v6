'use client';

import type { inferRouterOutputs } from '@trpc/server';

import type { ActivityTimelineItem, ActivityTone } from '@/components/ui/activity-timeline';
import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { Card, CardContent } from '@/components/ui/card';
import { agentCopy } from '@/config/copy/agent';
import type { AgentActivityActionType } from '@/db/schema';
import type { AppRouter } from '@/server/root';

type RouterOutput = inferRouterOutputs<AppRouter>;
type ActivityData = RouterOutput['agent']['getActivity'];

const actionTones: Record<AgentActivityActionType, ActivityTone> = {
  claimed_student: 'success',
  sent_reminder: 'info',
  reviewed_document: 'neutral',
  flagged_issue: 'warning',
};

type ActivityPageClientProps = {
  data: ActivityData;
};

export function ActivityPageClient({ data }: ActivityPageClientProps) {
  const copy = agentCopy.activity;

  const timelineItems: ActivityTimelineItem[] = data.items.map((item) => ({
    id: item.id,
    title: copy.actionLabels[item.actionType],
    description: item.details ?? undefined,
    timestamp: item.createdAt,
    tone: actionTones[item.actionType],
  }));

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground dark:text-foreground md:text-3xl">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
          {copy.subtitle}
        </p>
      </div>
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardContent className="pt-6">
          <ActivityTimeline items={timelineItems} emptyLabel={copy.empty.description} />
        </CardContent>
      </Card>
    </section>
  );
}
