import {
  ArrowRight,
  CheckCircle,
  List,
  SealCheck,
  Warning,
} from '@/components/icons';
import Link from 'next/link';

import { ActivityTimeline } from '@/components/ui/activity-timeline';
import type { ActivityTimelineItem } from '@/components/ui/activity-timeline';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { JourneyProgress } from '@/components/ui/journey-progress';
import { studentHomeCopy } from '@/config/copy/dashboard-shell';
import { studentCopy } from '@/config/copy/student';
import type { StudentDocumentType } from '@/lib/documents';
import { studentDocumentTypeValues } from '@/lib/documents';
import { getFirstName } from '@/lib/get-first-name';
import { formatCurrency } from '@/lib/utils';
import { computeStudentJourney } from '@/lib/journey/student';
import { api } from '@/trpc/server';
import { StudentSponsorInviteCard } from '@/components/student/StudentSponsorInviteCard';
import { SponsorCommittedCard } from '@/components/student/SponsorCommittedCard';
import { SponsorWithdrawnCard } from '@/components/student/SponsorWithdrawnCard';
import { CertIssuedOverviewCard } from '@/components/student/CertIssuedOverviewCard';
import { BeginApplicationCard } from '@/components/student/BeginApplicationCard';
import { PhoneVerificationPromptCard } from '@/components/student/PhoneVerificationPromptCard';

import { StatCard } from './overview-shared';
import { routes } from '@/config/routes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DocumentItem = {
  id: string;
  type: StudentDocumentType;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested' | 'expired';
  createdAt: Date;
  reviewedAt: Date | null;
};

