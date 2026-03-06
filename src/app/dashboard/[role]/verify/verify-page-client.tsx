'use client';

import { Warning, CheckCircle, ShieldCheck, Wallet, FileText } from '@phosphor-icons/react';
import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrustSignal } from '@/components/ui/trust-signal';
import { uiPrimitives } from '@/config/copy/primitives';
import { Progress } from '@/components/ui/progress';
import { Grid, PageShell, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { ManualKycReviewCard } from '@/components/student/ManualKycReviewCard';
import { studentCopy } from '@/config/copy/student';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import type { RouterOutputs } from '@/trpc/client';
import { trpc } from '@/trpc/client';

import { StudentSponsorInviteCard } from '@/components/student/StudentSponsorInviteCard';
import { getBadgeVariant, formatDate } from './_utils';

type VerificationStatusOutput = RouterOutputs['student']['getVerificationStatus'];
type IdentityType = 'bvn' | 'nin' | 'passport';

type VerifyPageClientProps = {
  initialData: VerificationStatusOutput;
};

type FeedbackState =
  | {
      kind: 'success' | 'error';
      message: string;
    }
  | null;

export function VerifyPageClient({ initialData }: VerifyPageClientProps) {
  const breadcrumbs = useDashboardBreadcrumbs(studentCopy.verify.title);
  const copy = studentCopy.verify;
  const statusLabels = copy.status;

  const utils = trpc.useUtils();
  const statusQuery = trpc.student.getVerificationStatus.useQuery(undefined, {
    initialData,
    refetchOnWindowFocus: false,
  });

  const [tier, setTier] = useState<2 | 3>(2);
  const [identityType, setIdentityType] = useState<IdentityType>('bvn');
  const [identityNumber, setIdentityNumber] = useState('');

  const [monoAccountId, setMonoAccountId] = useState('');
  const [showMonoDevInput, setShowMonoDevInput] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const dojahMutation = trpc.student.startDojahIdentityCheck.useMutation({
    onSuccess: async () => {
      setFeedback({
        kind: 'success',
        message: copy.feedback.dojahStarted,
      });
      setIdentityNumber('');
      await utils.student.getVerificationStatus.invalidate();
    },
    onError: () => {
      setFeedback({
        kind: 'error',
        message: copy.feedback.dojahError,
      });
    },
  });

  const monoMutation = trpc.student.connectMonoBankAccount.useMutation({
    onSuccess: async () => {
      setFeedback({
        kind: 'success',
        message: copy.feedback.monoConnected,
      });
      setMonoAccountId('');
      await utils.student.getVerificationStatus.invalidate();
    },
    onError: () => {
      setFeedback({
        kind: 'error',
        message: copy.feedback.monoError,
      });
    },
  });

  const latestUpdatedAt = useMemo(() => {
    const tierDates = statusQuery.data.tiers.map((tierItem) => tierItem.updatedAt).filter(Boolean) as Date[];

    if (tierDates.length === 0) {
      return null;
    }

    return tierDates.sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
  }, [statusQuery.data.tiers]);

  const isBusy = statusQuery.isRefetching || dojahMutation.isPending || monoMutation.isPending;

  const handleDojahSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    dojahMutation.mutate({
      tier,
      identityType,
      identityNumber,
    });
  };

  const handleMonoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    monoMutation.mutate({
      monoAccountId,
    });
  };

  const hasLoadError = statusQuery.isError;

  return (
    <PageShell width="wide">
      <Stack gap="md">
      <PageHeader
        title={copy.title}
        description={copy.subtitle}
        breadcrumbs={breadcrumbs}
      />

      <Card className="border-border bg-card/95 dark:bg-card/90">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl text-card-foreground md:text-2xl">
              {copy.tracker.title}
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void statusQuery.refetch();
              }}
              disabled={isBusy}
            >
              {copy.actions.refresh}
            </Button>
          </div>
          <CardDescription>{copy.tracker.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{copy.tracker.completionLabel}</span>
              <span>{`${statusQuery.data.completionPercent}%`}</span>
            </div>
            <Progress value={statusQuery.data.completionPercent} className="h-2.5" />
          </div>

          <Grid cols={{ md: 3 }} gap="xs">
            {statusQuery.data.tiers.map((tierItem, index) => {
              const tierCopy = copy.kycSection.tiers[index];

              return (
                <article
                  key={tierItem.tier}
                  className="rounded-xl border border-border bg-background/80 p-4 dark:bg-background/60"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {`Tier ${tierItem.tier}`}
                      </p>
                      <h3 className="text-base font-semibold text-foreground">
                        {tierCopy?.label}
                      </h3>
                    </div>
                    <Badge variant={getBadgeVariant(tierItem.status)}>{statusLabels[tierItem.status]}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {tierCopy?.description}
                  </p>
                </article>
              );
            })}
          </Grid>

          <p className="text-xs text-muted-foreground">
            {`${copy.tracker.lastUpdatedLabel}: ${formatDate(latestUpdatedAt)}`}
          </p>
        </CardContent>
      </Card>

      {statusQuery.data.monoConnection.isConnected &&
      statusQuery.data.monoConnection.daysSinceLinked !== null &&
      statusQuery.data.monoConnection.daysSinceLinked > 75 ? (
        <Card className="border-warning bg-warning/10 dark:border-warning dark:bg-warning/10">
          <CardContent className="flex items-center gap-3 py-4">
            <Warning className="size-5 shrink-0 text-warning dark:text-warning" weight="duotone" aria-hidden="true" />
            <p className="text-sm font-medium text-warning dark:text-warning">
              {copy.bankExpiringBanner}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Grid cols={{ lg: 2 }} gap="md">
        {/* Identity verification — automated or manual */}
        {statusQuery.data.eligibleForManualReview ? (
          <ManualKycReviewCard
            failedAttempts={statusQuery.data.kycFailedAttempts}
            onSuccess={() => void utils.student.getVerificationStatus.invalidate()}
          />
        ) : (
          <Card className="border-border bg-card/95 dark:bg-card/90">
            <CardHeader className="space-y-3">
              <div className="inline-flex items-center gap-2 text-card-foreground">
                <ShieldCheck className="size-5" weight="duotone" aria-hidden="true" />
                <CardTitle className="text-lg md:text-xl">{copy.kycSection.dojahForm.title}</CardTitle>
              </div>
              <CardDescription>{copy.kycSection.dojahForm.description}</CardDescription>
              <TrustSignal message={uiPrimitives.trustSignals.kyc} />
            </CardHeader>
            <CardContent>
              {/* Show failure guidance if there are failed attempts */}
              {statusQuery.data.kycFailedAttempts > 0 ? (
                <div className="mb-4 rounded-lg border border-border bg-background/80 p-3 dark:bg-background/60">
                  <p className="text-sm text-muted-foreground">
                    {copy.kycFailure.firstAttempt}
                  </p>
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={handleDojahSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="verify-tier">{copy.kycSection.dojahForm.tierLabel}</Label>
                  <Select
                    value={String(tier)}
                    onValueChange={(v) => setTier(v === '3' ? 3 : 2)}
                  >
                    <SelectTrigger id="verify-tier" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">{copy.kycSection.dojahForm.tierOptions.tier2}</SelectItem>
                      <SelectItem value="3">{copy.kycSection.dojahForm.tierOptions.tier3}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identity-type">{copy.kycSection.dojahForm.identityTypeLabel}</Label>
                  <Select
                    value={identityType}
                    onValueChange={(v) => setIdentityType(v as IdentityType)}
                  >
                    <SelectTrigger id="identity-type" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bvn">{copy.kycSection.identityTypes.bvn}</SelectItem>
                      <SelectItem value="nin">{copy.kycSection.identityTypes.nin}</SelectItem>
                      <SelectItem value="passport">{copy.kycSection.identityTypes.passport}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identity-number">{copy.kycSection.dojahForm.identityNumberLabel}</Label>
                  <Input
                    id="identity-number"
                    value={identityNumber}
                    onChange={(event) => {
                      setIdentityNumber(event.target.value);
                    }}
                    minLength={6}
                    maxLength={32}
                    required
                  />
                </div>

                <Button type="submit" disabled={dojahMutation.isPending} className="min-h-11 w-full">
                  {copy.kycSection.dojahForm.submitCta}
                </Button>

                {statusQuery.data.latestDojahCheck.referenceId ? (
                  <p className="text-xs text-muted-foreground">
                    {`${copy.kycSection.dojahForm.pendingReferenceLabel}: ${statusQuery.data.latestDojahCheck.referenceId}`}
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bank verification — connect or upload statement */}
        <Card className="border-border bg-card/95 dark:bg-card/90">
          <CardHeader className="space-y-3">
            <div className="inline-flex items-center gap-2 text-card-foreground">
              <Wallet className="size-5" weight="duotone" aria-hidden="true" />
              <CardTitle className="text-lg md:text-xl">{copy.bankSection.title}</CardTitle>
            </div>
            <CardDescription>{copy.bankSection.description}</CardDescription>
              <TrustSignal message={uiPrimitives.trustSignals.bank} />
          </CardHeader>
          <CardContent className="space-y-4">
            {statusQuery.data.monoConnection.isConnected ? (
              <div className="rounded-lg border border-border bg-background/80 p-3 text-sm dark:bg-background/60">
                <p className="font-medium text-foreground">{copy.bankSection.connectedLabel}</p>
                <p className="text-muted-foreground">
                  {`${statusQuery.data.monoConnection.bankName} (${statusQuery.data.monoConnection.accountNumberMasked})`}
                </p>
              </div>
            ) : (
              <>
                {/* Production: CTA button to launch Mono widget */}
                <Button
                  type="button"
                  className="min-h-11 w-full"
                  onClick={() => {
                    if (process.env.NODE_ENV === 'development') {
                      setShowMonoDevInput(true);
                    }
                    // TODO: launch Mono widget SDK when integrated
                  }}
                  disabled={monoMutation.isPending}
                >
                  {copy.bankSection.connectMonoCta}
                </Button>

                {/* Dev-only fallback: raw Mono ID input */}
                {process.env.NODE_ENV === 'development' && showMonoDevInput && (
                  <form className="mt-3 space-y-3" onSubmit={handleMonoSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="mono-account-id">{copy.bankSection.monoForm.monoAccountIdLabel}</Label>
                      <Input
                        id="mono-account-id"
                        value={monoAccountId}
                        onChange={(event) => {
                          setMonoAccountId(event.target.value);
                        }}
                        placeholder="Mono account ID (dev only)"
                        required
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm" disabled={monoMutation.isPending}>
                      {copy.bankSection.monoForm.submitCta}
                    </Button>
                  </form>
                )}

                {/* Alternative: upload bank statement */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">{copy.bankSection.orDivider}</span>
                  </div>
                </div>

                <Button asChild variant="outline" className="min-h-11 w-full">
                  <Link href="/dashboard/student/documents">
                    <FileText className="mr-2 size-4" weight="duotone" aria-hidden="true" />
                    {copy.bankSection.uploadAlternativeCta}
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {(statusQuery.data.fundingType === 'sponsor' || statusQuery.data.fundingType === 'corporate') ? (
        <StudentSponsorInviteCard />
      ) : null}

      {feedback ? (
        <Card
          className={
            feedback.kind === 'error'
              ? 'border-destructive/30 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10'
              : 'border-border bg-card/95 dark:bg-card/90'
          }
        >
          <CardContent className="flex items-start gap-2 py-4">
            {feedback.kind === 'error' ? (
              <Warning className="mt-0.5 size-5 text-destructive" weight="duotone" aria-hidden="true" />
            ) : (
              <CheckCircle className="mt-0.5 size-5 text-primary" weight="duotone" aria-hidden="true" />
            )}
            <p
              className={
                feedback.kind === 'error'
                  ? 'text-sm text-destructive'
                  : 'text-sm text-foreground'
              }
            >
              {feedback.message}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {hasLoadError ? (
        <Card className="border-destructive/30 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10">
          <CardContent className="flex items-start gap-2 py-4">
            <Warning className="mt-0.5 size-5 text-destructive" weight="duotone" aria-hidden="true" />
            <p className="text-sm text-destructive">{copy.feedback.loadError}</p>
          </CardContent>
        </Card>
      ) : null}
      </Stack>
    </PageShell>
  );
}
