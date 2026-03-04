'use client';

import { EmptyState } from '@/components/ui/empty-state';
import type { agentCopy } from '@/config/copy/agent';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type AgentStudent = {
  assignmentId: string;
  studentId: string;
  studentEmail: string | null;
  schoolName: string | null;
  programName: string | null;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  documentCount: number;
  assignedAt: Date;
};

type Props = {
  students: AgentStudent[];
  copy: typeof agentCopy.students;
};

// ── KYC badge ─────────────────────────────────────────────────────────────────

const kycBadgeClass: Record<AgentStudent['kycStatus'], string> = {
  verified: 'bg-primary/10 text-primary',
  pending: 'bg-warning/10 text-warning',
  failed: 'bg-destructive/10 text-destructive',
  not_started: 'bg-muted text-muted-foreground',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function StudentCard({
  student,
  copy,
}: {
  student: AgentStudent;
  copy: Props['copy'];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-foreground">
          {student.studentEmail ?? '\u2014'}
        </p>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
            kycBadgeClass[student.kycStatus],
          )}
        >
          {copy.kycLabels[student.kycStatus]}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.school}</dt>
          <dd className="text-foreground">{student.schoolName ?? '\u2014'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.program}</dt>
          <dd className="text-foreground">{student.programName ?? '\u2014'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{copy.table.documents}</dt>
          <dd className="tabular-nums text-foreground">{student.documentCount}</dd>
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

export function AgentStudentsPageClient({ students, copy }: Props) {
  if (students.length === 0) {
    return (
      <EmptyState
        heading={copy.empty.title}
        body={copy.empty.description}
      />
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {students.map((student) => (
          <StudentCard key={student.assignmentId} student={student} copy={copy} />
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
                {copy.table.program}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.kycStatus}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.documents}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {copy.table.assignedAt}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => (
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
                <td className="px-4 py-3 text-muted-foreground">
                  {student.programName ?? '\u2014'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      kycBadgeClass[student.kycStatus],
                    )}
                  >
                    {copy.kycLabels[student.kycStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {student.documentCount}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(student.assignedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
