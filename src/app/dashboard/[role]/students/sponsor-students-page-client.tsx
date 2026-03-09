'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleNotch } from '@/components/icons';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sponsorCopy as sponsorCopyData } from '@/config/copy/sponsor';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { formatNGN } from '@/lib/utils';
import { trpc } from '@/trpc/client';

const commitmentCopy = sponsorCopyData.commitment;

// ── Types ─────────────────────────────────────────────────────────────────────

type Invite = {
  id: string;
  studentId: string;
  studentEmail: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type SponsoredStudent = {
  id: string;
  studentId: string;
  studentEmail: string | null;
  amountKobo: number;
  currency: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'withdrawn' | 'paused';
  createdAt: Date;
};

type Copy = typeof sponsorCopy.students;

type SponsorStudentsPageClientProps = {
  invites: Invite[];
  students: SponsoredStudent[];
  copy: Copy;
};

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({
  status,
  labels,
}: {
  status: SponsoredStudent['status'];
  labels: Copy['statusLabels'];
}) {
  const label = labels[status];

  const className =
    status === 'active'
      ? 'bg-success/10 text-success border-0'
      : status === 'completed'
        ? 'bg-primary/10 text-primary border-0'
        : 'bg-muted text-muted-foreground border-0';

  return <Badge className={className}>{label}</Badge>;
}

// ── Pending invites list ──────────────────────────────────────────────────────

function PendingInvitesList({ invites, copy }: { invites: Invite[]; copy: Copy }) {
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [localInvites, setLocalInvites] = useState<Invite[]>(invites);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const respondMutation = trpc.sponsor.respondToInvite.useMutation({
    onSuccess: (_, variables) => {
      setLocalInvites((prev) =>
        prev.map((inv) =>
          inv.id === variables.inviteId ? { ...inv, status: variables.status } : inv,
        ),
      );
      void utils.sponsor.listPendingInvites.invalidate();
    },
    onError: () => {
      setInviteError(sponsorCopyData.studentDetail.errors.respondFailed);
    },
  });

  const pendingInvites = localInvites.filter((inv) => inv.status === 'pending');

  const handleRespond = (inviteId: string, status: 'accepted' | 'declined') => {
    setInviteError(null);
    setRespondingId(inviteId);
    respondMutation.mutate(
      { inviteId, status },
      { onSettled: () => setRespondingId(null) },
    );
  };

  if (pendingInvites.length === 0) {
    return (
      <EmptyState
        heading={copy.pending.empty.title}
        body={copy.pending.empty.description}
      />
    );
  }

  return (
    <div className="space-y-3">
      {inviteError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{inviteError}</p>
        </div>
      ) : null}
      {pendingInvites.map((invite) => {
        const isResponding = respondingId === invite.id;

        return (
          <Card key={invite.id} className="border-border bg-card">
            <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {invite.studentEmail}
                </p>
                <p className="text-xs text-muted-foreground">
                  {copy.pending.receivedLabel}:{' '}
                  {new Date(invite.createdAt).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                {invite.message ? (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{copy.pending.message}:</span>{' '}
                    {invite.message}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/60">{copy.pending.noMessage}</p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-[44px]"
                  disabled={isResponding}
                  onClick={() => handleRespond(invite.id, 'declined')}
                >
                  {isResponding ? (
                    <CircleNotch weight="bold" className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    copy.pending.decline
                  )}
                </Button>
                <Button
                  size="sm"
                  className="min-h-[44px]"
                  disabled={isResponding}
                  onClick={() => handleRespond(invite.id, 'accepted')}
                >
                  {isResponding ? (
                    <CircleNotch weight="bold" className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    copy.pending.accept
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Active sponsorships list ──────────────────────────────────────────────────

function ActiveStudentsList({
  students,
  copy,
}: {
  students: SponsoredStudent[];
  copy: Copy;
}) {
  const [localStudents, setLocalStudents] = useState<SponsoredStudent[]>(students);
  const utils = trpc.useUtils();

  const cancelMutation = trpc.sponsor.cancelSponsorship.useMutation({
    onSuccess: (_, vars) => {
      setLocalStudents((prev) =>
        prev.map((s) => (s.id === vars.sponsorshipId ? { ...s, status: 'cancelled' as const } : s)),
      );
      void utils.sponsor.listSponsoredStudents.invalidate();
    },
  });

  const active = localStudents.filter((s) => s.status !== 'pending');

  if (active.length === 0) {
    return (
      <EmptyState
        heading={copy.active.empty.title}
        body={copy.active.empty.description}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-120 text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.active.student}
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              {copy.active.amount}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.active.status}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.active.since}
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              {copy.active.actions}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {active.map((student) => {
            const canCancel = student.status === 'active';
            return (
              <tr key={student.id} className="bg-card transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/sponsor/students/${student.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {student.studentEmail ?? <span className="text-muted-foreground">—</span>}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono text-foreground">
                  {formatNGN(student.amountKobo)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={student.status} labels={copy.statusLabels} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(student.createdAt).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  {canCancel ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="min-h-[44px] px-2 text-xs font-medium text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {copy.active.cancelSponsorship}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{commitmentCopy.uncommitModal.title}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {commitmentCopy.uncommitModal.body(
                              formatNGN(student.amountKobo),
                              student.studentEmail ?? 'this student',
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{commitmentCopy.uncommitModal.cancel}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => cancelMutation.mutate({ sponsorshipId: student.id })}
                          >
                            {commitmentCopy.uncommitModal.confirm}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SponsorStudentsPageClient({
  invites,
  students,
  copy,
}: SponsorStudentsPageClientProps) {
  const pendingCount = invites.filter((inv) => inv.status === 'pending').length;
  const activeCount = students.filter((s) => s.status !== 'pending').length;

  return (
    <Tabs defaultValue="pending">
      <TabsList className="mb-4">
        <TabsTrigger value="pending">
          {copy.tabs.pending}
          {pendingCount > 0 ? (
            <span className="ml-1.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-success">
              {pendingCount}
            </span>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="active">
          {copy.tabs.active}
          {activeCount > 0 ? (
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
              {activeCount}
            </span>
          ) : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        <PendingInvitesList invites={invites} copy={copy} />
      </TabsContent>

      <TabsContent value="active">
        <ActiveStudentsList students={students} copy={copy} />
      </TabsContent>
    </Tabs>
  );
}
