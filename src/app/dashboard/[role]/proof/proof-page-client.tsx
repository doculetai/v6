'use client';

import { useMemo, useState, useTransition } from 'react';

import { CertificatePaymentCard } from '@/components/student/CertificatePaymentCard';
import { ProofCertificateCard } from '@/components/student/ProofCertificateCard';
import { ProofChecklistCard } from '@/components/student/ProofChecklistCard';
import { ProofEmptyState } from '@/components/student/ProofEmptyState';
import { PageShell, Section, Stack, Grid } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { studentCopy } from '@/config/copy/student';
import { useSponsorshipsRealtime } from '@/lib/supabase/useSponsorshipsRealtime';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

type ProofChecklist = {
  kycComplete: boolean;
  schoolComplete: boolean;
  bankComplete: boolean;
  sponsorComplete: boolean;
  documentsComplete: boolean;
  completedCount: number;
  totalCount: number;
  requiresSponsor: boolean;
};

type ProofCertificate = {
  issued: boolean;
  certificateId: string | null;
  issuedAt: string | null;
  sharePath: string | null;
  paymentStatus: 'unpaid' | 'paid' | 'waived' | null;
};

type ProofTrust = {
  sponsorCount: number;
  committedAmountKobo: number;
  currency: string;
  approvedDocumentCount: number;
  pendingDocumentCount: number;
  lastAuditAt: string | null;
};

type StudentProofData = {
  checklist: ProofChecklist;
  certificate: ProofCertificate;
  trust: ProofTrust;
  hasAnyProgress: boolean;
  canGenerateShareLink: boolean;
};

type ShareLinkResult = {
  certificateId: string;
  issuedAt: string;
  sharePath: string;
  reusedExistingCertificate: boolean;
};

type ProofPageClientProps = {
  initialData: StudentProofData;
  generateProofShareLinkAction: () => Promise<ShareLinkResult>;
};

export function ProofPageClient({
  initialData,
  generateProofShareLinkAction,
}: ProofPageClientProps) {
  const sessionQuery = trpc.dashboard.getSession.useQuery({ role: 'student' });
  const userId = sessionQuery.data?.userId ?? '';
  useSponsorshipsRealtime(userId);

  const [proofData, setProofData] = useState<StudentProofData>(initialData);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isGeneratingShareLink, startGeneratingShareLink] = useTransition();

  const shareLink = useMemo(
    () => getAbsoluteShareLink(proofData.certificate.sharePath),
    [proofData.certificate.sharePath],
  );

  const handleGenerateShareLink = () => {
    setShareError(null);

    startGeneratingShareLink(() => {
      void generateProofShareLinkAction()
        .then((result) => {
          setProofData((previousData) => ({
            ...previousData,
            certificate: {
              issued: true,
              certificateId: result.certificateId,
              issuedAt: result.issuedAt,
              sharePath: result.sharePath,
              paymentStatus: previousData.certificate.paymentStatus,
            },
            canGenerateShareLink: true,
          }));
        })
        .catch(() => {
          setShareError(studentCopy.proof.states.shareError);
        });
    });
  };

  const trackShareMutation = trpc.student.trackCertificateShare.useMutation();

  const handleTrackShare = (method: 'whatsapp' | 'email' | 'download' | 'link') => {
    if (!proofData.certificate.certificateId) return;
    trackShareMutation.mutate({
      certificateId: proofData.certificate.certificateId,
      method,
    });
  };

  const handleCopyShareLink = () => {
    if (!shareLink || !navigator.clipboard) {
      return;
    }

    setIsCopying(true);

    void navigator.clipboard
      .writeText(shareLink)
      .catch(() => {
        setShareError(studentCopy.proof.states.shareError);
      })
      .finally(() => {
        setTimeout(() => {
          setIsCopying(false);
        }, 1000);
      });
  };

  const checklistComplete =
    proofData.checklist.completedCount === proofData.checklist.totalCount &&
    proofData.checklist.totalCount > 0;
  const paymentCleared =
    proofData.certificate.paymentStatus === 'paid' ||
    proofData.certificate.paymentStatus === 'waived';
  const isUnderFinalReview =
    checklistComplete && paymentCleared && !proofData.certificate.issued;

  return (
    <PageShell width="default">
      <Section>
        <Stack gap="md">
          <PageHeader
            title={studentCopy.proof.title}
            description={studentCopy.proof.subtitle}
          />

      {!proofData.hasAnyProgress ? <ProofEmptyState /> : null}

      <Grid
        cols={proofData.hasAnyProgress ? { md: 2 } : 1}
        gap="md"
        className={cn(proofData.hasAnyProgress && 'xl:grid-cols-[1.1fr_1fr]')}
      >
        <ProofChecklistCard checklist={proofData.checklist} />
        {!isUnderFinalReview ? (
          <ProofCertificateCard
            certificate={proofData.certificate}
            trust={proofData.trust}
            canGenerateShareLink={proofData.canGenerateShareLink}
            shareLink={shareLink}
            isGeneratingShareLink={isGeneratingShareLink}
            shareError={shareError}
            isCopying={isCopying}
            onGenerateShareLink={handleGenerateShareLink}
            onCopyShareLink={handleCopyShareLink}
            onTrackShare={handleTrackShare}
          />
        ) : null}
      </Grid>

      {isUnderFinalReview ? (
        <Section>
          <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2 max-w-md mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {studentCopy.proof.underFinalReview.heading}
            </p>
            <p className="text-sm text-muted-foreground">
              {studentCopy.proof.underFinalReview.desc}
            </p>
          </div>
        </Section>
      ) : null}

      {proofData.certificate.issued && proofData.certificate.certificateId ? (
        <CertificatePaymentCard
          certificateId={proofData.certificate.certificateId}
          paymentStatus={proofData.certificate.paymentStatus ?? 'unpaid'}
          paidAt={null}
        />
      ) : null}
        </Stack>
      </Section>
    </PageShell>
  );
}

function getAbsoluteShareLink(sharePath: string | null): string | null {
  if (!sharePath) {
    return null;
  }

  if (typeof window === 'undefined') {
    return sharePath;
  }

  return `${window.location.origin}${sharePath}`;
}
