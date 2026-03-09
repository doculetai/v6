'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowLeft, CircleNotch, GraduationCap, HandCoins } from '@/components/icons';

import {
  Container,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoneyValue } from '@/components/ui/money-value';
import { sponsorCopy as sponsorCopyData } from '@/config/copy/sponsor';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { formatNGN } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

type Detail = {
  sponsorshipId: string;
  studentId: string;
  studentEmail: string | null;
  amountKobo: number;
  currency: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'withdrawn' | 'paused';
  createdAt: Date;
  schoolName: string | null;
  programName: string | null;
  tuitionAmount: number | null;
  durationMonths: number | null;
  disbursements: Array<{
    id: string;
    amountKobo: number;
    scheduledAt: Date;
    disbursedAt: Date | null;
    status: 'scheduled' | 'processing' | 'disbursed' | 'failed';
  }>;
  nextScheduledDisbursementId: string | null;
};
type Copy = (typeof sponsorCopy)['studentDetail'];

type Props = {
  detail: Detail;
  copy: Copy;
  disbursementCopy: { actions: { pay: string; payingCta: string } };
};

function buildTimelineItems(detail: Detail, copy: Copy) {
  const timelineCopy = sponsorCopyData.studentDetail.timeline;
  const items: { id: string; title: string; description?: string; timestamp: string; tone?: 'success' | 'neutral' | 'error' }[] = [];

  items.push({
    id: 'sponsorship',
    title: copy.statusLabels.pending,
    description: timelineCopy.committed(formatNGN(detail.amountKobo)),
    timestamp: detail.createdAt.toISOString(),
    tone: 'neutral',
  });

  for (const d of detail.disbursements) {
    if (d.status === 'disbursed') {
      items.push({
        id: d.id,
        title: timelineCopy.disbursementCompleted,
        description: timelineCopy.sent(formatNGN(d.amountKobo)),
        timestamp: (d.disbursedAt ?? d.scheduledAt).toISOString(),
        tone: 'success',
      });
    } else if (d.status === 'failed') {
      items.push({
        id: d.id,
        title: timelineCopy.disbursementFailed,
        description: formatNGN(d.amountKobo),
        timestamp: d.scheduledAt.toISOString(),
        tone: 'error',
      });
    } else {
      items.push({
        id: d.id,
        title: d.status === 'processing' ? timelineCopy.processing : timelineCopy.scheduled,
        description: formatNGN(d.amountKobo),
        timestamp: d.scheduledAt.toISOString(),
        tone: 'neutral',
      });
    }
  }

  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function SponsorStudentDetailClient({ detail, copy, disbursementCopy }: Props) {
  const router = useRouter();
  const initiateMutation = trpc.sponsor.initiateDisbursement.useMutation({
    onSuccess: () => router.refresh(),
  });

  const timelineItems = buildTimelineItems(detail, copy);
  const nextDisbursement = detail.nextScheduledDisbursementId
    ? detail.disbursements.find((d) => d.id === detail.nextScheduledDisbursementId)
    : null;

  return (
    <PageShell width="wide">
      <Stack gap="md">
        <PageHeader
          title={detail.studentEmail ?? copy.subtitle}
          description={copy.subtitle}
          breadcrumbs={[
            { href: routes.dashboard.sponsor.students, label: 'Students' },
            { label: detail.studentEmail ?? 'Student' },
          ]}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href={routes.dashboard.sponsor.students}>
                <ArrowLeft weight="duotone" className="size-4" aria-hidden />
                {copy.backToStudents}
              </Link>
            </Button>
          }
        />

        <Section>
          <Container width="md">
            <Stack gap="md">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">{copy.sections.profile}</CardTitle>
                  <CardDescription>{copy.sections.school}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap weight="duotone" className="size-5 text-muted-foreground" aria-hidden />
                    <span className="text-foreground">
                      {detail.schoolName ?? '—'} · {detail.programName ?? '—'}
                    </span>
                  </div>
                  {detail.tuitionAmount != null && detail.durationMonths != null ? (
                    <p className="text-sm text-muted-foreground">
                      {sponsorCopyData.studentDetail.timeline.tuition(
                        formatNGN(detail.tuitionAmount),
                        detail.durationMonths,
                      )}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {copy.sections.fundingRequirements}
                    </span>
                    <MoneyValue amountMinor={detail.amountKobo} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">{copy.sections.status}</CardTitle>
                  <CardDescription>{sponsorCopyData.studentDetail.timeline.heading}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ActivityTimeline
                    items={timelineItems.map((i) => ({
                      id: i.id,
                      title: i.title,
                      description: i.description,
                      timestamp: new Date(i.timestamp).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      tone: i.tone,
                    }))}
                  />

                  {nextDisbursement ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{copy.nextDisbursement}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNGN(nextDisbursement.amountKobo)} ·{' '}
                          {new Date(nextDisbursement.scheduledAt).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={initiateMutation.isPending}
                        onClick={() =>
                          initiateMutation.mutate({
                            disbursementId: nextDisbursement.id,
                          })
                        }
                      >
                        {initiateMutation.isPending ? (
                          <>
                            <CircleNotch weight="duotone" className="size-4 animate-spin" aria-hidden />
                            {disbursementCopy.actions.payingCta}
                          </>
                        ) : (
                          <>
                            <HandCoins weight="duotone" className="size-4" aria-hidden />
                            {disbursementCopy.actions.pay}
                          </>
                        )}
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </Stack>
          </Container>
        </Section>
      </Stack>
    </PageShell>
  );
}
