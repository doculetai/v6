import {
  ClipboardText,
  CheckCircle,
  Warning,
  ShieldWarning,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { JourneyProgress } from '@/components/ui/journey-progress';
import { adminCopy } from '@/config/copy/admin';
import { computeAdminJourney } from '@/lib/journey/admin';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type AdminOverviewProps = {
  caller: Awaited<ReturnType<typeof api>>;
};

export async function AdminOverview({ caller }: AdminOverviewProps) {
  const copy = adminCopy.overview;

  const [statsResult, riskResult, queueResult] = await Promise.allSettled([
    caller.admin.getOperationsStats(),
    caller.admin.getRiskFlags(),
    caller.admin.getOperationsQueue({ limit: 5 }),
  ]);

  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;
  const riskFlags = riskResult.status === 'fulfilled' ? riskResult.value : [];
  const recentQueue = queueResult.status === 'fulfilled' ? queueResult.value : [];

  const journeyState = computeAdminJourney(
    {
      pendingReviews: stats?.pending ?? 0,
      flaggedItems: riskFlags.length,
    },
    adminCopy.journey,
  );

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={copy.welcomeTitle}
          description={copy.subtitle}
        />

        <JourneyProgress
          stages={journeyState.stages}
          nextAction={journeyState.nextAction}
          allComplete={journeyState.allComplete}
          completionMessage={journeyState.completionMessage}
        />

        <Grid cols={{ sm: 2, lg: 4 }} gap="md" className="mt-6">
          <StatCard
            icon={<ClipboardText className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.pendingReview.label}
            value={stats ? String(stats.pending) : '—'}
            sub={copy.stats.pendingReview.sub}
            accent={Boolean(stats?.pending)}
          />
          <StatCard
            icon={<CheckCircle className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.approvedToday.label}
            value={stats ? String(stats.approvedToday) : '—'}
            sub={copy.stats.approvedToday.sub}
          />
          <StatCard
            icon={<Warning className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.rejectedToday.label}
            value={stats ? String(stats.rejectedToday) : '—'}
            sub={copy.stats.rejectedToday.sub}
          />
          <StatCard
            icon={<ShieldWarning className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.riskFlags.label}
            value={String(riskFlags.length)}
            sub={copy.stats.riskFlags.sub}
            accent={riskFlags.length > 0}
          />
        </Grid>

        {recentQueue.length > 0 ? (
          <Stack gap="sm" className="mt-6">
            <h2 className="text-sm font-semibold text-foreground">
              {copy.recentOperations.heading}
            </h2>
            {recentQueue.slice(0, 5).map((item) => (
              <Card key={item.id} className="border-border bg-card">
                <CardContent className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.studentEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.type} · {item.status === 'more_info_requested'
                        ? adminCopy.operations.statusLabels.moreInfoRequested
                        : adminCopy.operations.statusLabels[item.status]}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat('en-NG', {
                      day: 'numeric',
                      month: 'short',
                    }).format(item.createdAt)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card className="border-border bg-card mt-6">
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{copy.recentOperations.empty}</p>
            </CardContent>
          </Card>
        )}

        <Button asChild className="min-h-11 w-full sm:w-auto mt-6">
          <Link href="/dashboard/admin/operations">{copy.recentOperations.viewAll}</Link>
        </Button>
      </Section>
    </PageShell>
  );
}
