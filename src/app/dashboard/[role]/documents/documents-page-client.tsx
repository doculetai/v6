'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
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
import { ActionSuccessBanner } from '@/components/ui/action-success-banner';
import { DocumentUploadProgress, type UploadStage } from '@/components/ui/document-upload-progress';
import { PageShell, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { studentCopy } from '@/config/copy/student';
import { primitivesCopy } from '@/config/copy/primitives';
import type { StudentDocumentType, SupportedDocumentMimeType } from '@/lib/documents';
import { useDocumentsRealtime } from '@/lib/supabase/useDocumentsRealtime';
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
  const [uploadStage, setUploadStage] = useState<UploadStage | null>(null);

  const handleProgressComplete = useCallback(() => {
    // Clear progress after completion animation
    setTimeout(() => setUploadStage(null), 800);
  }, []);

  const sessionQuery = trpc.dashboard.getSession.useQuery({ role: 'student' });
  const userId = sessionQuery.data?.userId ?? '';
  useDocumentsRealtime(userId);

  const formSchema = useMemo(() => {
    return createDocumentUploadFormSchema(copy.validation);
  }, [copy.validation]);

  const form = useForm<DocumentUploadFormInputValues, unknown, DocumentUploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: '',
    },
  });

  const handleReuploadClick = (documentType: StudentDocumentType) => {
    form.setValue('documentType', documentType);
    const formEl = document.getElementById('document-upload-form');
    formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const studentDocumentsQuery = trpc.student.listDocuments.useQuery(undefined, {
    staleTime: 15_000,
  });

  const allApproved =
    (studentDocumentsQuery.data?.length ?? 0) > 0 &&
    (studentDocumentsQuery.data?.every((d) => d.status === 'approved') ?? false);

  const uploadDocumentMutation = trpc.student.uploadDocument.useMutation({
    onSuccess: async () => {
      await utils.student.listDocuments.invalidate();
    },
  });

  const handleUpload = async (values: DocumentUploadFormValues) => {
    form.clearErrors('root');

    try {
      // Stage 1: Uploading
      setUploadStage('uploading');
      const fileBase64 = await readFileAsBase64(values.file);

      // Stage 2: Scanning
      setUploadStage('scanning');

      // Stage 3: Processing (extracting document details)
      setUploadStage('processing');
      await uploadDocumentMutation.mutateAsync({
        documentType: values.documentType,
        fileName: values.file.name,
        mimeType: values.file.type as SupportedDocumentMimeType,
        fileSizeBytes: values.file.size,
        fileBase64,
      });

      // Stage 4: Submitted
      setUploadStage('submitted');

      form.reset({
        documentType: '',
      });

      setFileInputKey(buildFileInputKey());
    } catch {
      setUploadStage(null);
      form.setError('root', {
        message: copy.validation.uploadFailed,
      });
    }
  };

  return (
    <PageShell width="wide">
      <Stack gap="md">
      <PageHeader
        title={copy.title}
        description={copy.subtitle}
        breadcrumbs={[
          { label: studentCopy.nav.overview, href: '/dashboard/student' },
          { label: studentCopy.nav.documents },
        ]}
      />

      {allApproved ? (
        <ActionSuccessBanner
          message={copy.allApproved.heading}
          nextAction={{
            label: studentCopy.nextSteps.postDocs.title,
            description: studentCopy.nextSteps.postDocs.body,
            cta: studentCopy.nextSteps.postDocs.cta,
            href: studentCopy.nextSteps.postDocs.href,
          }}
        />
      ) : uploadStage === 'submitted' ? (
        <ActionSuccessBanner
          message={copy.upload.submitSuccessMessage}
          nextAction={null}
          onDismiss={() => setUploadStage(null)}
        />
      ) : null}

      <section id="document-upload-form" className="scroll-mt-4">
        <StudentDocumentUploadForm
        copy={copy}
        form={form}
        fileInputKey={fileInputKey}
        isUploading={uploadDocumentMutation.isPending}
        onSubmit={handleUpload}
      />

      <DocumentUploadProgress
        currentStage={uploadStage}
        stageLabels={primitivesCopy.uploadProgress}
        onComplete={handleProgressComplete}
        className="mt-4"
      />

      {studentDocumentsQuery.isPending ? (
        <StudentDocumentsLoadingState copy={copy.states} />
      ) : null}

      {studentDocumentsQuery.isError ? (
        <StudentDocumentsErrorState copy={copy.states} onRetry={() => void studentDocumentsQuery.refetch()} />
      ) : null}

      {!studentDocumentsQuery.isPending && !studentDocumentsQuery.isError ? (
        studentDocumentsQuery.data.length > 0 ? (
          <StudentDocumentList
            copy={copy}
            documents={studentDocumentsQuery.data}
            onReuploadClick={handleReuploadClick}
          />
        ) : (
          <StudentDocumentsEmptyState copy={copy.states} />
        )
      ) : null}
      </section>
      </Stack>
    </PageShell>
  );
}
