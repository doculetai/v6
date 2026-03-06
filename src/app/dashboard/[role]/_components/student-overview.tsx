import {
  ArrowRight,
  Money,
  CheckCircle,
  Files,
  GraduationCap,
  ShieldCheck,
} from '@/components/icons';
import Link from 'next/link';

import { ActivityTimeline } from '@/components/ui/activity-timeline';
import type { ActivityTimelineItem } from '@/components/ui/activity-timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { JourneyProgress } from '@/components/ui/journey-progress';
import { studentHomeCopy } from '@/config/copy/dashboard-shell';
import type { StudentDocumentType } from '@/lib/documents';
import { studentDocumentTypeValues } from '@/lib/documents';
import { getFirstName } from '@/lib/get-first-name';
import { formatCurrency } from '@/lib/utils';
import { computeStudentJourney } from '@/lib/journey/student';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';
import { StudentOverviewSheets } from './student-overview-sheets';

type DocumentItem = {
  id: string;
  type: StudentDocumentType;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  createdAt: Date;
  reviewedAt: Date | null;
};

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

type StudentOverviewProps = {
  email: string;
  phone: string | null;
  caller: Awaited<ReturnType<typeof api>>;
};

export async function StudentOverview({ email, phone, caller }: StudentOverviewProps) {
  const firstName = getFirstName(email);
  const totalRequired = studentDocumentTypeValues.length;
  const copy = studentHomeCopy;

  const [verificationResult, schoolSelectionResult, documentsResult, schoolsResult, balanceResult] =
    await Promise.allSettled([
      caller.student.getVerificationStatus(),
      caller.student.getStudentSchoolSelection(),
      caller.student.listDocuments(),
      caller.student.listSchools({}),
      caller.student.getBalanceStatus(),
    ]);

  const verification =
    verificationResult.status === 'fulfilled' ? verificationResult.value : null;
  const schoolSelection =
    schoolSelectionResult.status === 'fulfilled' ? schoolSelectionResult.value : null;
  const documents = documentsResult.status === 'fulfilled' ? documentsResult.value : [];
  const schools = schoolsResult.status === 'fulfilled' ? schoolsResult.value : [];
  const balance =
    balanceResult.status === 'fulfilled' ? balanceResult.value : null;

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
  const phoneVerified = Boolean(phone);
  const kycFailedAttempts = verification?.kycFailedAttempts ?? 0;

  const allDocsApproved = approvedCount >= totalRequired && uploadedCount >= totalRequired;
  const verificationComplete = completionPercent >= 100;
  const journeyState = computeStudentJourney(
    {
      onboardingComplete: Boolean(schoolSelection?.schoolId),
      verificationComplete,
      documentsComplete: allDocsApproved,
      proofReady: false, // cert issuance status not yet fetched on overview
    },
    copy.journey,
  );

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={copy.welcomeTitle(firstName)}
          description={copy.journeySubtitle}
        />

        <JourneyProgress
          stages={journeyState.stages}
          nextAction={journeyState.nextAction}
          allComplete={journeyState.allComplete}
          completionMessage={journeyState.completionMessage}
        />

        <Grid cols={{ sm: 3 }} gap="md" className="mt-6">
          <StatCard
            icon={<ShieldCheck className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.verification.label}
            value={copy.stats.verification.percent(completionPercent)}
            sub={
              highestTier > 0
                ? copy.stats.verification.tierPassed(highestTier)
                : copy.stats.verification.notStartedLabel
            }
            accent={completionPercent > 0}
            href="/dashboard/student/proof"
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
            href="/dashboard/student/documents"
          />
          <StatCard
            icon={<Money className="size-4.5" weight="duotone" aria-hidden="true" />}
            label={copy.stats.bankAccount.label}
            value={bankConnected ? copy.stats.bankAccount.linkedLabel : copy.stats.bankAccount.notLinkedLabel}
            sub={
              balance?.hasVerifiedBalance && balance.verifiedAmountKobo != null
                ? copy.stats.bankAccount.verifiedBalanceLabel(
                    formatCurrency(balance.verifiedAmountKobo / 100),
                  )
                : bankName ?? (bankConnected ? '' : copy.stats.bankAccount.requiredSub)
            }
            accent={bankConnected}
            href="/dashboard/student/documents#bank"
          />
        </Grid>

        <Card className="border-border bg-card mt-6">
          <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <GraduationCap className="size-4.5" weight="duotone" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {copy.school.sectionLabel}
                </p>
                {selectedSchool ? (
                  <>
                    <p className="mt-0.5 text-base font-semibold text-foreground">
                      {selectedSchool.name}
                    </p>
                    {selectedProgram ? (
                      <p className="text-sm text-muted-foreground">
                        {selectedProgram.name}
                        {' · '}
                        {copy.school.durationLabel(selectedProgram.durationMonths)}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {copy.school.notSelectedTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {copy.school.notSelectedDescription}
                    </p>
                  </>
                )}
              </div>
            </div>
            {selectedSchool ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <CheckCircle className="size-3.5" weight="duotone" aria-hidden="true" />
                {copy.school.selectedLabel}
              </span>
            ) : (
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href={copy.school.ctaHref} className="inline-flex items-center gap-1.5">
                  {copy.school.ctaLabel}
                  <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
        {documents.length > 0 ? (
          <Card className="border-border bg-card mt-6">
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                {copy.recentActivity.sectionLabel}
              </p>
              <ActivityTimeline
                items={deriveActivityItems(documents, copy.recentActivity)}
                emptyLabel={copy.recentActivity.empty}
              />
            </CardContent>
          </Card>
        ) : null}
      </Section>

      <StudentOverviewSheets
        phoneVerified={phoneVerified}
        kycFailedAttempts={kycFailedAttempts}
      />
    </PageShell>
  );
}