type StudentOverviewProps = {
  email: string;
  schoolDeactivated?: boolean;
  caller: Awaited<ReturnType<typeof api>>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ActivityCopy = typeof studentHomeCopy.recentActivity;

function deriveActivityItems(
  docs: DocumentItem[],
  activityCopy: ActivityCopy,
): ActivityTimelineItem[] {
  const items: ActivityTimelineItem[] = [];

  for (const doc of docs) {
    const typeLabel = activityCopy.documentTypeLabels[doc.type] ?? doc.type;

    items.push({
      id: `upload-${doc.id}`,
      title: activityCopy.documentUploaded(typeLabel),
      timestamp: doc.createdAt.toISOString(),
      tone: 'info',
    });

    if (doc.status === 'approved' && doc.reviewedAt) {
      items.push({
        id: `approved-${doc.id}`,
        title: activityCopy.documentApproved(typeLabel),
        timestamp: doc.reviewedAt.toISOString(),
        tone: 'success',
      });
    } else if (doc.status === 'rejected' && doc.reviewedAt) {
      items.push({
        id: `rejected-${doc.id}`,
        title: activityCopy.documentRejected(typeLabel),
        timestamp: doc.reviewedAt.toISOString(),
        tone: 'error',
      });
    } else if (doc.status === 'pending') {
      items.push({
        id: `pending-${doc.id}`,
        title: activityCopy.documentPending(typeLabel),
        timestamp: doc.createdAt.toISOString(),
        tone: 'neutral',
      });
    }
  }

  return items.slice(0, 10);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SchoolAlert() {
  const copy = studentHomeCopy.schoolAlert;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4"
    >
      <Warning
        className="mt-0.5 size-5 shrink-0 text-destructive"
        weight="duotone"
        aria-hidden="true"
      />
      <p className="text-sm text-destructive">{copy.message}</p>
    </div>
  );
}

function CertifiedBanner({
  firstName,
  schoolName,
}: {
  firstName: string;
  schoolName: string | null;
}) {
  const copy = studentHomeCopy.certified;
  const description = schoolName
    ? copy.description(firstName, schoolName)
    : copy.descriptionNoSchool(firstName);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/[0.04] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
          <SealCheck className="size-3.5" weight="duotone" aria-hidden="true" />
          {copy.eyebrow}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{copy.heading}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild size="sm" className="mt-1 min-h-11 shrink-0 sm:mt-0">
        <Link href={copy.ctaHref} className="inline-flex items-center gap-1.5">
          {copy.cta}
          <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

function SchoolStrip({
  schoolName,
  programName,
  durationMonths,
}: {
  schoolName: string | null;
  programName: string | null;
  durationMonths: number | null;
}) {
  const copy = studentHomeCopy.school;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {copy.sectionLabel}
        </p>
        {schoolName ? (
          <>
            <p className="mt-1 text-sm font-semibold text-foreground">{schoolName}</p>
            {programName ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {programName}
                {durationMonths ? ` · ${copy.durationLabel(durationMonths)}` : null}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="mt-1 text-sm font-medium text-foreground">{copy.notSelectedTitle}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{copy.notSelectedDescription}</p>
          </>
        )}
      </div>
      {schoolName ? (
        <span
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary"
        >
          <CheckCircle className="size-3.5" weight="duotone" aria-hidden="true" />
          {copy.selectedLabel}
        </span>
      ) : (
        <Button asChild size="sm" variant="outline" className="min-h-11 shrink-0">
          <Link href={copy.ctaHref} className="inline-flex items-center gap-1.5">
            {copy.ctaLabel}
            <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function ActivityEmptyState() {
  const copy = studentHomeCopy.recentActivity;
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <List
        className="size-8 text-muted-foreground/50"
        weight="duotone"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-muted-foreground">{copy.emptyHeading}</p>
      <p className="max-w-xs text-sm text-muted-foreground/70">{copy.emptyDescription}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export async function StudentOverview({
  email,
  schoolDeactivated = false,
  caller,
}: StudentOverviewProps) {
  const firstName = getFirstName(email);
  const totalRequired = studentDocumentTypeValues.length;
  const copy = studentHomeCopy;

  const [
    verificationResult,
    schoolSelectionResult,
    documentsResult,
    schoolsResult,
    balanceResult,
    proofCertificateResult,
    sponsorInvitesResult,
    committedSponsorsResult,
    withdrawnSponsorsResult,
  ] = await Promise.allSettled([
    caller.student.getVerificationStatus(),
    caller.student.getStudentSchoolSelection(),
    caller.student.listDocuments(),
    caller.student.listSchools({}),
    caller.student.getBalanceStatus(),
    caller.student.getProofCertificate(),
    caller.student.listSponsorInvites(),
    caller.student.listCommittedSponsors(),
    caller.student.listWithdrawnSponsors(),
  ]);

  const verification =
    verificationResult.status === 'fulfilled' ? verificationResult.value : null;
  const schoolSelection =
    schoolSelectionResult.status === 'fulfilled' ? schoolSelectionResult.value : null;
  const documents = documentsResult.status === 'fulfilled' ? documentsResult.value : [];
  const schools = schoolsResult.status === 'fulfilled' ? schoolsResult.value : [];
  const balance = balanceResult.status === 'fulfilled' ? balanceResult.value : null;
  const proofCertificate =
    proofCertificateResult.status === 'fulfilled' ? proofCertificateResult.value : null;
  const sponsorInvites =
    sponsorInvitesResult.status === 'fulfilled' ? sponsorInvitesResult.value : [];
  const committedSponsors =
    committedSponsorsResult.status === 'fulfilled' ? committedSponsorsResult.value : [];
  const withdrawnSponsors =
    withdrawnSponsorsResult.status === 'fulfilled' ? withdrawnSponsorsResult.value : [];

  const selectedSchool = schools.find((s) => s.id === schoolSelection?.schoolId) ?? null;
  const selectedProgram =
    selectedSchool?.programs.find((p) => p.id === schoolSelection?.programId) ?? null;

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
  const verificationComplete = completionPercent >= 100;
  const onboardingComplete = Boolean(schoolSelection?.schoolId);
  const t1Complete = Boolean(verification?.tiers.find((t) => t.tier === 1)?.isComplete);
  const documentsComplete = allDocsApproved;

  // proofReady is true only when the DB confirms an active certificate is issued.
  // Falls back to false if the proof query failed, preventing a false-positive banner.
  const proofReady = proofCertificate?.certificate.issued === true;

  const journeyState = computeStudentJourney(
    {
      onboardingComplete,
      verificationComplete,
      documentsComplete,
      proofReady,
    },
    copy.journey,
  );

  const hasAnyVerificationActivity =
    (verification?.tiers[0]?.isComplete === true) || documents.length > 0;
  const isBrandNew =
    !onboardingComplete && !verificationComplete && !documentsComplete && !hasAnyVerificationActivity;

  const requiresSponsor =
    verification?.fundingType === 'sponsor' || verification?.fundingType === 'corporate';
  const hasAcceptedSponsor = sponsorInvites.some((inv) => inv.status === 'accepted');
  const showSponsorInviteCard = requiresSponsor && !hasAcceptedSponsor && !proofReady;

  const activityItems = deriveActivityItems(
    (documents as Array<{
      id: string;
      type: StudentDocumentType;
      status: 'pending' | 'approved' | 'rejected' | 'more_info_requested' | 'expired';
      createdAt: Date;
      reviewedAt: Date | null;
    }>).map((d) => ({
      id: d.id,
      type: d.type,
      status: d.status,
      createdAt: d.createdAt,
      reviewedAt: d.reviewedAt,
    })),
    copy.recentActivity,
  );

  const pageTitle = proofReady ? copy.postCert.heading : copy.title;

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={pageTitle}
          description={copy.welcomeTitle(firstName)}
        />

        <Stack gap="md">
          {/* School deactivated alert — always at top when present */}
          {schoolDeactivated ? <SchoolAlert /> : null}

          {/* Post-cert: certificate card elevated to top, no progress tracker */}
          {proofReady ? (
            <>
              <CertIssuedOverviewCard
                certificateId={proofCertificate?.certificate.certificateId ?? null}
                issuedAt={proofCertificate?.certificate.issuedAt ?? null}
              />

              {/* Tabs: Activity only (journey tracker removed post-cert) */}
              <Tabs defaultValue="activity">
                <TabsList
                  aria-label={copy.tabs.ariaLabel}
                  className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0"
                >
                  <TabsTrigger
                    value="activity"
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    {copy.tabs.activity}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-6 outline-none">
                  <Stack gap="md">
                    {/* Stat cards */}
                    <Grid cols={{ sm: 3 }} gap="md">
                      <StatCard
                        label={copy.stats.verification.label}
                        value={
                          completionPercent > 0
                            ? copy.stats.verification.percent(completionPercent)
                            : copy.stats.verification.notStartedLabel
                        }
                        sub={highestTier > 0 ? copy.stats.verification.tierPassed(highestTier) : ''}
                        accent={completionPercent > 0}
                        href={routes.dashboard.student.verification}
                      />
                      <StatCard
                        label={copy.stats.documents.label}
                        value={copy.stats.documents.countLabel(uploadedCount, totalRequired)}
                        sub={
                          approvedCount === uploadedCount && uploadedCount > 0
                            ? copy.stats.documents.allApprovedLabel
                            : copy.stats.documents.approvedCount(approvedCount)
                        }
                        accent={uploadedCount > 0}
                        href={routes.dashboard.student.documents}
                      />
                      <StatCard
                        label={copy.stats.bankAccount.label}
                        value={
                          selectedProgram
                            ? copy.stats.bankAccount.balanceVsTarget(
                                formatCurrency(
                                  balance?.hasVerifiedBalance && balance.verifiedAmountKobo != null
                                    ? balance.verifiedAmountKobo / 100
                                    : 0,
                                ),
                                formatCurrency(selectedProgram.tuitionAmount / 100),
                              )
                            : bankConnected
                              ? copy.stats.bankAccount.linkedLabel
                              : copy.stats.bankAccount.notStartedLabel
                        }
                        valueClassName="font-mono tabular-nums"
                        sub={
                          selectedProgram
                            ? bankConnected
                              ? bankName ?? copy.stats.bankAccount.linkedLabel
                              : copy.stats.bankAccount.requiredSub
                            : copy.stats.bankAccount.selectProgramSub
                        }
                        accent={bankConnected}
                        href={routes.dashboard.student.documentsBank}
                      />
                    </Grid>

                    {/* Activity timeline */}
                    <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
                      {activityItems.length > 0 ? (
                        <ActivityTimeline items={activityItems} />
                      ) : (
                        <ActivityEmptyState />
                      )}
                    </div>
                  </Stack>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <>
              {/* Pre-cert: begin application card — shown until onboarding is complete */}
              {!onboardingComplete ? <BeginApplicationCard /> : null}

              {/* Phone verification prompt — shown after onboarding, before T1 is complete */}
              {onboardingComplete && !t1Complete ? <PhoneVerificationPromptCard /> : null}

              {/* Tabs: Journey | Activity */}
              <Tabs defaultValue="journey">
                {/* Tab list — editorial underline style via inline override */}
                <TabsList
                  aria-label={copy.tabs.ariaLabel}
                  className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0"
                >
                  <TabsTrigger
                    value="journey"
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    {copy.tabs.journey}
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    {copy.tabs.activity}
                  </TabsTrigger>
                </TabsList>

                {/* Journey tab */}
                <TabsContent value="journey" className="mt-6 outline-none">
                  <Stack gap="md">
                    {/* Journey stages tracker */}
                    <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
                      <JourneyProgress
                        stages={journeyState.stages}
                        nextAction={journeyState.nextAction}
                        allComplete={journeyState.allComplete}
                        completionMessage={journeyState.completionMessage}
                      />
                    </div>

                    {/* Sponsor invite card — only for sponsor/corporate funding with no accepted sponsor yet */}
                    {showSponsorInviteCard ? <StudentSponsorInviteCard /> : null}

                    {/* B6.1: Multi-sponsor combined card vs single-sponsor card */}
                    {committedSponsors.length > 1 ? (
                      <div className="rounded-xl border border-success/30 bg-success/5 px-5 py-4 dark:border-success/40 dark:bg-success/10">
                        <p className="font-mono text-sm font-semibold text-foreground">
                          {studentCopy.multiSponsor.heading(
                            formatCurrency(
                              committedSponsors.reduce((sum, s) => sum + s.amountKobo / 100, 0),
                            ),
                          )}
                        </p>
                        <div className="mt-3 divide-y divide-border">
                          {committedSponsors.map((s) => (
                            <div key={s.id} className="flex items-center justify-between py-2.5">
                              <span className="text-sm text-foreground">{s.sponsorName}</span>
                              <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                                {formatCurrency(s.amountKobo / 100)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      committedSponsors.map((s) => (
                        <SponsorCommittedCard
                          key={s.id}
                          sponsorName={s.sponsorName}
                          amountKobo={s.amountKobo}
                          currency={s.currency}
                          fundingTypeLabel={s.fundingTypeLabel}
                        />
                      ))
                    )}

                    {/* Withdrawn sponsor cards */}
                    {withdrawnSponsors.map((s) => (
                      <SponsorWithdrawnCard
                        key={s.id}
                        sponsorName={s.sponsorName}
                        setupHref={routes.dashboard.student.setup}
                      />
                    ))}

                    {/* Stat cards */}
                    <Grid cols={{ sm: 3 }} gap="md">
                      <StatCard
                        label={copy.stats.verification.label}
                        value={
                          completionPercent > 0
                            ? copy.stats.verification.percent(completionPercent)
                            : copy.stats.verification.notStartedLabel
                        }
                        sub={highestTier > 0 ? copy.stats.verification.tierPassed(highestTier) : ''}
                        accent={completionPercent > 0}
                        href={routes.dashboard.student.verification}
                      />
                      <StatCard
                        label={copy.stats.documents.label}
                        value={copy.stats.documents.countLabel(uploadedCount, totalRequired)}
                        sub={
                          approvedCount === uploadedCount && uploadedCount > 0
                            ? copy.stats.documents.allApprovedLabel
                            : copy.stats.documents.approvedCount(approvedCount)
                        }
                        accent={uploadedCount > 0}
                        href={routes.dashboard.student.documents}
                      />
                      <StatCard
                        label={copy.stats.bankAccount.label}
                        value={
                          selectedProgram
                            ? copy.stats.bankAccount.balanceVsTarget(
                                formatCurrency(
                                  balance?.hasVerifiedBalance && balance.verifiedAmountKobo != null
                                    ? balance.verifiedAmountKobo / 100
                                    : 0,
                                ),
                                formatCurrency(selectedProgram.tuitionAmount / 100),
                              )
                            : bankConnected
                              ? copy.stats.bankAccount.linkedLabel
                              : copy.stats.bankAccount.notStartedLabel
                        }
                        valueClassName="font-mono tabular-nums"
                        sub={
                          selectedProgram
                            ? bankConnected
                              ? bankName ?? copy.stats.bankAccount.linkedLabel
                              : copy.stats.bankAccount.requiredSub
                            : copy.stats.bankAccount.selectProgramSub
                        }
                        accent={bankConnected}
                        href={routes.dashboard.student.documentsBank}
                      />
                    </Grid>

                    {/* School strip */}
                    <SchoolStrip
                      schoolName={selectedSchool?.name ?? null}
                      programName={selectedProgram?.name ?? null}
                      durationMonths={selectedProgram?.durationMonths ?? null}
                    />
                  </Stack>
                </TabsContent>

                {/* Activity tab */}
                <TabsContent value="activity" className="mt-6 outline-none">
                  <div className="rounded-xl border border-border bg-card px-5 py-5 shadow-xs">
                    {activityItems.length > 0 ? (
                      <ActivityTimeline items={activityItems} />
                    ) : (
                      <ActivityEmptyState />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </Stack>
      </Section>
    </PageShell>
  );
}
