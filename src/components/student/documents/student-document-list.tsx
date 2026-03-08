'use client';

import { useState } from 'react';
import {
  CalendarBlank,
  Eye,
  FileText,
  FilePdf,
  IdentificationCard,
  Scroll,
  Stamp,
  Buildings,
  UploadSimple,
} from '@/components/icons';

import { DocumentPreviewModal } from '@/components/shared/DocumentPreviewModal';
import { Button } from '@/components/ui/button';
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
  onReuploadClick?: (documentType: StudentDocumentType, rejectionNote?: string | null) => void;
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

const documentTypeIcons: Record<string, typeof FileText> = {
  passport: IdentificationCard,
  offer_letter: Scroll,
  affidavit: Stamp,
  cac: Buildings,
  bank_statement: FilePdf,
};

function getDocumentIcon(type: StudentDocumentType) {
  return documentTypeIcons[type] ?? FileText;
}

export function StudentDocumentList({ copy, documents, onReuploadClick }: StudentDocumentListProps) {
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const previewDoc = documents.find((d) => d.id === previewDocId);

  return (
    <>
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
            const showMoreInfoNote = document.status === 'more_info_requested';

            const DocIcon = getDocumentIcon(document.type);

            return (
              <li
                key={document.id}
                className="rounded-xl border border-border bg-background/70 p-4 dark:border-border dark:bg-background/70"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <DocIcon
                        className="size-5 text-muted-foreground"
                        weight="duotone"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="break-words text-sm font-medium text-foreground md:text-base">
                        {typeLabel}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground md:text-sm">
                        <CalendarBlank className="size-3.5 shrink-0" weight="duotone" aria-hidden="true" />
                        <span>{`${copy.list.submittedAtLabel}: ${dateLabel}`}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-11 p-0"
                      onClick={() => setPreviewDocId(document.id)}
                      aria-label={`Preview ${typeLabel}`}
                    >
                      <Eye className="size-5 text-muted-foreground" weight="duotone" aria-hidden="true" />
                    </Button>
                    <StudentDocumentStatusBadge status={document.status} statusCopy={copy.status} />
                  </div>
                </div>

                {showRejectionReason ? (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 dark:border-destructive/25 dark:bg-destructive/15">
                      <p className="text-xs font-medium text-destructive dark:text-destructive md:text-sm">
                        {copy.list.rejectionReasonLabel}
                      </p>
                      <p className="mt-1 break-words text-sm text-destructive dark:text-destructive">
                        {document.rejectionReason ?? copy.list.rejectionReasonFallback}
                      </p>
                    </div>
                    {onReuploadClick ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-11 min-w-[44px] gap-2"
                        onClick={() => onReuploadClick(document.type, document.rejectionReason)}
                      >
                        <UploadSimple className="size-4" weight="duotone" aria-hidden="true" />
                        {copy.list.reuploadReplacementCta}
                      </Button>
                    ) : null}
                  </div>
                ) : null}

                {showMoreInfoNote ? (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 dark:border-warning/40 dark:bg-warning/15">
                      <p className="text-xs font-medium text-warning md:text-sm">
                        {copy.list.moreInfoNoteLabel}
                      </p>
                      <p className="mt-1 break-words text-sm text-warning/80">
                        {document.rejectionReason ?? copy.list.rejectionReasonFallback}
                      </p>
                    </div>
                    {onReuploadClick ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-11 min-w-[44px] gap-2"
                        onClick={() => onReuploadClick(document.type, document.rejectionReason)}
                      >
                        <UploadSimple className="size-4" weight="duotone" aria-hidden="true" />
                        {copy.list.moreInfoResubmitCta}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>

    {previewDocId ? (
      <DocumentPreviewModal
        documentId={previewDocId}
        open={Boolean(previewDocId)}
        onOpenChange={(open) => { if (!open) setPreviewDocId(null); }}
        documentTypeLabel={previewDoc ? getTypeLabel(previewDoc.type, copy.typeOptions) : undefined}
        reviewActions={null}
      />
    ) : null}
    </>
  );
}
