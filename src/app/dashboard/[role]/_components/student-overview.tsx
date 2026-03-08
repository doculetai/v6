import {
  CheckCircle,
  Circle,
  Files,
  List,
  Medal,
  Money,
  ShieldCheck,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { studentHomeCopy } from '@/config/copy/dashboard-shell';
import { studentDocumentTypeValues, type StudentDocumentType } from '@/lib/documents';
import { api } from '@/trpc/server';
import { cn } from '@/lib/utils';

import { StatCard } from './overview-shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StudentOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

type StepStatus = 'complete' | 'verified' | 'pending' | 'locked';

type OverviewStep = {
  id: string;
  label: string;
  status: StepStatus | string;
};

type DocumentRow = {
  id: string;
  type: StudentDocumentType;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  createdAt: Date;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFirstName(email: string): string {
  const raw = email.split('@')[0] ?? '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

const documentTypeLabels: Record<StudentDocumentType, string> = {
  passport: 'Passport',
  bank_statement: 'Bank statement',
  offer_letter: 'Offer letter',
  affidavit: 'Affidavit',
  cac: 'CAC document',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepIcon({ status }: { status: StepStatus | string }) {
  if (status === 'complete' || status === 'verified') {
    return (
      <CheckCircle
        className="size-6 text-primary"
        weight="duotone"
        aria-hidden="true"
      />
    );
  }
  if (status === 'pending') {
    return (
      <div
        className="flex size-6 items-center justify-center rounded-full border-2 border-primary bg-primary/10"
        aria-hidden="true"
      >
        <span className="size-2 rounded-full bg-primary" />
      </div>
    );
  }
  // locked or unknown
  return (
    <Circle
      className="size-6 text-border"
      weight="duotone"
      aria-hidden="true"
    />
  );
}

function StepStatusLabel({ status }: { status: StepStatus | string }) {
  if (status === 'complete') {
    return <span className="text-[11px] font-medium text-primary">Complete</span>;
  }
  if (status === 'verified') {
    return <span className="text-[11px] font-medium text-primary">Verified</span>;
  }
  if (status === 'pending') {
    return <span className="text-[11px] font-medium text-amber-600">Pending</span>;
  }
  if (status === 'locked') {
    return <span className="text-[11px] text-muted-foreground/60">Locked</span>;
  }
  // e.g. "4 of 5"
  return <span className="text-[11px] font-medium text-foreground">{status}</span>;
}

function SixStepTracker({ steps }: { steps: OverviewStep[] }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
      <div className="hidden items-start sm:flex">
        {steps.map((step, i) => {
          const isLocked = step.status === 'locked';
          return (
            <div key={step.id} className="flex flex-1 items-start">
              <div
                className={cn(
                  'flex min-w-0 flex-col items-center gap-1.5 text-center',
                  isLocked && 'opacity-50',
                )}
              >
                <StepIcon status={step.status} />
                <span className="text-xs font-medium leading-tight text-foreground">
                  {step.label}
                </span>
                <StepStatusLabel status={step.status} />
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-1 mt-3 h-0.5 flex-1',
                    step.status === 'complete' || step.status === 'verified'
                      ? 'bg-primary/40'
                      : 'bg-border',
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Mobile: progress bar */}
      <div className="sm:hidden">
        {(() => {
          const completedCount = steps.filter(
            (s) => s.status === 'complete' || s.status === 'verified',
          ).length;
          const pct = Math.round((completedCount / steps.length) * 100);
          const current = steps.find(
            (s) => s.status === 'pending' || (s.status !== 'complete' && s.status !== 'verified' && s.status !== 'locked'),
          ) ?? steps[completedCount] ?? steps[steps.length - 1];
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{current?.label}</p>
                <p className="text-xs text-muted-foreground">
                  {completedCount} of {steps.length}
                </p>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200 ease-out"
                  style={{ width: `${pct}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function ActivityEmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <List className="size-8 text-muted-foreground/50" weight="duotone" aria-hidden="true" />
      <p className="text-sm font-medium text-muted-foreground">
        {studentHomeCopy.recentActivity.emptyHeading}
      </p>
      <p className="max-w-xs text-sm text-muted-foreground/70">
        {studentHomeCopy.recentActivity.emptyDescription}
      </p>
    </div>
  );
}

function RecentActivityTable({ documents }: { documents: DocumentRow[] }) {
  const copy = studentHomeCopy.recentActivity;
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
      <div className="flex items-center justify-between pb-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          {copy.heading}
        </p>
        <Link
          href="/dashboard/student/documents"
          className="text-xs font-medium text-primary hover:underline"
        >
          {copy.viewAll}
        </Link>
      </div>
      {documents.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 text-xs font-medium text-muted-foreground">{copy.colDocument}</th>
              <th className="pb-2 text-xs font-medium text-muted-foreground">{copy.colStatus}</th>
              <th className="pb-2 text-right text-xs font-medium text-muted-foreground">
                {copy.colDate}
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.slice(0, 5).map((doc) => (
              <tr key={doc.id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 pr-4">
                  <span
                    className={cn(
                      'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
                      doc.status === 'approved' && 'bg-success/10 text-success',
                      doc.status === 'rejected' && 'bg-destructive/10 text-destructive',
                      (doc.status === 'pending' || doc.status === 'more_info_requested') &&
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    )}
                  >
                    {documentTypeLabels[doc.type] ?? doc.type}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">
                  {doc.status === 'pending'
                    ? 'Under review'
                    : doc.status === 'approved'
                      ? 'Approved'
                      : doc.status === 'rejected'
                        ? 'Rejected'
                        : 'More info needed'}
                </td>
                <td className="py-2.5 text-right text-muted-foreground">
                  {doc.createdAt.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ActivityEmptyState />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export async function StudentOverview({ email, caller }: StudentOverviewProps) {
  const firstName = getFirstName(email);
  const totalRequired = studentDocumentTypeValues.length;
  const copy = studentHomeCopy;

  const [verificationResult, schoolSelectionResult, documentsResult, proofCertificateResult] =
    await Promise.allSettled([
      caller.student.getVerificationStatus(),
      caller.student.getStudentSchoolSelection(),
      caller.student.listDocuments(),
      caller.student.getProofCertificate(),
    ]);

  const verification =
    verificationResult.status === 'fulfilled' ? verificationResult.value : null;
  const schoolSelection =
    schoolSelectionResult.status === 'fulfilled' ? schoolSelectionResult.value : null;
  const documents = documentsResult.status === 'fulfilled' ? documentsResult.value : [];
  const proofCertificate =
    proofCertificateResult.status === 'fulfilled' ? proofCertificateResult.value : null;

  const completionPercent = verification?.completionPercent ?? 0;
  const highestTier =
    verification?.tiers
      .filter((t) => t.isComplete)
      .map((t) => t.tier)
      .sort((a, b) => b - a)[0] ?? 0;
  const uploadedCount = documents.length;
  const approvedCount = documents.filter((d) => d.status === 'approved').length;
  const bankConnected = verification?.monoConnection.isConnected ?? false;
  const bankName = verification?.monoConnection.bankName ?? null;
  const allDocsApproved = approvedCount >= totalRequired && uploadedCount >= totalRequired;
  const onboardingComplete = Boolean(schoolSelection?.schoolId);
  const t1Complete = Boolean(verification?.tiers.find((t) => t.tier === 1)?.isComplete);
  const t2Complete = Boolean(verification?.tiers.find((t) => t.tier === 2)?.isComplete);
  const proofReady = proofCertificate?.certificate.issued === true;

  // ---------------------------------------------------------------------------
  // 6-step stepper data
  // ---------------------------------------------------------------------------

  const docsStatus: StepStatus | string =
    allDocsApproved
      ? 'complete'
      : uploadedCount > 0
        ? `${uploadedCount} of ${totalRequired}`
        : 'locked';

  const identityStatus: StepStatus =
    t2Complete ? 'verified' : t1Complete ? 'pending' : 'locked';

  const steps: OverviewStep[] = [
    {
      id: 'onboarding',
      label: 'Onboarding',
      status: onboardingComplete ? 'complete' : 'pending',
    },
    {
      id: 'phone',
      label: 'Phone',
      status: t1Complete ? 'verified' : 'pending',
    },
    {
      id: 'identity',
      label: 'Identity',
      status: identityStatus,
    },
    {
      id: 'banking',
      label: 'Banking',
      status: bankConnected ? 'verified' : 'locked',
    },
    {
      id: 'documents',
      label: 'Documents',
      status: docsStatus,
    },
    {
      id: 'certificate',
      label: 'Certificate',
      status: proofReady ? 'verified' : 'locked',
    },
  ];

  // ---------------------------------------------------------------------------
  // Continue banner — show only if there is a clear next step
  // ---------------------------------------------------------------------------

  const nextStepHref = !onboardingComplete
    ? '/dashboard/student/onboarding'
    : !t1Complete
      ? '/dashboard/student/verification'
      : !t2Complete
        ? '/dashboard/student/verification'
        : !bankConnected
          ? '/dashboard/student/verification'
          : uploadedCount < totalRequired
            ? '/dashboard/student/documents'
            : null;

  // ---------------------------------------------------------------------------
  // Documents for activity table
  // ---------------------------------------------------------------------------

  const documentRows: DocumentRow[] = (
    documents as Array<{
      id: string;
      type: StudentDocumentType;
      status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
      createdAt: Date;
    }>
  ).map((d) => ({
    id: d.id,
    type: d.type,
    status: d.status,
    createdAt: d.createdAt,
  }));

  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="md">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
              {copy.sectionLabel}
            </p>
            <PageHeader title={copy.title} />
          </div>

          {/* 6-step horizontal stepper */}
          <SixStepTracker steps={steps} />

          {/* Continue your application banner */}
          {!proofReady && nextStepHref ? (
            <div className="rounded-xl border-l-4 border-l-primary bg-primary/[0.04] px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                    Next step
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {copy.continueBanner.heading}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {copy.continueBanner.description}
                  </p>
                </div>
                <Link
                  href={nextStepHref}
                  className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {copy.continueBanner.cta}
                </Link>
              </div>
            </div>
          ) : null}

          {/* 4 stat cards */}
          <Grid cols={{ sm: 2, lg: 4 }} gap="md">
            <StatCard
              icon={<ShieldCheck className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.verification.label}
              value={
                completionPercent > 0
                  ? copy.stats.verification.percent(completionPercent)
                  : copy.stats.verification.notStartedLabel
              }
              sub={
                highestTier > 0
                  ? copy.stats.verification.tierPassed(highestTier)
                  : copy.stats.verification.identityPendingLabel
              }
              accent={completionPercent > 0}
            />
            <StatCard
              icon={<Files className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.documents.label}
              value={copy.stats.documents.countLabel(uploadedCount, totalRequired)}
              sub={
                approvedCount === uploadedCount && uploadedCount > 0
                  ? copy.stats.documents.allApprovedLabel
                  : copy.stats.documents.approvedCount(approvedCount)
              }
              accent={uploadedCount > 0}
            />
            <StatCard
              icon={<Money className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.bankAccount.label}
              value={
                bankConnected
                  ? copy.stats.bankAccount.linkedLabel
                  : copy.stats.bankAccount.notLinkedLabel
              }
              sub={bankName ?? (bankConnected ? '' : copy.stats.bankAccount.requiredSub)}
              accent={bankConnected}
            />
            <StatCard
              icon={<Medal className="size-4.5" weight="duotone" aria-hidden="true" />}
              label={copy.stats.certificate.label}
              value={
                proofReady
                  ? copy.stats.certificate.issuedLabel
                  : copy.stats.certificate.notIssuedLabel
              }
              sub={proofReady ? '' : copy.stats.certificate.notIssuedSub}
              accent={proofReady}
            />
          </Grid>

          {/* Recent activity table */}
          <RecentActivityTable documents={documentRows} />
        </Stack>
      </Section>
    </PageShell>
  );
}
