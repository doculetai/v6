import { Clock3 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityTimeline, type ActivityTimelineItem } from '@/components/ui/activity-timeline';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

type SponsorRecentActivityProps = {
  items: ActivityTimelineItem[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
};

function ActivitySkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`activity-skeleton-${index}`} className="space-y-2 rounded-lg border bg-card p-3">
          <div className="h-4 w-40 animate-pulse rounded bg-muted/70" />
          <div className="h-3 w-full animate-pulse rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}

function SponsorRecentActivity({
  items,
  loading = false,
  className,
  maxItems = 5,
}: SponsorRecentActivityProps) {
  const copy = sponsorCopy.overview.recentActivity;
  const visibleItems = items.slice(0, maxItems);

  return (
    <Card className={cn('border-border bg-card dark:border-border dark:bg-card', className)}>
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg text-card-foreground dark:text-card-foreground md:text-xl">
          {copy.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {copy.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <ActivitySkeleton /> : null}

        {!loading && visibleItems.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border/80 bg-background/60 p-4 dark:border-border/60 dark:bg-background/40">
            <Clock3 className="size-5 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground dark:text-foreground">
                {copy.empty.heading}
              </p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                {copy.empty.description}
              </p>
            </div>
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/dashboard/sponsor/students">{copy.empty.cta}</Link>
            </Button>
          </div>
        ) : null}

        {!loading && visibleItems.length > 0 ? (
          <ActivityTimeline items={visibleItems} emptyLabel={copy.empty.heading} />
        ) : null}
      </CardContent>
    </Card>
  );
}

export { SponsorRecentActivity };
export type { SponsorRecentActivityProps };
