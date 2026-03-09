'use client';

import { useState } from 'react';
import { DownloadSimple } from '@/components/icons';

import { EmptyState } from '@/components/layout/empty-state';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import type { universityCopy } from '@/config/copy/university';

type Student = {
  studentId: string;
  studentEmail: string | null;
  programId: string | null;
  programName: string | null;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  bankStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  documentCount: number;
  certificateId: string | null;
  createdAt: Date;
};

type Program = {
  id: string;
  name: string;
};

type Props = {
  initialStudents: Student[];
  programs: Program[];
  copy: typeof universityCopy.students;
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

export function UniversityStudentsPageClient({ initialStudents, programs, copy }: Props) {
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const studentsQuery = trpc.university.listUniversityStudentsWithCert.useQuery(
    { programId: selectedProgramId === 'all' ? undefined : selectedProgramId },
    { initialData: selectedProgramId === 'all' ? initialStudents : undefined },
  );

  const exportMutation = trpc.university.exportStudents.useMutation({
    onSuccess({ csv }) {
      if (!csv) return;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'students.csv';
      link.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    },
    onError() {
      setIsExporting(false);
    },
  });

  function handleExport() {
    setIsExporting(true);
    exportMutation.mutate({
      programId: selectedProgramId === 'all' ? undefined : selectedProgramId,
    });
  }

  const students = studentsQuery.data ?? initialStudents;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={selectedProgramId}
          onValueChange={(val) => setSelectedProgramId(val)}
        >
          <SelectTrigger
            className="w-full sm:w-56"
            aria-label={copy.filterByProgram}
          >
            <SelectValue placeholder={copy.allPrograms} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{copy.allPrograms}</SelectItem>
            {programs.map((prog) => (
              <SelectItem key={prog.id} value={prog.id}>
                {prog.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting || exportMutation.isPending}
          className="min-h-11 w-full sm:w-auto"
          aria-label={copy.exportCsv}
        >
          <DownloadSimple size={20} weight="duotone" aria-hidden="true" />
          {isExporting || exportMutation.isPending ? copy.exporting : copy.exportCsv}
        </Button>
      </div>

      {studentsQuery.isLoading ? null : students.length === 0 ? (
        <EmptyState title={copy.empty.title} description={copy.empty.description} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
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
                    {copy.table.certificateId}
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
                      {student.certificateId ?? '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(student.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {students.map((student) => (
              <div
                key={student.studentId}
                className="rounded-lg border border-border bg-card p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
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
                <p className="text-xs text-muted-foreground">
                  {student.programName ?? '\u2014'}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {student.documentCount} {copy.card.documents}
                  </span>
                  <span>
                    {copy.card.enrolled}: {formatDate(student.createdAt)}
                  </span>
                </div>
                {student.certificateId && (
                  <p className="font-mono text-xs text-muted-foreground">
                    {copy.card.certificate}: {student.certificateId}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
