import React from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Warning, UserFocus } from '@/components/icons';
import { SparklineChart } from '@/components/ui/sparkline';
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

export type StatCardTrend = {
  direction: 'up' | 'down' | 'neutral';
  value: string;
  label?: string;
};

export type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  href?: string;
  valueClassName?: string;
  trend?: StatCardTrend;
  sparklineData?: number[];
  children?: React.ReactNode;
};

export function StatCard({
  label, value, sub, accent, href, valueClassName, trend, sparklineData, children,
}: StatCardProps) {
  const TrendIcon = trend?.direction === 'up' ? ArrowUp : ArrowDown;
  const trendColor =
    trend?.direction === 'up'
      ? 'text-success'
      : trend?.direction === 'down'
        ? 'text-destructive'
        : 'text-muted-foreground';
  const sparklineColor =
    trend?.direction === 'up'
      ? 'var(--color-success)'
      : trend?.direction === 'down'
        ? 'var(--color-destructive)'
        : 'var(--color-muted-foreground)';

  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card px-5 py-4 shadow-xs transition-shadow',
        href && 'hover:shadow-md hover:border-primary/20',
        accent && 'border-t-2 border-t-primary',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('font-mono text-2xl font-bold tracking-tight text-foreground', valueClassName)}>
            {value}
          </p>
          {trend != null && (
            <div className={cn('mt-1 flex items-center gap-1 text-xs font-medium', trendColor)}>
              <TrendIcon className="size-3.5" weight="duotone" aria-hidden="true" />
              <span>{trend.value}</span>
              <span className="font-normal text-muted-foreground">
                {trend.label ?? 'vs last month'}
              </span>
            </div>
          )}
          {sub != null && trend == null && (
            <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
          )}
        </div>

        {sparklineData != null && sparklineData.length > 1 && (
          <div className="w-20 shrink-0">
            <SparklineChart data={sparklineData} color={sparklineColor} height={36} />
          </div>
        )}
      </div>

      {children != null && (
        <div className="mt-3">{children}</div>
      )}

      {href && (
        <span className="absolute right-4 top-4 text-primary/70">
          <span className="sr-only">View</span>
          <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export type NextStepItemConfig = {
  label: string;
  description: string;
  cta: string;
  href: string;
};

export function NextStepCard({ step, index }: { step: NextStepItemConfig; index: number }) {
  return (
    <div className="rounded-xl border-l-4 border-l-primary bg-primary/[0.04] px-5 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">
            Step {index + 1}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{step.label}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
        </div>
        <Button asChild size="sm" variant="default" className="mt-3 shrink-0 sm:mt-0">
          <Link href={step.href}>
            {step.cta}
          </Link>
        </Button>
      </div>
    </div>
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
