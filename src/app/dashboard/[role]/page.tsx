import { TRPCError } from '@trpc/server';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  FileStack,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  dashboardOverviewCopy,
  dashboardShellCopy,
  studentHomeCopy,
} from '@/config/copy/dashboard-shell';
import { agentCopy } from '@/config/copy/agent';
import { partnerCopy } from '@/config/copy/partner';
import { sponsorCopy } from '@/config/copy/sponsor';
import type { DashboardRole } from '@/config/roles';
import { isDashboardRole } from '@/config/roles';
import { studentDocumentTypeValues } from '@/lib/documents';
import { cn, formatNGN } from '@/lib/utils';
import { api } from '@/trpc/server';

type DashboardRolePageProps = {
  params: Promise<{ role: string }>;
};

function getFirstName(email: string): string {
  const raw = email.split('@')[0] ?? '';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function EmptyState({ role }: { role: DashboardRole }) {
  const roleCopy = dashboardOverviewCopy[role];

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader className="space-y-3">
          <UserRoundSearch className="size-5 text-muted-foreground dark:text-muted-foreground" />
          <h1 className="leading-none font-semibold text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
            {dashboardShellCopy.overview.emptyTitle}
          </h1>
          <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
            {dashboardShellCopy.overview.emptyDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={roleCopy.ctaHref}>{roleCopy.ctaLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function ErrorState({ role }: { role: DashboardRole }) {
  const roleCopy = dashboardOverviewCopy[role];

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader className="space-y-3">
          <AlertTriangle className="size-5 text-muted-foreground dark:text-muted-foreground" />
          <h1 className="leading-none font-semibold text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
            {dashboardShellCopy.overview.errorTitle}
          </h1>
          <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
            {dashboardShellCopy.overview.errorDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={roleCopy.ctaHref}>{roleCopy.ctaLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
};

function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              accent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}
          >
            {icon}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type NextStepItemConfig = {
  label: string;
  description: string;
  cta: string;
  href: string;
};

function NextStepCard({ step, index }: { step: NextStepItemConfig; index: number }) {
  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {index + 1}
          </span>
          <p className="text-sm font-semibold text-foreground">{step.label}</p>
        </div>
        <p className="text-sm text-muted-foreground">{step.description}</p>
        <Button asChild size="sm" variant="outline" className="mt-auto w-full sm:w-auto">
          <Link href={step.href} className="inline-flex items-center gap-1.5">
            {step.cta}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

async function StudentOverview({
  email,
  caller,
}: {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
}) {
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

  // Build ordered next steps
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
    <section className="mx-auto w-full max-w-5xl space-y-6">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.journeySubtitle}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
      </div>

      {/* School selection */}
      <Card className="border-border bg-card dark:border-border dark:bg-card">
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

      {/* Next steps */}
      {prioritySteps.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">{copy.nextSteps.heading}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {prioritySteps.map((key, i) => (
              <NextStepCard key={key} step={copy.nextSteps.items[key]} index={i} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-border bg-card dark:border-border dark:bg-card">
          <CardContent className="flex items-center gap-3 pt-5">
            <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              All steps complete. Your profile is ready for sponsor review.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

async function SponsorOverview({
  email,
  caller,
}: {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
}) {
  const firstName = getFirstName(email);
  const [overviewResult, studentsResult] = await Promise.allSettled([
    caller.sponsor.getSponsorOverview(),
    caller.sponsor.listSponsoredStudents(),
  ]);

  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
  const recentStudents = students.slice(0, 3);
  const copy = sponsorCopy.dashboard.overview;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Banknote className="size-4.5" aria-hidden="true" />}
          label={copy.stats.totalCommitted.label}
          value={overview ? formatNGN(overview.totalCommittedKobo) : '—'}
          sub={copy.stats.totalCommitted.sub}
          accent={Boolean(overview?.totalCommittedKobo)}
        />
        <StatCard
          icon={<GraduationCap className="size-4.5" aria-hidden="true" />}
          label={copy.stats.activeStudents.label}
          value={overview ? String(overview.activeStudents) : '—'}
          sub={copy.stats.activeStudents.sub}
          accent={Boolean(overview?.activeStudents)}
        />
        <StatCard
          icon={<UserRoundSearch className="size-4.5" aria-hidden="true" />}
          label={copy.stats.pendingInvites.label}
          value={overview ? String(overview.pendingInvites) : '—'}
          sub={copy.stats.pendingInvites.sub}
          accent={Boolean(overview?.pendingInvites)}
        />
        <StatCard
          icon={<ShieldCheck className="size-4.5" aria-hidden="true" />}
          label={copy.stats.nextDisbursement.label}
          value={
            overview?.nextDisbursementAt
              ? new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(
                  overview.nextDisbursementAt,
                )
              : copy.stats.nextDisbursement.noneValue
          }
          sub={
            overview?.nextDisbursementAt
              ? copy.stats.nextDisbursement.scheduledSub
              : copy.stats.nextDisbursement.noneSub
          }
        />
      </div>

      {recentStudents.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">{copy.recentStudents.heading}</h2>
          <div className="space-y-2">
            {recentStudents.map((s) => (
              <Card key={s.id} className="border-border bg-card">
                <CardContent className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {s.studentEmail ?? copy.recentStudents.unknownStudentLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNGN(s.amountKobo)} · {s.status}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      s.status === 'active'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {s.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">{copy.recentStudents.empty}</p>
          </CardContent>
        </Card>
      )}

      <Button asChild className="min-h-11 w-full sm:w-auto">
        <Link href="/dashboard/sponsor/students">{copy.cta}</Link>
      </Button>
    </section>
  );
}

async function AgentOverview({
  email,
  caller,
}: {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
}) {
  const firstName = getFirstName(email);
  const [overviewResult] = await Promise.allSettled([caller.agent.getAgentOverview()]);
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const copy = agentCopy.dashboard.overview;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<GraduationCap className="size-4.5" aria-hidden="true" />}
          label={copy.stats.assignedStudents.label}
          value={overview ? String(overview.totalAssignedStudents) : '—'}
          sub={copy.stats.assignedStudents.sub}
          accent={Boolean(overview?.totalAssignedStudents)}
        />
        <StatCard
          icon={<ShieldCheck className="size-4.5" aria-hidden="true" />}
          label={copy.stats.activeStudents.label}
          value={overview ? String(overview.activeStudents) : '—'}
          sub={copy.stats.activeStudents.sub}
          accent={Boolean(overview?.activeStudents)}
        />
        <StatCard
          icon={<Banknote className="size-4.5" aria-hidden="true" />}
          label={copy.stats.pendingCommissions.label}
          value={overview ? formatNGN(overview.pendingCommissionsKobo) : '—'}
          sub={copy.stats.pendingCommissions.sub}
          accent={Boolean(overview?.pendingCommissionsKobo)}
        />
        <StatCard
          icon={<Sparkles className="size-4.5" aria-hidden="true" />}
          label={copy.stats.totalEarned.label}
          value={overview ? formatNGN(overview.totalEarnedKobo) : '—'}
          sub={copy.stats.totalEarned.sub}
          accent={Boolean(overview?.totalEarnedKobo)}
        />
      </div>

      <Card className="border-border bg-card">
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">
            {overview?.totalAssignedStudents
              ? overview.totalAssignedStudents === 1
                ? copy.caseload.filledSingle(overview.totalAssignedStudents)
                : copy.caseload.filledPlural(overview.totalAssignedStudents)
              : copy.caseload.empty}
          </p>
        </CardContent>
      </Card>

      <Button asChild className="min-h-11 w-full sm:w-auto">
        <Link href="/dashboard/agent/students">{copy.cta}</Link>
      </Button>
    </section>
  );
}

async function PartnerOverview({
  email,
  caller,
}: {
  email: string;
  caller: Awaited<ReturnType<typeof api>>;
}) {
  const firstName = getFirstName(email);
  const [overviewResult] = await Promise.allSettled([caller.partner.getPartnerOverview()]);
  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  const copy = partnerCopy.dashboard.overview;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {copy.subtitle(overview?.organizationName ?? null)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<GraduationCap className="size-4.5" aria-hidden="true" />}
          label={copy.stats.totalStudents.label}
          value={overview ? String(overview.totalStudents) : '—'}
          sub={copy.stats.totalStudents.sub}
          accent={Boolean(overview?.totalStudents)}
        />
        <StatCard
          icon={<ShieldCheck className="size-4.5" aria-hidden="true" />}
          label={copy.stats.verifiedStudents.label}
          value={overview ? String(overview.verifiedStudents) : '—'}
          sub={copy.stats.verifiedStudents.sub}
          accent={Boolean(overview?.verifiedStudents)}
        />
        <StatCard
          icon={<FileStack className="size-4.5" aria-hidden="true" />}
          label={copy.stats.activeApiKeys.label}
          value={overview ? String(overview.activeApiKeys) : '—'}
          sub={copy.stats.activeApiKeys.sub}
          accent={Boolean(overview?.activeApiKeys)}
        />
      </div>

      <Card className="border-border bg-card">
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">
            {overview?.totalStudents
              ? copy.summary.withStudents(overview.verifiedStudents, overview.totalStudents)
              : copy.summary.empty}
          </p>
        </CardContent>
      </Card>

      <Button asChild className="min-h-11 w-full sm:w-auto">
        <Link href="/dashboard/partner/students">{copy.cta}</Link>
      </Button>
    </section>
  );
}

export default async function DashboardRolePage({ params }: DashboardRolePageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  const caller = await api();
  let sessionData: Awaited<ReturnType<typeof caller.dashboard.getSession>>;

  try {
    sessionData = await caller.dashboard.getSession({ role });
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    return <ErrorState role={role} />;
  }

  if (
    role === 'student' &&
    sessionData.profileRole === 'student' &&
    !sessionData.onboardingComplete
  ) {
    redirect('/dashboard/student/onboarding');
  }

  if (!sessionData.profileRole) {
    return <EmptyState role={role} />;
  }

  if (role === 'student' && sessionData.profileRole === 'student') {
    return <StudentOverview email={sessionData.email ?? ''} caller={caller} />;
  }

  // Admin → redirect to operations page
  if (role === 'admin' && sessionData.profileRole === 'admin') {
    redirect('/dashboard/admin/operations');
  }

  if (role === 'sponsor' && sessionData.profileRole === 'sponsor') {
    return <SponsorOverview email={sessionData.email ?? ''} caller={caller} />;
  }

  if (role === 'agent' && sessionData.profileRole === 'agent') {
    return <AgentOverview email={sessionData.email ?? ''} caller={caller} />;
  }

  if (role === 'partner' && sessionData.profileRole === 'partner') {
    return <PartnerOverview email={sessionData.email ?? ''} caller={caller} />;
  }

  const roleCopy = dashboardOverviewCopy[role];

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader className="space-y-3">
          <Sparkles className="size-5 text-muted-foreground dark:text-muted-foreground" />
          <h1 className="leading-none font-semibold text-xl text-card-foreground dark:text-card-foreground md:text-3xl">
            {roleCopy.title}
          </h1>
          <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
            {roleCopy.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            {`${dashboardShellCopy.overview.signedInLabel}: ${sessionData.email ?? dashboardShellCopy.overview.noEmailFallback}`}
          </p>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={roleCopy.ctaHref}>{roleCopy.ctaLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
