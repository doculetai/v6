'use client';

import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

type DocumentQueueItem = {
  documentId: string;
  studentId: string;
  studentEmail: string | null;
  documentType: 'passport' | 'bank_statement' | 'offer_letter' | 'affidavit' | 'cac';
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  storageUrl: string;
  createdAt: Date;
};

type DocumentsCopy = {
  table: {
    student: string;
    type: string;
    uploaded: string;
    status: string;
    actions: string;
  };
  typeLabels: {
    passport: string;
    bank_statement: string;
    offer_letter: string;
    affidavit: string;
    cac: string;
  };
  statusLabels: {
    pending: string;
    approved: string;
    rejected: string;
    more_info_requested: string;
  };
  actions: { view: string; approve: string; reject: string };
  empty: { title: string; description: string };
};

type Props = {
  documents: DocumentQueueItem[];
  copy: DocumentsCopy;
};

const statusBadgeClass: Record<DocumentQueueItem['status'], string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
  more_info_requested: 'bg-muted text-muted-foreground',
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function UniversityDocumentsPageClient({ documents, copy }: Props) {
  if (documents.length === 0) {
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
              {copy.table.type}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.uploaded}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.status}
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              {copy.table.actions}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.map((doc) => (
            <tr
              key={doc.documentId}
              className="bg-card transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3 text-foreground">
                {doc.studentEmail ?? '\u2014'}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {copy.typeLabels[doc.documentType]}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(doc.createdAt)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    statusBadgeClass[doc.status],
                  )}
                >
                  {copy.statusLabels[doc.status]}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-8 gap-1.5 text-xs"
                    asChild
                  >
                    <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3" aria-hidden="true" />
                      {copy.actions.view}
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-8 text-xs"
                    disabled
                  >
                    {copy.actions.approve}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-8 text-xs text-destructive hover:text-destructive"
                    disabled
                  >
                    {copy.actions.reject}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
