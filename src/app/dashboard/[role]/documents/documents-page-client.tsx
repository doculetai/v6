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
import { BankVerificationSection } from '@/components/student/BankVerificationSection';
import { OcrSummaryCard } from '@/components/student/OcrSummaryCard';
import { DocumentPreviewModal } from '@/components/shared/DocumentPreviewModal';
import { ActionSuccessBanner } from '@/components/ui/action-success-banner';
import { DocumentUploadProgress, type UploadStage } from '@/components/ui/document-upload-progress';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { studentCopy } from '@/config/copy/student';
import { primitivesCopy } from '@/config/copy/primitives';
import type { StudentDocumentType, SupportedDocumentMimeType } from '@/lib/documents';
import { useDocumentsRealtime } from '@/lib/supabase/useDocumentsRealtime';
import { formatCurrency } from '@/lib/utils';
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
  const [dismissOcrCard, setDismissOcrCard] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);

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

  const verificationQuery = trpc.student.getVerificationStatus.useQuery(undefined, {
    staleTime: 30_000,
  });

  const bankConnected = verificationQuery.data?.monoConnection.isConnected ?? false;
  const bankName = verificationQuery.data?.monoConnection.bankName ?? null;
  const bankAccountMasked = verificationQuery.data?.monoConnection.accountNumberMasked ?? null;
  const bankStatementRejection = verificationQuery.data?.bankStatementRejection ?? null;

  const handleBankConnected = useCallback(() => {
    void utils.student.getVerificationStatus.invalidate();
  }, [utils]);

  const handleBankStatementResubmit = useCallback(() => {
    const formEl = document.getElementById('document-upload-form');
    formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const studentDocumentsQuery = trpc.student.listDocuments.useQuery(undefined, {
    staleTime: 15_000,
  });
  const latestOcrRunQuery = trpc.student.getLatestOcrRun.useQuery(undefined, {
    staleTime: 10_000,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return false;
      return status === 'completed' || status === 'failed' ? false : 3_000;
    },
  });

  const latestOcrRun = latestOcrRunQuery.data;
  const showOcrCard =
    !dismissOcrCard &&
    latestOcrRun?.status === 'completed' &&
    (latestOcrRun.extractedName !== null || latestOcrRun.extractedBalance !== null);

  const allApproved =
    (studentDocumentsQuery.data?.length ?? 0) > 0 &&
    (studentDocumentsQuery.data?.every((d) => d.status === 'approved') ?? false);

  const uploadDocumentMutation = trpc.student.uploadDocument.useMutation({
    onSuccess: async () => {
      setDismissOcrCard(false);
      await Promise.all([
        utils.student.listDocuments.invalidate(),
        utils.student.getLatestOcrRun.invalidate(),
      ]);
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

      <BankVerificationSection
        isConnected={bankConnected}
        bankName={bankName}
        accountNumberMasked={bankAccountMasked}
        onBankConnected={handleBankConnected}
        bankStatementStatus={bankStatementRejection?.status ?? null}
        bankStatementRejectionNote={bankStatementRejection?.rejectionNote ?? null}
        onResubmit={handleBankStatementResubmit}
      />

      {latestOcrRun?.status === 'failed' ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">Automatic statement scan failed</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {latestOcrRun.errorMessage ?? 'Your document is still queued for manual review.'}
          </p>
        </div>
      ) : null}

      {latestOcrRun && latestOcrRun.status !== 'completed' && latestOcrRun.status !== 'failed' ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Statement analysis in progress</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {latestOcrRun.currentStep ?? 'Analyzing your bank statement'} ({latestOcrRun.progress}%)
          </p>
        </div>
      ) : null}

      {showOcrCard ? (
        <OcrSummaryCard
          documentId={latestOcrRun.documentId}
          extractedName={latestOcrRun.extractedName}
          extractedAmount={
            latestOcrRun.extractedBalance !== null
              ? formatCurrency(latestOcrRun.extractedBalance, 'NGN')
              : null
          }
          confidence={latestOcrRun.confidence}
          onPreview={() => setPreviewDocumentId(latestOcrRun.documentId)}
          onDismiss={() => setDismissOcrCard(true)}
        />
      ) : null}

      <Section id="document-upload-form" padding="none" className="scroll-mt-4">
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
      </Section>

      {previewDocumentId ? (
        <DocumentPreviewModal
          documentId={previewDocumentId}
          open={Boolean(previewDocumentId)}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewDocumentId(null);
            }
          }}
          documentTypeLabel={copy.types.bankStatement}
          reviewActions={null}
        />
      ) : null}
      </Stack>
    </PageShell>
  );
}
