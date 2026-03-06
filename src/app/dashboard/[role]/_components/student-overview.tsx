import {
  ArrowRight,
  Money,
  CheckCircle,
  Files,
  GraduationCap,
  ShieldCheck,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

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
import { studentDocumentTypeValues } from '@/lib/documents';
import { getFirstName } from '@/lib/get-first-name';
import { computeStudentJourney } from '@/lib/journey/student';
import { api } from '@/trpc/server';

import { StatCard } from './overview-shared';

type StudentOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

export async function StudentOverview({ email, caller }: StudentOverviewProps) {
  const firstName = getFirstName(email);
  const totalRequired = studentDocumentTypeValues.length;
  const copy = studentHomeCopy;

  const [verificationResult, schoolSelectionResult, documentsResult, schoolsResult] =
    await Promise.allSettled([
      caller.student.getVerificationStatus(),
      caller.student.getStudentSchoolSelection(),
      caller.student.listDocuments(),
      caller.student.listSchools({}),
    ]);

  const verification =
    verificationResult.status === 'fulfilled' ? verificationResult.value : null;
  const schoolSelection =
    schoolSelectionResult.status === 'fulfilled' ? schoolSelectionResult.value : null;
  const documents = documentsResult.status === 'fulfilled' ? documentsResult.value : [];
  const schools = schoolsResult.status === 'fulfilled' ? schoolsResult.value : [];

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
  const journeyState = computeStudentJourney(
    {
      schoolSelected: Boolean(schoolSelection?.schoolId),
      completionPercent,
      uploadedCount,
      totalRequired,
      bankConnected,
      allDocsApproved,
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
            value={bankConnected ? copy.stats.bankAccount.linkedLabel : copy.stats.bankAccount.notLinkedLabel}
            sub={bankName ?? (bankConnected ? '' : copy.stats.bankAccount.requiredSub)}
            accent={bankConnected}
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
      </Section>
    </PageShell>
  );
}
