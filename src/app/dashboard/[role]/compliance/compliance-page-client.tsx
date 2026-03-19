'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  Key,
  ArrowsClockwise,
  IdentificationCard,
  CheckCircle,
  Clock,
  WarningCircle,
  ArrowRight,
} from '@/components/icons';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Grid,
  PageHeader,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import type { partnerCopy } from '@/config/copy/partner';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type PartnerOverview = {
  totalStudents: number;
  verifiedStudents: number;
  activeApiKeys: number;
  organizationName: string;
  apiCallsToday: number;
  apiDailyLimit: number;
};

type PartnerSettings = {
  organizationName: string;
  webhookUrl: string | null;
  webhookSigningSecretConfigured: boolean;
  brandColor: string | null;
  brandLogoUrl: string | null;
};

type Copy = typeof partnerCopy.compliance;

type CompliancePageClientProps = {
  overview: PartnerOverview;
  settings: PartnerSettings;
  copy: Copy;
};

type ComplianceStatus = 'verified' | 'configured' | 'pending' | 'actionNeeded';

// ── Status indicator ──────────────────────────────────────────────────────────

function StatusIndicator({
  status,
  labels,
}: {
  status: ComplianceStatus;
  labels: Copy['statusLabels'];
}) {
  const label = labels[status];

  if (status === 'verified' || status === 'configured') {
    return (
      <Badge className="bg-success/10 text-success border-0 gap-1">
        <CheckCircle weight="duotone" className="size-3.5" aria-hidden="true" />
        {label}
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge className="bg-warning/10 text-warning border-0 gap-1">
        <Clock weight="duotone" className="size-3.5" aria-hidden="true" />
        {label}
      </Badge>
    );
  }
  return (
    <Badge className="bg-destructive/10 text-destructive border-0 gap-1">
      <WarningCircle weight="duotone" className="size-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}

// ── Compliance card ───────────────────────────────────────────────────────────

function ComplianceCard({
  icon,
  title,
  description,
  status,
  statusLabels,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: ComplianceStatus;
  statusLabels: Copy['statusLabels'];
  actionLabel?: string;
  actionHref?: string;
}) {
  const needsAction = status === 'actionNeeded' || status === 'pending';
  return (
    <Card className={cn('border-border bg-card', needsAction && 'border-warning/30')}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              {icon}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <StatusIndicator status={status} labels={statusLabels} />
        </div>
        {needsAction && actionLabel && actionHref ? (
          <div className="mt-4 flex justify-end">
            <Button asChild size="sm" variant="outline">
              <Link href={actionHref} className="inline-flex items-center gap-1.5">
                {actionLabel}
                <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ── Derive statuses ───────────────────────────────────────────────────────────

function deriveStatuses(
  overview: PartnerOverview,
  settings: PartnerSettings,
): {
  kyc: ComplianceStatus;
  apiKeys: ComplianceStatus;
  webhook: ComplianceStatus;
  documentation: ComplianceStatus;
} {
  // KYC: verified if org has students processed, otherwise pending
  const kyc: ComplianceStatus =
    overview.verifiedStudents > 0 ? 'verified' : 'pending';

  // API keys: configured if at least one active key
  const apiKeys: ComplianceStatus =
    overview.activeApiKeys > 0 ? 'configured' : 'actionNeeded';

  // Webhook: configured if URL is set and signing secret is configured
  const webhook: ComplianceStatus = settings.webhookUrl
    ? settings.webhookSigningSecretConfigured
      ? 'configured'
      : 'pending'
    : 'actionNeeded';

  // Documentation: verified if org name is set and not the default
  const documentation: ComplianceStatus =
    settings.organizationName && settings.organizationName !== 'Partner'
      ? 'verified'
      : 'actionNeeded';

  return { kyc, apiKeys, webhook, documentation };
}

// ── Main component ────────────────────────────────────────────────────────────

export function CompliancePageClient({
  overview,
  settings,
  copy,
}: CompliancePageClientProps) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const statuses = deriveStatuses(overview, settings);
  const statusValues = Object.values(statuses);
  const completeCount = statusValues.filter(
    (s) => s === 'verified' || s === 'configured',
  ).length;
  const total = statusValues.length;
  const allComplete = completeCount === total;
  const progressPercent = Math.round((completeCount / total) * 100);

  return (
    <PageShell width="wide">
      <Section>
        <PageHeader title={copy.title} description={copy.subtitle} breadcrumbs={breadcrumbs} />

        <Stack gap="md">
          <Card className="border-border bg-card">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.summary.label}
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {allComplete
                      ? copy.summary.allComplete
                      : copy.summary.complete(completeCount, total)}
                  </p>
                </div>
                <span className="text-2xl font-semibold tabular-nums text-foreground">
                  {progressPercent}%
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    allComplete ? 'bg-success' : 'bg-primary',
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Grid cols={{ sm: 1, md: 2 }} gap="md">
            <ComplianceCard
              icon={
                <IdentificationCard
                  weight="duotone"
                  className="size-5 text-foreground"
                  aria-hidden="true"
                />
              }
              title={copy.cards.kyc.title}
              description={copy.cards.kyc.description}
              status={statuses.kyc}
              statusLabels={copy.statusLabels}
              actionLabel={copy.actions.kyc.label}
              actionHref={copy.actions.kyc.href}
            />
            <ComplianceCard
              icon={
                <Key
                  weight="duotone"
                  className="size-5 text-foreground"
                  aria-hidden="true"
                />
              }
              title={copy.cards.apiKeys.title}
              description={copy.cards.apiKeys.description}
              status={statuses.apiKeys}
              statusLabels={copy.statusLabels}
              actionLabel={copy.actions.apiKeys.label}
              actionHref={copy.actions.apiKeys.href}
            />
            <ComplianceCard
              icon={
                <ArrowsClockwise
                  weight="duotone"
                  className="size-5 text-foreground"
                  aria-hidden="true"
                />
              }
              title={copy.cards.webhook.title}
              description={copy.cards.webhook.description}
              status={statuses.webhook}
              statusLabels={copy.statusLabels}
              actionLabel={copy.actions.webhook.label}
              actionHref={copy.actions.webhook.href}
            />
            <ComplianceCard
              icon={
                <ShieldCheck
                  weight="duotone"
                  className="size-5 text-foreground"
                  aria-hidden="true"
                />
              }
              title={copy.cards.documentation.title}
              description={copy.cards.documentation.description}
              status={statuses.documentation}
              statusLabels={copy.statusLabels}
              actionLabel={copy.actions.documentation.label}
              actionHref={copy.actions.documentation.href}
            />
          </Grid>
        </Stack>
      </Section>
    </PageShell>
  );
}
