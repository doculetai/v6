'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  createDocumentUploadFormSchema,
  type DocumentUploadFormInputValues,
  type DocumentUploadFormValues,
} from '@/components/student/documents/document-upload-form-schema';
import { StudentDocumentList } from '@/components/student/documents/student-document-list';
import {
  StudentDocumentsEmptyState,
  StudentDocumentsErrorState,
  StudentDocumentsLoadingState,
} from '@/components/student/documents/student-documents-states';
import { StudentDocumentUploadForm } from '@/components/student/documents/student-document-upload-form';
import { studentCopy } from '@/config/copy/student';
import type { SupportedDocumentMimeType } from '@/lib/documents';
import { trpc } from '@/trpc/client';

function buildFileInputKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return String(Date.now());
}

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('invalid-file-data'));
        return;
      }

      const [, fileBase64 = ''] = reader.result.split(',');

      if (!fileBase64) {
        reject(new Error('invalid-file-data'));
        return;
      }

      resolve(fileBase64);
    };

    reader.onerror = () => reject(new Error('invalid-file-data'));
    reader.readAsDataURL(file);
  });
}

export function DocumentsPageClient() {
  const copy = studentCopy.documents;
  const utils = trpc.useUtils();
  const [fileInputKey, setFileInputKey] = useState(buildFileInputKey);

  const formSchema = useMemo(() => {
    return createDocumentUploadFormSchema(copy.validation);
  }, [copy.validation]);

  const form = useForm<DocumentUploadFormInputValues, unknown, DocumentUploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: '',
    },
  });

  const studentDocumentsQuery = trpc.student.listDocuments.useQuery(undefined, {
    staleTime: 15_000,
  });

  const uploadDocumentMutation = trpc.student.uploadDocument.useMutation({
    onSuccess: async () => {
      await utils.student.listDocuments.invalidate();
    },
  });

  const handleUpload = async (values: DocumentUploadFormValues) => {
    form.clearErrors('root');

    try {
      const fileBase64 = await readFileAsBase64(values.file);

      await uploadDocumentMutation.mutateAsync({
        documentType: values.documentType,
        fileName: values.file.name,
        mimeType: values.file.type as SupportedDocumentMimeType,
        fileSizeBytes: values.file.size,
        fileBase64,
      });

      form.reset({
        documentType: '',
      });

      setFileInputKey(buildFileInputKey());
    } catch {
      form.setError('root', {
        message: copy.validation.uploadFailed,
      });
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-sm dark:border-border dark:bg-card/95">
        <div className="bg-gradient-to-r from-primary/15 via-background to-accent/60 px-5 py-5 dark:from-primary/20 dark:via-background dark:to-accent/50 md:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-border bg-background/80 p-2 dark:border-border dark:bg-background/80">
              <UploadCloud className="size-5 text-primary dark:text-primary" aria-hidden="true" />
            </div>

            <div className="min-w-0 space-y-1">
              <h2 className="text-2xl font-semibold text-card-foreground dark:text-card-foreground md:text-4xl">
                {copy.title}
              </h2>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
                {copy.subtitle}
              </p>
            </div>
          </div>
        </div>
      </header>

      <StudentDocumentUploadForm
        copy={copy}
        form={form}
        fileInputKey={fileInputKey}
        isUploading={uploadDocumentMutation.isPending}
        onSubmit={handleUpload}
      />

      {studentDocumentsQuery.isPending ? (
        <StudentDocumentsLoadingState copy={copy.states} />
      ) : null}

      {studentDocumentsQuery.isError ? (
        <StudentDocumentsErrorState copy={copy.states} onRetry={() => void studentDocumentsQuery.refetch()} />
      ) : null}

      {!studentDocumentsQuery.isPending && !studentDocumentsQuery.isError ? (
        studentDocumentsQuery.data.length > 0 ? (
          <StudentDocumentList copy={copy} documents={studentDocumentsQuery.data} />
        ) : (
          <StudentDocumentsEmptyState copy={copy.states} />
        )
      ) : null}
    </section>
  );
}
