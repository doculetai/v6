'use client';

import Link from 'next/link';
import { WarningCircle, Eye } from '@/components/icons';

import {
  EmptyState,
  Grid,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { cn, formatNGN } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

// ── Types ─────────────────────────────────────────────────────────────────────

type Copy = (typeof sponsorCopy)['commitments'];
type CommitmentStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'withdrawn';

type Commitment = {
  id: string;
  studentEmail: string | null;
  amountKobo: number;
  currency: string;
  status: CommitmentStatus;
  createdAt: Date;
};

// ── Status badge ──────────────────────────────────────────────────────────────

const statusBadgeClass: Record<CommitmentStatus, string> = {
  pending: 'bg-warning/10 text-warning',
  active: 'bg-success/10 text-success',
  completed: 'bg-primary/10 text-primary',
  cancelled: 'bg-muted text-muted-foreground',
  withdrawn: 'bg-muted text-muted-foreground',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function CommitmentCard({
  commitment,
  copy,
}: {
  commitment: Commitment;
  copy: Copy;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-foreground">
          {commitment.studentEmail ?? '\u2014'}
        </p>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
            statusBadgeClass[commitment.status],
          )}
        >
          {copy.statusLabels[commitment.status]}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.amount}</dt>
          <dd className="font-mono font-medium text-foreground">
            {formatNGN(commitment.amountKobo)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.since}</dt>
          <dd className="text-muted-foreground">{formatDate(commitment.createdAt)}</dd>
        </div>
      </dl>

      <Button variant="ghost" size="sm" asChild className="w-full">
        <Link href={`/dashboard/sponsor/students/${commitment.id}`}>
          <Eye className="mr-2 size-4" weight="duotone" aria-hidden="true" />
          {copy.table.student}
        </Link>
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommitmentsPageClient({ copy }: { copy: Copy }) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const {
    data: commitments,
    isPending,
    isError,
  } = trpc.sponsor.listCommitments.useQuery();

  if (isPending) {
    return (
      <PageShell width="default">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
          <Stack gap="sm">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border border-border bg-muted/40"
              />
            ))}
          </Stack>
        </Section>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell width="default">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12 text-center">
            <WarningCircle
              className="size-8 text-destructive/60"
              weight="duotone"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground">
              {copy.empty.title}
            </p>
          </div>
        </Section>
      </PageShell>
    );
  }

  if (!commitments || commitments.length === 0) {
    return (
      <PageShell width="default">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
          <EmptyState
            title={copy.empty.title}
            description={copy.empty.description}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href={routes.dashboard.sponsor.students}>View students</Link>
              </Button>
            }
          />
        </Section>
      </PageShell>
    );
  }

  return (
    <PageShell width="default">
      <Section>
        <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />

        {/* Mobile: stacked cards */}
        <div className="space-y-3 md:hidden">
          {commitments.map((c) => (
            <CommitmentCard key={c.id} commitment={c} copy={copy} />
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.table.student}
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  {copy.table.amount}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.table.status}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.table.since}
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {commitments.map((c) => (
                <tr
                  key={c.id}
                  className="bg-card transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-foreground">
                    {c.studentEmail ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-foreground">
                    {formatNGN(c.amountKobo)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        statusBadgeClass[c.status],
                      )}
                    >
                      {copy.statusLabels[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/sponsor/students/${c.id}`}>
                        <Eye className="size-4" weight="duotone" aria-hidden="true" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </PageShell>
  );
}
