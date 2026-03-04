import { TRPCError } from '@trpc/server';
import { AlertTriangle, Sparkles, UserRoundSearch } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardOverviewCopy, dashboardShellCopy } from '@/config/copy/dashboard-shell';
import type { DashboardRole } from '@/config/roles';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

type DashboardRolePageProps = {
  params: Promise<{ role: string }>;
};

function EmptyState({ role }: { role: DashboardRole }) {
  const roleCopy = dashboardOverviewCopy[role];

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Card className="border-border bg-card dark:border-border dark:bg-card">
        <CardHeader className="space-y-3">
          <UserRoundSearch className="size-5 text-muted-foreground dark:text-muted-foreground" />
          <CardTitle className="text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
            {dashboardShellCopy.overview.emptyTitle}
          </CardTitle>
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
          <CardTitle className="text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
            {dashboardShellCopy.overview.errorTitle}
          </CardTitle>
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

  const roleCopy = dashboardOverviewCopy[role];

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
}
