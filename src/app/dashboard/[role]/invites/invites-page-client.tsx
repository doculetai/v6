'use client';

import { EnvelopeSimple } from '@/components/icons';

import { EmptyState } from '@/components/ui/empty-state';
import type { agentCopy } from '@/config/copy/agent';
import { cn } from '@/lib/utils';
import { routes } from '@/config/routes';

// ── Types ─────────────────────────────────────────────────────────────────────

type InviteStatus = 'invited' | 'onboarding' | 'verified' | 'completed';

type InviteStudent = {
  assignmentId: string;
  studentId: string;
  studentEmail: string | null;
  schoolName: string | null;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  documentCount: number;
  assignedAt: Date;
};

type Props = {
  students: InviteStudent[];
  copy: typeof agentCopy.invites;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveInviteStatus(student: InviteStudent): InviteStatus {
  if (student.kycStatus === 'verified' && student.documentCount > 0) return 'completed';
  if (student.kycStatus === 'verified') return 'verified';
  if (student.kycStatus === 'pending' || student.documentCount > 0) return 'onboarding';
  return 'invited';
}

const statusBadgeClass: Record<InviteStatus, string> = {
  completed: 'bg-primary/10 text-primary',
  verified: 'bg-primary/10 text-primary',
  onboarding: 'bg-warning/10 text-warning',
  invited: 'bg-muted text-muted-foreground',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function InviteCard({
  student,
  copy,
}: {
  student: InviteStudent;
  copy: Props['copy'];
}) {
  const status = deriveInviteStatus(student);
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <EnvelopeSimple weight="duotone" size={20} className="shrink-0 text-muted-foreground" />
          <p className="truncate text-sm font-medium text-foreground">
            {student.studentEmail ?? '\u2014'}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
            statusBadgeClass[status],
          )}
        >
          {copy.statusLabels[status]}
        </span>
      </div>

      {/* layout-audit-disable: dl requires semantic element for dt/dd */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.school}</dt>
          <dd className="text-foreground">{student.schoolName ?? '\u2014'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.assignedAt}</dt>
          <dd className="text-muted-foreground">{formatDate(student.assignedAt)}</dd>
        </div>
      </dl>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function InvitesPageClient({ students, copy }: Props) {
  if (students.length === 0) {
    return (
      <EmptyState
        heading={copy.empty.title}
        body={copy.empty.description}
        action={{ label: copy.empty.cta, href: routes.dashboard.agent.bulkInvite }}
      />
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {students.map((student) => (
          <InviteCard key={student.assignmentId} student={student} copy={copy} />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.email}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.school}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.status}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.assignedAt}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => {
              const status = deriveInviteStatus(student);
              return (
                <tr
                  key={student.assignmentId}
                  className="bg-card transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-foreground">
                    {student.studentEmail ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {student.schoolName ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        statusBadgeClass[status],
                      )}
                    >
                      {copy.statusLabels[status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(student.assignedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
