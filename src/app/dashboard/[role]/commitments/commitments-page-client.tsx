'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, LockKey, PauseCircle, WarningCircle } from '@/components/icons';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  EmptyState,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { sponsorCopy as sponsorCopyData } from '@/config/copy/sponsor';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { cn, formatNGN } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

// ── Types ─────────────────────────────────────────────────────────────────────

type Copy = (typeof sponsorCopy)['commitments'];
type CommitmentStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'withdrawn' | 'paused';

type Commitment = {
  id: string;
  studentEmail: string | null;
  amountKobo: number;
  currency: string;
  status: CommitmentStatus;
  createdAt: Date;
};

type CommitmentAction =
  | { kind: 'confirm'; commitment: Commitment }
  | { kind: 'uncommit'; commitment: Commitment };

// ── Status badge ──────────────────────────────────────────────────────────────

const statusBadgeClass: Record<CommitmentStatus, string> = {
  pending: 'bg-warning/10 text-warning',
  active: 'bg-success/10 text-success',
  completed: 'bg-primary/10 text-primary',
  cancelled: 'bg-muted text-muted-foreground',
  withdrawn: 'bg-muted text-muted-foreground',
  paused: 'bg-warning/10 text-warning',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

// ── Commitment action cell ─────────────────────────────────────────────────────

function CommitmentActions({
  commitment,
  copy,
  onAction,
}: {
  commitment: Commitment;
  copy: Copy;
  onAction: (action: CommitmentAction) => void;
}) {
  const lockedPostCert = sponsorCopyData.commitment.lockedPostCert;

  if (commitment.status === 'completed') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <LockKey className="size-3.5 shrink-0" weight="duotone" aria-hidden="true" />
        {lockedPostCert}
      </span>
    );
  }

  const canUncommit =
    commitment.status === 'active' ||
    commitment.status === 'pending' ||
    commitment.status === 'paused';

  return (
    <div className="flex items-center justify-end gap-2">
      {commitment.status === 'pending' && (
        <Button
          size="sm"
          variant="default"
          onClick={() => onAction({ kind: 'confirm', commitment })}
        >
          {sponsorCopyData.commitment.confirmModal.confirm}
        </Button>
      )}
      {canUncommit && (
        <button
          type="button"
          className="text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          onClick={() => onAction({ kind: 'uncommit', commitment })}
        >
          {sponsorCopyData.commitment.uncommitModal.confirm}
        </button>
      )}
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/sponsor/students/${commitment.id}`}>
          <Eye className="size-4" weight="duotone" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function CommitmentCard({
  commitment,
  copy,
  onAction,
}: {
  commitment: Commitment;
  copy: Copy;
  onAction: (action: CommitmentAction) => void;
}) {
  const lockedPostCert = sponsorCopyData.commitment.lockedPostCert;
  const isLocked = commitment.status === 'completed';
  const canUncommit =
    !isLocked &&
    (commitment.status === 'active' ||
      commitment.status === 'pending' ||
      commitment.status === 'paused');

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

      <div className="flex items-center gap-2">
        {isLocked ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <LockKey className="size-3.5 shrink-0" weight="duotone" aria-hidden="true" />
            {lockedPostCert}
          </span>
        ) : (
          <>
            {commitment.status === 'pending' && (
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={() => onAction({ kind: 'confirm', commitment })}
              >
                {sponsorCopyData.commitment.confirmModal.confirm}
              </Button>
            )}
            {canUncommit && (
              <button
                type="button"
                className="text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                onClick={() => onAction({ kind: 'uncommit', commitment })}
              >
                {sponsorCopyData.commitment.uncommitModal.confirm}
              </button>
            )}
            <Button variant="ghost" size="sm" asChild className="ml-auto">
              <Link href={`/dashboard/sponsor/students/${commitment.id}`}>
                <Eye className="mr-2 size-4" weight="duotone" aria-hidden="true" />
                {copy.table.student}
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Paused commitment banner ──────────────────────────────────────────────────

function PausedCommitmentBanner({
  commitmentId,
  onResumed,
}: {
  commitmentId: string;
  onResumed: () => void;
}) {
  const pausedCopy = sponsorCopyData.commitmentPaused;
  const resumeMutation = trpc.sponsor.resumeCommitment.useMutation({
    onSuccess: onResumed,
  });

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5 min-w-0">
        <PauseCircle
          className="mt-0.5 size-5 shrink-0 text-warning"
          weight="duotone"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{pausedCopy.heading}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{pausedCopy.body}</p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0"
        disabled={resumeMutation.isPending}
        onClick={() => resumeMutation.mutate({ commitmentId })}
      >
        {resumeMutation.isPending ? pausedCopy.resumingCta : pausedCopy.resumeCta}
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommitmentsPageClient({ copy }: { copy: Copy }) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const utils = trpc.useUtils();
  const [activeAction, setActiveAction] = useState<CommitmentAction | null>(null);

  const {
    data: commitments,
    isPending,
    isError,
  } = trpc.sponsor.listCommitments.useQuery();

  const confirmMutation = trpc.sponsor.confirmCommitment.useMutation({
    onSuccess: () => {
      setActiveAction(null);
      void utils.sponsor.listCommitments.invalidate();
    },
  });

  const withdrawMutation = trpc.sponsor.withdrawCommitment.useMutation({
    onSuccess: () => {
      setActiveAction(null);
      void utils.sponsor.listCommitments.invalidate();
    },
  });

  const handleConfirm = () => {
    if (activeAction?.kind === 'confirm') {
      confirmMutation.mutate({ sponsorshipId: activeAction.commitment.id });
    }
    if (activeAction?.kind === 'uncommit') {
      withdrawMutation.mutate({ sponsorshipId: activeAction.commitment.id });
    }
  };

  const commitmentCopy = sponsorCopyData.commitment;

  const dialogTitle =
    activeAction?.kind === 'confirm'
      ? commitmentCopy.confirmModal.title
      : commitmentCopy.uncommitModal.title;

  const dialogBody =
    activeAction?.kind === 'confirm'
      ? commitmentCopy.confirmModal.body(
          formatNGN(activeAction.commitment.amountKobo),
          activeAction.commitment.studentEmail ?? 'this student',
        )
      : activeAction?.kind === 'uncommit'
        ? commitmentCopy.uncommitModal.body(
            formatNGN(activeAction.commitment.amountKobo),
            activeAction.commitment.studentEmail ?? 'this student',
          )
        : '';

  const dialogConfirmLabel =
    activeAction?.kind === 'confirm'
      ? commitmentCopy.confirmModal.confirm
      : commitmentCopy.uncommitModal.confirm;

  const dialogCancelLabel =
    activeAction?.kind === 'confirm'
      ? commitmentCopy.confirmModal.cancel
      : commitmentCopy.uncommitModal.cancel;

  const isDestructive = activeAction?.kind === 'uncommit';
  const isMutating = confirmMutation.isPending || withdrawMutation.isPending;

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
              {copy.loadError}
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
                <Link href={routes.dashboard.sponsor.students}>{copy.empty.viewStudents}</Link>
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

        {/* Confirm / un-commit AlertDialog */}
        <AlertDialog
          open={activeAction !== null}
          onOpenChange={(open) => { if (!open) setActiveAction(null); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
              <AlertDialogDescription>{dialogBody}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isMutating}>
                {dialogCancelLabel}
              </AlertDialogCancel>
              <AlertDialogAction
                className={
                  isDestructive
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : undefined
                }
                disabled={isMutating}
                onClick={handleConfirm}
              >
                {dialogConfirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Paused commitment banners */}
        {commitments
          .filter((c) => c.status === 'paused')
          .map((c) => (
            <PausedCommitmentBanner
              key={`paused-${c.id}`}
              commitmentId={c.id}
              onResumed={() => utils.sponsor.listCommitments.invalidate()}
            />
          ))}

        {/* Mobile: stacked cards */}
        <div className="space-y-3 md:hidden">
          {commitments.map((c) => (
            <CommitmentCard key={c.id} commitment={c} copy={copy} onAction={setActiveAction} />
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
                  <td className="px-4 py-3">
                    <CommitmentActions
                      commitment={c}
                      copy={copy}
                      onAction={setActiveAction}
                    />
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
