'use client';

import { AlertTriangle, CheckCircle2, ShieldCheck, WalletCards } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { studentCopy } from '@/config/copy/student';
import type { RouterOutputs } from '@/trpc/client';
import { trpc } from '@/trpc/client';

type VerificationStatusOutput = RouterOutputs['student']['getVerificationStatus'];
type TierStatus = VerificationStatusOutput['tiers'][number]['status'];
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

function getBadgeVariant(status: TierStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'verified') {
    return 'default';
  }

  if (status === 'pending') {
    return 'secondary';
  }

  if (status === 'failed') {
    return 'destructive';
  }

  return 'outline';
}

function formatDate(value: Date | null): string {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function VerifyPageClient({ initialData }: VerifyPageClientProps) {
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
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

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
      setBankName('');
      setAccountNumber('');
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
      bankName,
      accountNumber,
    });
  };

  const hasLoadError = statusQuery.isError;

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-2">
        <h2 className="text-3xl font-semibold text-foreground dark:text-foreground md:text-5xl">
          {copy.title}
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
          {copy.subtitle}
        </p>
      </header>

      <Card className="border-border bg-card/95 dark:border-border dark:bg-card/90">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl text-card-foreground dark:text-card-foreground md:text-2xl">
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
            <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-muted-foreground">
              <span>{copy.tracker.completionLabel}</span>
              <span>{`${statusQuery.data.completionPercent}%`}</span>
            </div>
            <Progress value={statusQuery.data.completionPercent} className="h-2.5" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {statusQuery.data.tiers.map((tierItem, index) => {
              const tierCopy = copy.kycSection.tiers[index];

              return (
                <article
                  key={tierItem.tier}
                  className="rounded-xl border border-border bg-background/80 p-4 dark:border-border dark:bg-background/60"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
                        {`Tier ${tierItem.tier}`}
                      </p>
                      <h3 className="text-base font-semibold text-foreground dark:text-foreground">
                        {tierCopy?.label}
                      </h3>
                    </div>
                    <Badge variant={getBadgeVariant(tierItem.status)}>{statusLabels[tierItem.status]}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {tierCopy?.description}
                  </p>
                </article>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            {`${copy.tracker.lastUpdatedLabel}: ${formatDate(latestUpdatedAt)}`}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/95 dark:border-border dark:bg-card/90">
          <CardHeader className="space-y-3">
            <div className="inline-flex items-center gap-2 text-card-foreground dark:text-card-foreground">
              <ShieldCheck className="size-5" aria-hidden="true" />
              <CardTitle className="text-lg md:text-xl">{copy.kycSection.dojahForm.title}</CardTitle>
            </div>
            <CardDescription>{copy.kycSection.dojahForm.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleDojahSubmit}>
              <div className="space-y-2">
                <Label htmlFor="verify-tier">{copy.kycSection.dojahForm.tierLabel}</Label>
                <select
                  id="verify-tier"
                  value={tier}
                  onChange={(event) => {
                    const nextTier = event.target.value === '3' ? 3 : 2;
                    setTier(nextTier);
                  }}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground dark:bg-input/30"
                >
                  <option value="2">Tier 2</option>
                  <option value="3">Tier 3</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identity-type">{copy.kycSection.dojahForm.identityTypeLabel}</Label>
                <select
                  id="identity-type"
                  value={identityType}
                  onChange={(event) => {
                    const nextType = event.target.value as IdentityType;
                    setIdentityType(nextType);
                  }}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground dark:bg-input/30"
                >
                  <option value="bvn">{copy.kycSection.identityTypes.bvn}</option>
                  <option value="nin">{copy.kycSection.identityTypes.nin}</option>
                  <option value="passport">{copy.kycSection.identityTypes.passport}</option>
                </select>
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
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  {`${copy.kycSection.dojahForm.pendingReferenceLabel}: ${statusQuery.data.latestDojahCheck.referenceId}`}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/95 dark:border-border dark:bg-card/90">
          <CardHeader className="space-y-3">
            <div className="inline-flex items-center gap-2 text-card-foreground dark:text-card-foreground">
              <WalletCards className="size-5" aria-hidden="true" />
              <CardTitle className="text-lg md:text-xl">{copy.bankSection.title}</CardTitle>
            </div>
            <CardDescription>{copy.bankSection.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleMonoSubmit}>
              <div className="space-y-2">
                <Label htmlFor="mono-account-id">{copy.bankSection.monoForm.monoAccountIdLabel}</Label>
                <Input
                  id="mono-account-id"
                  value={monoAccountId}
                  onChange={(event) => {
                    setMonoAccountId(event.target.value);
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">{copy.bankSection.monoForm.bankNameLabel}</Label>
                <Input
                  id="bank-name"
                  value={bankName}
                  onChange={(event) => {
                    setBankName(event.target.value);
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-number">{copy.bankSection.monoForm.accountNumberLabel}</Label>
                <Input
                  id="account-number"
                  value={accountNumber}
                  onChange={(event) => {
                    setAccountNumber(event.target.value);
                  }}
                  inputMode="numeric"
                  minLength={10}
                  maxLength={10}
                  required
                />
              </div>

              <Button type="submit" disabled={monoMutation.isPending} className="min-h-11 w-full">
                {copy.bankSection.monoForm.submitCta}
              </Button>
            </form>

            {statusQuery.data.monoConnection.isConnected ? (
              <div className="rounded-lg border border-border bg-background/80 p-3 text-sm dark:border-border dark:bg-background/60">
                <p className="font-medium text-foreground dark:text-foreground">{copy.bankSection.connectedLabel}</p>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  {`${statusQuery.data.monoConnection.bankName} (${statusQuery.data.monoConnection.accountNumberMasked})`}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {feedback ? (
        <Card
          className={
            feedback.kind === 'error'
              ? 'border-destructive/30 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10'
              : 'border-border bg-card/95 dark:border-border dark:bg-card/90'
          }
        >
          <CardContent className="flex items-start gap-2 py-4">
            {feedback.kind === 'error' ? (
              <AlertTriangle className="mt-0.5 size-5 text-destructive" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-5 text-primary" aria-hidden="true" />
            )}
            <p
              className={
                feedback.kind === 'error'
                  ? 'text-sm text-destructive'
                  : 'text-sm text-foreground dark:text-foreground'
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
            <AlertTriangle className="mt-0.5 size-5 text-destructive" aria-hidden="true" />
            <p className="text-sm text-destructive">{copy.feedback.loadError}</p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
