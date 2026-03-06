'use client';

import { useMemo, useState, useTransition } from 'react';

import { ProofCertificateCard } from '@/components/student/ProofCertificateCard';
import { ProofChecklistCard } from '@/components/student/ProofChecklistCard';
import { ProofEmptyState } from '@/components/student/ProofEmptyState';
import { PageShell, Stack } from '@/components/layout/content-primitives';
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
            },
            canGenerateShareLink: true,
          }));
        })
        .catch(() => {
          setShareError(studentCopy.proof.states.shareError);
        });
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

  return (
    <PageShell width="default">
      <Stack gap="md">
      <PageHeader
        title={studentCopy.proof.title}
        description={studentCopy.proof.subtitle}
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard/student' },
          { label: 'Proof of Funds' },
        ]}
      />

      {!proofData.hasAnyProgress ? <ProofEmptyState /> : null}

      <div
        className={cn(
          'grid gap-6',
          proofData.hasAnyProgress ? 'md:grid-cols-2 xl:grid-cols-[1.1fr_1fr]' : 'md:grid-cols-1',
        )}
      >
        <ProofChecklistCard checklist={proofData.checklist} />
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
        />
      </div>
      </Stack>
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
