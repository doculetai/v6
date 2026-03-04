'use client';

import { AlertTriangle, Clock3, Loader2, MapPin, MonitorSmartphone, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

import { SponsorBankVerification } from '@/components/sponsor/SponsorBankVerification';
import { SponsorIdentityVerification } from '@/components/sponsor/SponsorIdentityVerification';
import { SponsorKycTierProgress } from '@/components/sponsor/SponsorKycTierProgress';
import { SponsorSourceOfFunds } from '@/components/sponsor/SponsorSourceOfFunds';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';
import { browserTrpcClient } from '@/trpc/client';

import type { SponsorKycStatusSnapshot } from '@/db/queries/sponsor-kyc';

type KycPageClientProps = {
  initialStatus: SponsorKycStatusSnapshot;
};

const kycStatusLabelByKey = {
  draft: sponsorCopy.kyc.status.draft,
  submitted: sponsorCopy.kyc.status.submitted,
  under_review: sponsorCopy.kyc.status.underReview,
  approved: sponsorCopy.kyc.status.approved,
  certificate_issued: sponsorCopy.kyc.status.certificateIssued,
  rejected: sponsorCopy.kyc.status.rejected,
  action_required: sponsorCopy.kyc.status.actionRequired,
  expired: sponsorCopy.kyc.status.expired,
} as const;

function statusBadgeClass(status: SponsorKycStatusSnapshot['kycStatus']): string {
  if (status === 'certificate_issued' || status === 'approved') {
    return 'border-success/30 bg-success/10 text-success dark:border-success/40 dark:bg-success/15 dark:text-success';
  }

  if (status === 'under_review' || status === 'submitted') {
    return 'border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15 dark:text-primary';
  }

  if (status === 'action_required' || status === 'rejected') {
    return 'border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/15 dark:text-destructive';
  }

  return 'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground';
}

function normalizeError(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return sponsorCopy.kyc.error.description;
}

export default function KycPageClient({ initialStatus }: KycPageClientProps) {
  const [snapshot, setSnapshot] = useState(initialStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshKycStatus = async () => {
    setErrorMessage(null);
    setIsRefreshing(true);

    try {
      const next = await browserTrpcClient.sponsor.getKycStatus.query();
      setSnapshot(next);
    } catch (error) {
      setErrorMessage(normalizeError(error));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmitIdentity = async (values: {
    identityMethod: 'nin' | 'passport';
    nin?: string;
    passportNumber?: string;
  }) => {
    setErrorMessage(null);

    try {
      const next = await browserTrpcClient.sponsor.submitIdentity.mutate(values);
      setSnapshot(next);
    } catch (error) {
      setErrorMessage(normalizeError(error));
      throw error;
    }
  };

  const handleSubmitSourceOfFunds = async (values: {
    sponsorType: 'individual' | 'corporate' | 'self';
    sourceOfFundsType: 'salary' | 'business' | 'savings' | 'investment';
    sourceOfFundsAmountNaira: number;
    cacRegistrationNumber?: string;
    directorBvn?: string;
    sponsorshipLetterFileName?: string;
  }) => {
    setErrorMessage(null);

    try {
      const next = await browserTrpcClient.sponsor.submitSourceOfFunds.mutate(values);
      setSnapshot(next);
    } catch (error) {
      setErrorMessage(normalizeError(error));
      throw error;
    }
  };

  const handleSubmitBankStatement = async (values: { fileName: string }) => {
    setErrorMessage(null);

    try {
      const next = await browserTrpcClient.sponsor.submitBankStatement.mutate(values);
      setSnapshot(next);
    } catch (error) {
      setErrorMessage(normalizeError(error));
      throw error;
    }
  };

  const handleConnectMono = async (values: {
    monoAccountId: string;
    bankName: string;
    accountNumber: string;
  }) => {
    setErrorMessage(null);

    try {
      const result = await browserTrpcClient.sponsor.connectMono.mutate(values);
      setSnapshot(result.snapshot);
      return {
        status: result.status,
        fallbackToPdf: result.fallbackToPdf,
      };
    } catch (error) {
      setErrorMessage(normalizeError(error));
      return {
        status: 'failed' as const,
        fallbackToPdf: true,
      };
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card/90 p-5 shadow-lg backdrop-blur-sm dark:border-border dark:bg-card/80 md:p-7">
        <div
          className={cn(
            'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_45%)]',
            'dark:bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.2),transparent_45%)]',
          )}
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground dark:text-foreground md:text-4xl">
              {sponsorCopy.kyc.page.heading}
            </h1>
            <Badge variant="outline" className={statusBadgeClass(snapshot.kycStatus)}>
              {kycStatusLabelByKey[snapshot.kycStatus]}
            </Badge>
          </div>

          <p className="max-w-3xl text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
            {sponsorCopy.kyc.page.body}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground md:text-sm">
            <span className="rounded-md border border-border bg-background px-2 py-1 dark:border-border dark:bg-background">
              {sponsorCopy.kyc.page.timezoneLabel}: {sponsorCopy.kyc.page.timezoneValue}
            </span>
            <span className="rounded-md border border-border bg-background px-2 py-1 dark:border-border dark:bg-background">
              {snapshot.securitySignals.lastUpdatedAtWAT}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-11"
              onClick={refreshKycStatus}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {sponsorCopy.kyc.page.refreshedLabel}
                </span>
              ) : (
                sponsorCopy.kyc.page.refreshLabel
              )}
            </Button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15 dark:text-destructive">
          <p className="font-medium">{sponsorCopy.kyc.error.title}</p>
          <p className="mt-1">{errorMessage}</p>
        </div>
      ) : null}

      <SponsorKycTierProgress snapshot={snapshot} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SponsorIdentityVerification snapshot={snapshot} onSubmitIdentity={handleSubmitIdentity} />
        <SponsorSourceOfFunds
          snapshot={snapshot}
          onSubmitSourceOfFunds={handleSubmitSourceOfFunds}
        />
      </div>

      <SponsorBankVerification
        snapshot={snapshot}
        onSubmitBankStatement={handleSubmitBankStatement}
        onConnectMono={handleConnectMono}
      />

      <Card className="border-border/70 bg-card/85 text-card-foreground shadow-md backdrop-blur-sm dark:border-border dark:bg-card/80">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg text-card-foreground dark:text-card-foreground">
            {sponsorCopy.kyc.security.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
            {sponsorCopy.kyc.security.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-background/80 p-3 dark:border-border dark:bg-background/70">
            <p className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {sponsorCopy.kyc.security.lastLoginLocationLabel}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground dark:text-foreground">
              {snapshot.securitySignals.lastLoginLocation ?? sponsorCopy.kyc.security.unavailableValue}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background/80 p-3 dark:border-border dark:bg-background/70">
            <p className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
              <MonitorSmartphone className="size-4" aria-hidden="true" />
              {sponsorCopy.kyc.security.lastLoginDeviceLabel}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground dark:text-foreground">
              {snapshot.securitySignals.lastLoginDevice ?? sponsorCopy.kyc.security.unavailableValue}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background/80 p-3 dark:border-border dark:bg-background/70">
            <p className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
              <Clock3 className="size-4" aria-hidden="true" />
              {sponsorCopy.kyc.security.activeSessionsLabel}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground dark:text-foreground">
              {snapshot.securitySignals.activeSessionCount}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background/80 p-3 dark:border-border dark:bg-background/70">
            <p className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
              <ShieldAlert className="size-4" aria-hidden="true" />
              {sponsorCopy.kyc.security.suspiciousAlertsLabel}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground dark:text-foreground">
              {snapshot.securitySignals.suspiciousLoginAlerts}
            </p>
          </div>
        </CardContent>
      </Card>

      {snapshot.kycStatus === 'action_required' ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 dark:border-destructive/40 dark:bg-destructive/15">
          <p className="flex items-center gap-2 text-sm font-medium text-destructive dark:text-destructive">
            <AlertTriangle className="size-4" aria-hidden="true" />
            {sponsorCopy.kyc.status.actionRequired}
          </p>
        </div>
      ) : null}
    </div>
  );
}
