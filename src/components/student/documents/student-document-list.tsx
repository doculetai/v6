'use client';

import { CalendarClock, FileText } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudentCopy } from '@/config/copy/student';
import type { StudentDocumentStatus, StudentDocumentType } from '@/lib/documents';

import { StudentDocumentStatusBadge } from './student-document-status-badge';

type StudentDocumentListItem = {
  id: string;
  type: StudentDocumentType;
  status: StudentDocumentStatus;
  rejectionReason: string | null;
  createdAt: Date;
};

type StudentDocumentListProps = {
  copy: StudentCopy['documents'];
  documents: StudentDocumentListItem[];
};

function formatDocumentDate(value: Date) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function getTypeLabel(
  typeValue: StudentDocumentType,
  typeOptions: StudentCopy['documents']['typeOptions'],
) {
  const match = typeOptions.find((option) => option.value === typeValue);

  return match?.label ?? typeValue;
}

export function StudentDocumentList({ copy, documents }: StudentDocumentListProps) {
  return (
    <Card className="border-border bg-card/95 shadow-sm backdrop-blur dark:border-border dark:bg-card/95">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
          {copy.list.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
          {copy.list.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3" aria-label={copy.list.ariaLabel}>
          {documents.map((document) => {
            const typeLabel = getTypeLabel(document.type, copy.typeOptions);
            const dateLabel = formatDocumentDate(document.createdAt);
            const showRejectionReason = document.status === 'rejected';

            return (
              <li
                key={document.id}
                className="rounded-xl border border-border bg-background/70 p-4 dark:border-border dark:bg-background/70"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText
                        className="size-5 shrink-0 text-muted-foreground dark:text-muted-foreground"
                        aria-hidden="true"
                      />
                      <p className="break-words text-sm font-medium text-foreground dark:text-foreground md:text-base">
                        {typeLabel}
                      </p>
                    </div>

                    <p className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground md:text-sm">
                      <CalendarClock className="size-5 shrink-0" aria-hidden="true" />
                      <span>{`${copy.list.submittedAtLabel}: ${dateLabel}`}</span>
                    </p>
                  </div>

                  <StudentDocumentStatusBadge status={document.status} statusCopy={copy.status} />
                </div>

                {showRejectionReason ? (
                  <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 dark:border-destructive/25 dark:bg-destructive/15">
                    <p className="text-xs font-medium text-destructive dark:text-destructive md:text-sm">
                      {copy.list.rejectionReasonLabel}
                    </p>
                    <p className="mt-1 break-words text-sm text-destructive dark:text-destructive">
                      {document.rejectionReason ?? copy.list.rejectionReasonFallback}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
