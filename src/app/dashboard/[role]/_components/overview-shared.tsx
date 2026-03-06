import { Warning, ArrowRight, UserFocus } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import {
  Container,
  PageShell,
  Section,
} from '@/components/layout/content-primitives';
import { dashboardOverviewCopy, dashboardShellCopy } from '@/config/copy/dashboard-shell';
import type { DashboardRole } from '@/config/roles';
import { cn } from '@/lib/utils';

export type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
};

export function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-lg',
              accent ? 'bg-primary/15 text-primary dark:bg-primary/20' : 'bg-muted text-muted-foreground',
            )}
          >
            {icon}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export type NextStepItemConfig = {
  label: string;
  description: string;
  cta: string;
  href: string;
};

export function NextStepCard({ step, index }: { step: NextStepItemConfig; index: number }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {index + 1}
          </span>
          <p className="text-sm font-semibold text-foreground">{step.label}</p>
        </div>
        <p className="text-sm text-muted-foreground">{step.description}</p>
        <Button asChild size="sm" variant="default" className="mt-auto w-full sm:w-auto">
          <Link href={step.href} className="inline-flex items-center gap-1.5">
            {step.cta}
            <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ role }: { role: DashboardRole }) {
  const roleCopy = dashboardOverviewCopy[role];

  return (
    <PageShell width="wide">
      <Section>
        <Container>
          <Card className="border-border bg-card">
            <CardHeader className="space-y-3">
              <UserFocus className="size-5 text-muted-foreground" weight="duotone" />
          <h1 className="leading-none font-semibold text-xl text-card-foreground md:text-2xl">
            {dashboardShellCopy.overview.emptyTitle}
          </h1>
          <CardDescription className="text-sm text-muted-foreground md:text-base">
            {dashboardShellCopy.overview.emptyDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={roleCopy.ctaHref}>{roleCopy.ctaLabel}</Link>
          </Button>
          </CardContent>
          </Card>
        </Container>
      </Section>
    </PageShell>
  );
}

export function ErrorState({ role }: { role: DashboardRole }) {
  const roleCopy = dashboardOverviewCopy[role];

  return (
    <PageShell width="wide">
      <Section>
        <Container>
          <Card className="border-border bg-card">
            <CardHeader className="space-y-3">
              <Warning className="size-5 text-muted-foreground" weight="duotone" />
          <h1 className="leading-none font-semibold text-xl text-card-foreground md:text-2xl">
            {dashboardShellCopy.overview.errorTitle}
          </h1>
          <CardDescription className="text-sm text-muted-foreground md:text-base">
            {dashboardShellCopy.overview.errorDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={roleCopy.ctaHref}>{roleCopy.ctaLabel}</Link>
          </Button>
          </CardContent>
          </Card>
        </Container>
      </Section>
    </PageShell>
  );
}
