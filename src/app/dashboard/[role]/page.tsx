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

type SessionResult =
  | { type: 'empty' }
  | { type: 'ok'; email: string | null }
  | { type: 'error' };

async function fetchSession(role: DashboardRole): Promise<SessionResult> {
  try {
    const caller = await api();
    const sessionData = await caller.dashboard.getSession({ role });
    if (!sessionData.profileRole) return { type: 'empty' };
    return { type: 'ok', email: sessionData.email };
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      redirect('/login');
    }
    return { type: 'error' };
  }
}

export default async function DashboardRolePage({ params }: DashboardRolePageProps) {
  const { role } = await params;

  if (!isDashboardRole(role)) {
    notFound();
  }

  const result = await fetchSession(role);
  const roleCopy = dashboardOverviewCopy[role];

  if (result.type === 'empty') {
    return (
      <StateCard
        icon={UserRoundSearch}
        title={dashboardShellCopy.overview.emptyTitle}
        description={dashboardShellCopy.overview.emptyDescription}
        role={role}
      />
    );
  }

  if (result.type === 'error') {
    return (
      <StateCard
        icon={AlertTriangle}
        title={dashboardShellCopy.overview.errorTitle}
        description={dashboardShellCopy.overview.errorDescription}
        role={role}
      />
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
            {`${dashboardShellCopy.overview.signedInLabel}: ${result.email ?? dashboardShellCopy.overview.noEmailFallback}`}
          </p>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={roleCopy.ctaHref}>{roleCopy.ctaLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
