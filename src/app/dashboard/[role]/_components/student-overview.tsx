import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  FileStack,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { studentHomeCopy } from '@/config/copy/dashboard-shell';
import { studentDocumentTypeValues } from '@/lib/documents';
import { api } from '@/trpc/server';

import { NextStepCard, StatCard } from './overview-shared';

type StudentOverviewProps = {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
};

function getFirstName(email: string): string {
  const raw = email.split('@')[0] ?? '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export async function StudentOverview({ email, caller }: StudentOverviewProps) {
  const totalRequired = studentDocumentTypeValues.length;
  const firstName = getFirstName(email);
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

  type StepKey = keyof typeof copy.nextSteps.items;
  const stepOrder: StepKey[] = [
    'selectSchool',
    'verifyIdentity',
    'uploadDocuments',
    'linkBankAccount',
  ];
  const activeSteps = stepOrder.filter((key) => {
    if (key === 'selectSchool') return !schoolSelection?.schoolId;
    if (key === 'verifyIdentity') return completionPercent < 100;
    if (key === 'uploadDocuments') return uploadedCount < totalRequired;
    if (key === 'linkBankAccount') return !bankConnected;
    return false;
  });
  const prioritySteps = activeSteps.slice(0, 2);

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description={copy.journeySubtitle}
        />
        <Grid cols={{ sm: 3 }} gap="md">
        <StatCard
          icon={<ShieldCheck className="size-4.5" aria-hidden="true" />}
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
          icon={<FileStack className="size-4.5" aria-hidden="true" />}
          label={copy.stats.documents.label}
          value={copy.stats.documents.countLabel(uploadedCount, totalRequired)}
          sub={
            approvedCount === uploadedCount && uploadedCount > 0
              ? copy.stats.documents.allApprovedLabel
              : `${approvedCount} approved`
          }
          accent={uploadedCount > 0}
        />
        <StatCard
          icon={<Banknote className="size-4.5" aria-hidden="true" />}
          label={copy.stats.bankAccount.label}
          value={bankConnected ? copy.stats.bankAccount.linkedLabel : copy.stats.bankAccount.notLinkedLabel}
          sub={bankName ?? (bankConnected ? '' : 'Required for disbursements')}
          accent={bankConnected}
        />
        </Grid>

        <Card className="border-border bg-card dark:border-border dark:bg-card mt-6">
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <GraduationCap className="size-4.5" aria-hidden="true" />
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
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Selected
            </span>
          ) : (
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link href={copy.school.ctaHref} className="inline-flex items-center gap-1.5">
                {copy.school.ctaLabel}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

        {prioritySteps.length > 0 ? (
        <Stack gap="md" className="mt-6">
          <h2 className="text-sm font-semibold text-foreground">{copy.nextSteps.heading}</h2>
          <Grid cols={{ sm: 2 }} gap="md">
            {prioritySteps.map((key, i) => (
              <NextStepCard key={key} step={copy.nextSteps.items[key]} index={i} />
            ))}
          </Grid>
        </Stack>
      ) : (
        <Card className="border-border bg-card dark:border-border dark:bg-card mt-6">
          <CardContent className="flex items-center gap-3 pt-5">
            <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              All steps complete. Your profile is ready for sponsor review.
            </p>
          </CardContent>
        </Card>
      )}
      </Section>
    </PageShell>
  );
}
