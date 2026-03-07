'use client';

import { useState } from 'react';
import { Download } from '@phosphor-icons/react';

import { EmptyState } from '@/components/ui/empty-state';
import { trpc } from '@/trpc/client';
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
  certToken: string | null;
  certIssuedAt: Date | null;
};

type StudentsCopy = {
  table: {
    student: string;
    program: string;
    kycStatus: string;
    documents: string;
    enrolled: string;
    certId: string;
    certIssued: string;
  };
  kycLabels: {
    not_started: string;
    pending: string;
    verified: string;
    failed: string;
  };
  certNotIssued: string;
  exportRoster: {
    cta: string;
    filename: string;
    empty: string;
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
  const [exporting, setExporting] = useState(false);

  const exportQuery = trpc.universityManagement.exportRoster.useQuery(undefined, {
    enabled: false,
  });

  async function handleExport() {
    setExporting(true);
    try {
      const result = await exportQuery.refetch();
      const csv = result.data;
      if (!csv) return;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = copy.exportRoster.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <button
          onClick={handleExport}
          disabled={exporting || students.length === 0}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          )}
          type="button"
        >
          <Download weight="duotone" size={16} />
          {exporting ? 'Exporting\u2026' : copy.exportRoster.cta}
        </button>
      </div>

      {students.length === 0 ? (
        <EmptyState
          heading={copy.empty.title}
          body={copy.empty.description}
        />
      ) : (
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
                  {copy.table.certId}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {copy.table.certIssued}
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
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {student.certToken ?? (
                      <span className="text-muted-foreground/60">
                        {copy.certNotIssued}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {student.certIssuedAt ? formatDate(student.certIssuedAt) : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(student.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
