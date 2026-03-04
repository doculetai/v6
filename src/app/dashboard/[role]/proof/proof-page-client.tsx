'use client';

import { useMemo, useState, useTransition } from 'react';

import { ProofCertificateCard } from '@/components/student/ProofCertificateCard';
import { ProofChecklistCard } from '@/components/student/ProofChecklistCard';
import { ProofEmptyState } from '@/components/student/ProofEmptyState';
import { studentCopy } from '@/config/copy/student';
import { cn } from '@/lib/utils';

type ProofChecklist = {
  kycComplete: boolean;
  bankComplete: boolean;
  sponsorComplete: boolean;
  documentsComplete: boolean;
  completedCount: number;
  totalCount: number;
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
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-foreground dark:text-foreground md:text-5xl">
          {studentCopy.proof.title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
          {studentCopy.proof.subtitle}
        </p>
      </header>

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
    </section>
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
