import { TRPCError } from '@trpc/server';
import { Sparkle } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { PageShell } from '@/components/layout/content-primitives';
import { dashboardOverviewCopy, dashboardShellCopy } from '@/config/copy/dashboard-shell';
import { isDashboardRole } from '@/config/roles';
import { api } from '@/trpc/server';

import { AdminOverview } from './_components/admin-overview';
import { AgentOverview } from './_components/agent-overview';
import { EmptyState, ErrorState } from './_components/overview-shared';
import { PartnerOverview } from './_components/partner-overview';
import { SponsorOverview } from './_components/sponsor-overview';
import { StudentOverview } from './_components/student-overview';
import { UniversityOverview } from './_components/university-overview';

type DashboardRolePageProps = {
  params: Promise<{ role: string }>;
};

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
    if (error instanceof TRPCError) {
      if (error.code === 'UNAUTHORIZED') {
        redirect('/login');
      }
      if (error.code === 'FORBIDDEN') {
        redirect('/login');
      }
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

  if (role === 'admin' && sessionData.profileRole === 'admin') {
    return <AdminOverview caller={caller} />;
  }

  if (role === 'university' && sessionData.profileRole === 'university') {
    return <UniversityOverview caller={caller} />;
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
    <PageShell width="wide">
      <Card className="border-border bg-card">
        <CardHeader className="space-y-3">
          <Sparkle className="size-5 text-muted-foreground" weight="duotone" />
          <h1 className="leading-none font-semibold text-xl text-card-foreground md:text-3xl">
            {roleCopy.title}
          </h1>
          <CardDescription className="text-sm text-muted-foreground md:text-base">
            {roleCopy.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {`${dashboardShellCopy.overview.signedInLabel}: ${sessionData.email ?? dashboardShellCopy.overview.noEmailFallback}`}
          </p>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={roleCopy.ctaHref}>{roleCopy.ctaLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}
