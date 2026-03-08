'use client';

import { useMemo, useState, useTransition } from 'react';

import { CheckCircle } from '@/components/icons';
import { CertificatePaymentCard } from '@/components/student/CertificatePaymentCard';
import { CertSharingSheet } from '@/components/student/CertSharingSheet';
import { ProofCertificateCard } from '@/components/student/ProofCertificateCard';
import { ProofChecklistCard } from '@/components/student/ProofChecklistCard';
import { ProofEmptyState } from '@/components/student/ProofEmptyState';
import { PageShell, Section, Stack, Grid, BlockedStateCard } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { studentCopy } from '@/config/copy/student';
import { useSponsorshipsRealtime } from '@/lib/supabase/useSponsorshipsRealtime';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

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
  /** B5.2: whether all 3 verification tiers are complete */
  verificationComplete?: boolean;
  /** B5.2: T1/T2/T3 tier status for blocked state */
  tierStatus?: { t1: boolean; t2: boolean; t3: boolean };
  /** B6.2: whether there is an expired cert with a renewal in progress */
  expiredCert?: boolean;
  renewalInProgress?: boolean;
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

  // B5.2: blocked state when verification incomplete
  if (initialData.verificationComplete === false) {
    const tierStatus = initialData.tierStatus ?? { t1: false, t2: false, t3: false };
    return (
      <PageShell width="default">
        <Section>
          <Stack gap="md">
            <PageHeader
              title={studentCopy.proof.title}
              description={studentCopy.proof.subtitle}
            />
            <BlockedStateCard
              heading={studentCopy.blockedStates.proof.heading}
              body={studentCopy.blockedStates.proof.body}
              action={{
                label: studentCopy.blockedStates.proof.cta,
                href: routes.dashboard.student.verification,
              }}
            />
            {/* Tier completion summary */}
            <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-3">
              {(['t1', 't2', 't3'] as const).map((tier, idx) => (
                <div key={tier} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {`Tier ${idx + 1}`}
                  </span>
                  <StatusBadge
                    status={tierStatus[tier] ? 'complete' : 'pending'}
                    label={tierStatus[tier] ? 'Done' : 'Pending'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </Stack>
        </Section>
      </PageShell>
    );
  }

  const [proofData, setProofData] = useState<StudentProofData>(initialData);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isGeneratingShareLink, startGeneratingShareLink] = useTransition();
  const [isSharingSheetOpen, setIsSharingSheetOpen] = useState(false);

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

  // B6.2: renewal dual-card state
  if (initialData.expiredCert && initialData.renewalInProgress) {
    return (
      <PageShell width="default">
        <Section>
          <Stack gap="md">
            <PageHeader
              title={studentCopy.proof.title}
              description={studentCopy.proof.subtitle}
            />
            {/* Expired cert — dimmed */}
            <div className="opacity-60">
              <div className="rounded-xl border border-border bg-card px-5 py-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {studentCopy.certStates.expired.badge}
                </p>
              </div>
            </div>
            {/* Renewal in progress */}
            <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
              <StatusBadge status="under_review" label={studentCopy.certStates.renewal.badge} size="sm" />
              <p className="text-sm text-muted-foreground">{studentCopy.certStates.renewal.note}</p>
            </div>
          </Stack>
        </Section>
      </PageShell>
    );
  }

  return (
    <PageShell width="default">
      <Section>
        <Stack gap="md">
          <PageHeader
            title={studentCopy.proof.title}
            description={studentCopy.proof.subtitle}
          />

      {!proofData.hasAnyProgress ? <ProofEmptyState /> : null}

      {(proofData.certificate.paymentStatus === 'paid' ||
        proofData.certificate.paymentStatus === 'waived') && (
        <PaymentBanner status={proofData.certificate.paymentStatus} />
      )}

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
            onOpenSharingSheet={
              proofData.certificate.issued && shareLink
                ? () => setIsSharingSheetOpen(true)
                : undefined
            }
          />
        ) : null}
      </Grid>

      {isUnderFinalReview ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {studentCopy.proof.underFinalReview.heading}
          </p>
          <p className="text-sm text-muted-foreground">
            {studentCopy.proof.underFinalReview.desc}
          </p>
        </div>
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

      {proofData.certificate.issued &&
      shareLink &&
      proofData.certificate.sharePath ? (
        <CertSharingSheet
          open={isSharingSheetOpen}
          onOpenChange={setIsSharingSheetOpen}
          verificationUrl={shareLink}
          downloadUrl={`/api/certificate/${proofData.certificate.sharePath.replace('/certificate/', '')}/pdf`}
          certId={proofData.certificate.certificateId ?? ''}
        />
      ) : null}
    </PageShell>
  );
}

function PaymentBanner({ status }: { status: 'paid' | 'waived' }) {
  const copy = studentCopy.proof.paymentBanner;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
      <CheckCircle size={16} weight="duotone" className="shrink-0" aria-hidden="true" />
      <span>{status === 'paid' ? copy.paid : copy.waived}</span>
    </div>
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
