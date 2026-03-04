'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { formatNGN } from '@/lib/utils';
import { browserTrpcClient } from '@/trpc/client';

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
  status: 'pending' | 'active' | 'completed' | 'cancelled';
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
      ? 'bg-primary/10 text-primary border-0'
      : 'bg-muted text-muted-foreground border-0';

  return <Badge className={className}>{label}</Badge>;
}

// ── Pending invites list ──────────────────────────────────────────────────────

function PendingInvitesList({ invites, copy }: { invites: Invite[]; copy: Copy }) {
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [localInvites, setLocalInvites] = useState<Invite[]>(invites);

  const pendingInvites = localInvites.filter((inv) => inv.status === 'pending');

  const handleRespond = async (inviteId: string, status: 'accepted' | 'declined') => {
    setRespondingId(inviteId);
    try {
      await browserTrpcClient.sponsor.respondToInvite.mutate({ inviteId, status });
      setLocalInvites((prev) =>
        prev.map((inv) => (inv.id === inviteId ? { ...inv, status } : inv)),
      );
    } finally {
      setRespondingId(null);
    }
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
                  className="min-h-9"
                  disabled={isResponding}
                  onClick={() => void handleRespond(invite.id, 'declined')}
                >
                  {isResponding ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    copy.pending.decline
                  )}
                </Button>
                <Button
                  size="sm"
                  className="min-h-9"
                  disabled={isResponding}
                  onClick={() => void handleRespond(invite.id, 'accepted')}
                >
                  {isResponding ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
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
  const active = students.filter((s) => s.status !== 'pending');

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
              Student
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
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {active.map((student) => (
            <tr key={student.id} className="bg-card transition-colors hover:bg-muted/30">
              <td className="px-4 py-3 text-foreground">
                {student.studentEmail ?? <span className="text-muted-foreground">—</span>}
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
            </tr>
          ))}
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
  return (
    <Tabs defaultValue="pending">
      <TabsList className="mb-4">
        <TabsTrigger value="pending">{copy.tabs.pending}</TabsTrigger>
        <TabsTrigger value="active">{copy.tabs.active}</TabsTrigger>
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
