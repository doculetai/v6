'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Callout } from '@/components/ui/callout';
import { DocumentUploadProgress, type UploadStage } from '@/components/ui/document-upload-progress';
import { NavGuardSheet } from '@/components/ui/nav-guard-sheet';
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
  const [showOcrCardState, setShowOcrCardState] = useState<'visible' | 'dismissed' | 'cancelled'>('visible');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  // C7: nav guard
  const [navGuardOpen, setNavGuardOpen] = useState(false);
  const pendingNavRef = useRef<string | null>(null);
  const uploadInProgress = uploadStage === 'uploading' || uploadStage === 'scanning' || uploadStage === 'processing';

  // C7: beforeunload guard for browser tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (uploadInProgress) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [uploadInProgress]);

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
    showOcrCardState === 'visible' &&
    latestOcrRun?.status === 'completed';

  const allApproved =
    (studentDocumentsQuery.data?.length ?? 0) > 0 &&
    (studentDocumentsQuery.data?.every((d) => d.status === 'approved') ?? false);

  const cancelPendingDocumentMutation = trpc.student.cancelPendingDocument.useMutation({
    onSuccess: async () => {
      setCancelError(null);
      setShowOcrCardState('cancelled');
      await Promise.all([
        utils.student.listDocuments.invalidate(),
        utils.student.getLatestOcrRun.invalidate(),
      ]);
    },
    onError: (err) => {
      setCancelError(err.message ?? 'Unable to cancel submission. Please try again.');
    },
  });

  const uploadDocumentMutation = trpc.student.uploadDocument.useMutation({
    onSuccess: async () => {
      setShowOcrCardState('visible');
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

      {/* B3.3: rejection note above upload zone when bank statement rejected */}
      {bankStatementRejection?.status === 'rejected' && bankStatementRejection.rejectionNote ? (
        <Callout variant="error">
          {studentCopy.rejectedPrefix}{bankStatementRejection.rejectionNote}
        </Callout>
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
          <p className="text-sm font-medium text-destructive">{studentCopy.ocrCard.ocrFailedHeading}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {latestOcrRun.errorMessage ?? studentCopy.ocrCard.ocrFailedFallback}
          </p>
        </div>
      ) : null}

      {latestOcrRun && latestOcrRun.status !== 'completed' && latestOcrRun.status !== 'failed' ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">{studentCopy.ocrCard.ocrInProgressHeading}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {latestOcrRun.currentStep ?? studentCopy.ocrCard.ocrInProgressFallback} ({latestOcrRun.progress}%)
          </p>
        </div>
      ) : null}

      {showOcrCardState === 'cancelled' ? (
        <p className="text-sm text-muted-foreground">{studentCopy.ocrCard.ocrCancelledPrompt}</p>
      ) : null}

      {showOcrCard ? (
        <>
          <OcrSummaryCard
            extractedName={latestOcrRun.extractedName}
            extractedAmount={
              latestOcrRun.extractedBalance !== null
                ? formatCurrency(latestOcrRun.extractedBalance, 'NGN')
                : null
            }
            confidence={latestOcrRun.confidence}
            onPreview={() => setPreviewDocumentId(latestOcrRun.documentId)}
            onConfirm={() => setShowOcrCardState('dismissed')}
            onCancel={() => {
              cancelPendingDocumentMutation.mutate({ documentId: latestOcrRun.documentId });
            }}
            isCancelling={cancelPendingDocumentMutation.isPending}
          />
          {cancelError ? (
            <p className="text-sm text-destructive">{cancelError}</p>
          ) : null}
        </>
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

      {/* C7: Nav guard sheet shown when navigating away mid-upload */}
      <NavGuardSheet
        open={navGuardOpen}
        onStay={() => {
          setNavGuardOpen(false);
          pendingNavRef.current = null;
        }}
        onLeave={() => {
          setNavGuardOpen(false);
          pendingNavRef.current = null;
        }}
      />
      </Stack>
    </PageShell>
  );
}
