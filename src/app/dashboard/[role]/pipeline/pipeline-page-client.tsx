'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { universityCopy } from '@/config/copy/university';
import { cn } from '@/lib/utils';

type QueueItem = {
  studentId: string;
  studentEmail: string | null;
  programName: string | null;
  documentCount: number;
  pendingDocumentCount: number;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  createdAt: Date;
};

type Props = {
  queue: QueueItem[];
};

const copy = universityCopy.pipeline;

const kycBadgeClass: Record<QueueItem['kycStatus'], string> = {
  verified: 'bg-primary/10 text-primary',
  pending: 'bg-warning/10 text-warning',
  failed: 'bg-destructive/10 text-destructive',
  not_started: 'bg-muted text-muted-foreground',
};


function docCountClass(item: QueueItem): string {
  if (item.pendingDocumentCount > 0) {
    return 'text-warning';
  }
  if (item.documentCount > 0) {
    return 'text-success';
  }
  return 'text-muted-foreground';
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function PipelinePageClient({ queue }: Props) {
  if (queue.length === 0) {
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
              {copy.table.applicant}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.program}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.documents}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.kycStatus}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.submitted}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {queue.map((item) => (
            <tr
              key={item.studentId}
              className="bg-card transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3 text-foreground">
                {item.studentEmail ?? '\u2014'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {item.programName ?? '\u2014'}
              </td>
              <td className={cn('px-4 py-3 tabular-nums', docCountClass(item))}>
                {item.documentCount} docs
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    kycBadgeClass[item.kycStatus],
                  )}
                >
                  {copy.kycLabels[item.kycStatus]}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
