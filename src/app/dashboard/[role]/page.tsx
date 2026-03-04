import { TRPCError } from '@trpc/server';
import { AlertTriangle, Sparkles, UserRoundSearch } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { SponsorOverviewStats } from '@/components/sponsor/SponsorOverviewStats';
import { SponsorRecentActivity } from '@/components/sponsor/SponsorRecentActivity';
import { SponsorStudentPreview } from '@/components/sponsor/SponsorStudentPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardOverviewCopy, dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { sponsorCopy } from '@/config/copy/sponsor';
import type { DashboardRole } from '@/config/roles';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

type DashboardRolePageProps = {
  params: Promise<{ role: string }>;
};

type StateCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  role: DashboardRole;
};

function StateCard({ icon: Icon, title, description, role }: StateCardProps) {
  const { ctaHref, ctaLabel } = dashboardOverviewCopy[role];

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader className="space-y-3">
          <Icon className="size-5 text-muted-foreground dark:text-muted-foreground" />
          <CardTitle className="text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export default async function DashboardRolePage({ params }: DashboardRolePageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  try {
    const caller = await api();
    const sessionData = await caller.dashboard.getSession({ role });
    const roleCopy = dashboardOverviewCopy[role];

    if (!sessionData.profileRole) {
      return (
        <StateCard
          icon={UserRoundSearch}
          title={dashboardShellCopy.overview.emptyTitle}
          description={dashboardShellCopy.overview.emptyDescription}
          role={role}
        />
      );
    }

    if (role === 'sponsor') {
      const [stats, recentActivity, linkedStudents] = await Promise.all([
        caller.sponsor.getDashboardStats(),
        caller.sponsor.getRecentActivity(),
        caller.sponsor.getLinkedStudents(),
      ]);

      const focusStudent = linkedStudents[0];
      const overviewCopy = sponsorCopy.overview;
      const subheading = overviewCopy.subheadingTemplate
        .replace('[student name]', focusStudent?.name ?? overviewCopy.fallbackStudentName)
        .replace(
          '[university]',
          focusStudent?.universityName ?? overviewCopy.fallbackUniversityName,
        );

      return (
        <section className="mx-auto w-full max-w-6xl space-y-6">
          <Card className="border-border bg-card dark:border-border dark:bg-card">
            <CardHeader className="space-y-3">
              <Sparkles className="size-5 text-muted-foreground dark:text-muted-foreground" />
              <CardTitle className="text-2xl text-card-foreground dark:text-card-foreground md:text-4xl">
                {overviewCopy.heading}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
                {subheading}
              </CardDescription>
            </CardHeader>
          </Card>

          <SponsorOverviewStats stats={stats} />

          <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <SponsorRecentActivity items={recentActivity.slice(0, 5)} />
            <SponsorStudentPreview students={linkedStudents.slice(0, 2)} />
          </div>
        </section>
      );
    }

    return (
      <section className="mx-auto w-full max-w-5xl">
        <Card className="border-border bg-card dark:border-border dark:bg-card">
          <CardHeader className="space-y-3">
            <Sparkles className="size-5 text-muted-foreground dark:text-muted-foreground" />
            <CardTitle className="text-xl text-card-foreground dark:text-card-foreground md:text-3xl">
              {roleCopy.title}
            </CardTitle>
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
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }

    return (
      <StateCard
        icon={AlertTriangle}
        title={dashboardShellCopy.overview.errorTitle}
        description={dashboardShellCopy.overview.errorDescription}
        role={role}
      />
    );
  }
}
