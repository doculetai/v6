'use client';

import { CheckCircle2, Clock, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type KycStatus = {
  sponsorType: 'individual' | 'corporate' | 'self' | null;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  companyName: string | null;
};

type Copy = typeof sponsorCopy.kyc;

type KycPageClientProps = {
  kycStatus: KycStatus;
  copy: Copy;
};

// ── Overall status banner ─────────────────────────────────────────────────────

function OverallStatusBanner({
  status,
  copy,
}: {
  status: KycStatus['kycStatus'];
  copy: Copy;
}) {
  const label = {
    not_started: copy.status.notStarted,
    pending: copy.status.inProgress,
    verified: copy.status.verified,
    failed: copy.status.failed,
  }[status];

  const badgeClass = {
    not_started: 'bg-muted text-muted-foreground border-0',
    pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-0',
    verified: 'bg-green-500/10 text-green-700 dark:text-green-400 border-0',
    failed: 'bg-destructive/10 text-destructive border-0',
  }[status];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium text-foreground">KYC status:</span>
      <Badge className={badgeClass}>{label}</Badge>
    </div>
  );
}

// ── Tier card ─────────────────────────────────────────────────────────────────

type TierCardProps = {
  tierIndex: number;
  tier: { label: string; description: string };
  kycStatus: KycStatus['kycStatus'];
  startCta: string;
  retryLabel: string;
};

function TierCard({ tierIndex, tier, kycStatus, startCta, retryLabel }: TierCardProps) {
  // Tier 1 (index 0) is always verified — auto-verified via email auth
  if (tierIndex === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-start gap-3 pb-2">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Tier 1 — {tier.label}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {tier.description}
            </CardDescription>
          </div>
          <Badge className="ml-auto shrink-0 bg-green-500/10 text-green-700 dark:text-green-400 border-0">
            Verified
          </Badge>
        </CardHeader>
      </Card>
    );
  }

  // Tier 2 (index 1) — Standard
  if (tierIndex === 1) {
    const isVerified = kycStatus === 'verified';
    const isFailed = kycStatus === 'failed';
    const isPending = kycStatus === 'pending';

    const statusBadge = isVerified ? (
      <Badge className="ml-auto shrink-0 bg-green-500/10 text-green-700 dark:text-green-400 border-0">
        Verified
      </Badge>
    ) : isPending ? (
      <Badge className="ml-auto shrink-0 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-0">
        In progress
      </Badge>
    ) : isFailed ? (
      <Badge className="ml-auto shrink-0 bg-destructive/10 text-destructive border-0">
        Failed
      </Badge>
    ) : null;

    return (
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-start gap-3 pb-2">
          {isVerified ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
          ) : isFailed ? (
            <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          ) : (
            <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Tier 2 — {tier.label}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {tier.description}
            </CardDescription>
          </div>
          {statusBadge}
        </CardHeader>
        {!isVerified ? (
          <CardContent className="pt-0">
            <Button
              size="sm"
              disabled
              title="Coming soon"
              className={cn('min-h-9', isFailed && 'mt-1')}
            >
              {isFailed ? retryLabel : startCta}
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        ) : null}
      </Card>
    );
  }

  // Tier 3 (index 2) — Enhanced
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Tier 3 — {tier.label}
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-muted-foreground">
            {tier.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button size="sm" disabled title="Coming soon" className="min-h-9">
          {startCta}
        </Button>
        <p className="mt-1.5 text-xs text-muted-foreground">Coming soon</p>
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function KycPageClient({ kycStatus, copy }: KycPageClientProps) {
  return (
    <div className="space-y-4">
      <OverallStatusBanner status={kycStatus.kycStatus} copy={copy} />

      <div className="space-y-3">
        {copy.tiers.map((tier, index) => (
          <TierCard
            key={index}
            tierIndex={index}
            tier={tier}
            kycStatus={kycStatus.kycStatus}
            startCta={copy.startCta}
            retryLabel={copy.retryLabel}
          />
        ))}
      </div>
    </div>
  );
}
