'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

type Student = {
  studentId: string;
  studentEmail: string | null;
  schoolName: string | null;
  programName: string | null;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  bankStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  documentCount: number;
  createdAt: Date;
};

type StudentsCopy = {
  table: {
    student: string;
    program: string;
    kycStatus: string;
    documents: string;
    enrolled: string;
  };
  kycLabels: {
    not_started: string;
    pending: string;
    verified: string;
    failed: string;
  };
  empty: { title: string; description: string };
};

type Props = {
  students: Student[];
  copy: StudentsCopy;
};

const kycBadgeClass: Record<Student['kycStatus'], string> = {
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

export function UniversityStudentsPageClient({ students, copy }: Props) {
  if (students.length === 0) {
    return (
      <EmptyState
        heading={copy.empty.title}
        body={copy.empty.description}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.student}
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
              {copy.table.enrolled}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => (
            <tr
              key={student.studentId}
              className="bg-card transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3 text-foreground">
                {student.studentEmail ?? '\u2014'}
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
                {formatDate(student.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
