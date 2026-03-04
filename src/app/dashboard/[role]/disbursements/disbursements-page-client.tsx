'use client';

import { AlertTriangle, HandCoins, RefreshCw, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DisbursementList } from '@/components/sponsor/DisbursementList';
import { NewDisbursementForm, type CreateDisbursementInput } from '@/components/sponsor/NewDisbursementForm';
import type { SponsorDisbursement } from '@/components/sponsor/disbursement-types';
import { ActivityTimeline, type ActivityTimelineItem } from '@/components/ui/activity-timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoneyValue } from '@/components/ui/money-value';
import { PageHeader } from '@/components/ui/page-header';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';
import { browserTrpcClient } from '@/trpc/client';

import type { DisbursementFilter } from '@/components/sponsor/disbursement-types';

const emptyDisbursements: SponsorDisbursement[] = [];
const emptyStudents: Awaited<
  ReturnType<typeof browserTrpcClient.sponsor.getDisbursements.query>
>['students'] = [];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function getTimelineTone(status: SponsorDisbursement['status']) {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'processing') return 'info';
  return 'warning';
}

export function DisbursementsPageClient() {
  const [filter, setFilter] = useState<DisbursementFilter>('all');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [cancellingDisbursementId, setCancellingDisbursementId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payload, setPayload] = useState<
    Awaited<ReturnType<typeof browserTrpcClient.sponsor.getDisbursements.query>> | null
  >(null);

  const loadDisbursements = useCallback(async (refresh = false) => {
    try {
      setLoadError(null);
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const nextPayload = await browserTrpcClient.sponsor.getDisbursements.query();
      setPayload(nextPayload);
    } catch (error) {
      setLoadError(getErrorMessage(error, sponsorCopy.disbursements.states.error));
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDisbursements();
  }, [loadDisbursements]);

  const onCreateDisbursement = useCallback(
    async (input: CreateDisbursementInput) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);
        setIsCreating(true);

        const response = await browserTrpcClient.sponsor.createDisbursement.mutate(input);
        setSubmitSuccess(sponsorCopy.disbursements.form.messages.success);
        await loadDisbursements(true);

        if (typeof window !== 'undefined') {
          window.open(response.paystackAuthorizationUrl, '_blank', 'noopener,noreferrer');
        }
      } catch (error) {
        setSubmitError(getErrorMessage(error, sponsorCopy.disbursements.form.messages.paystackFailed));
      } finally {
        setIsCreating(false);
      }
    },
    [loadDisbursements],
  );

  const onCancelDisbursement = useCallback(
    async (disbursementId: string) => {
      try {
        setLoadError(null);
        setCancellingDisbursementId(disbursementId);
        await browserTrpcClient.sponsor.cancelDisbursement.mutate({ disbursementId });
        await loadDisbursements(true);
      } catch (error) {
        setLoadError(getErrorMessage(error, sponsorCopy.errors.generic));
      } finally {
        setCancellingDisbursementId(null);
      }
    },
    [loadDisbursements],
  );

  const disbursements = payload?.disbursements ?? emptyDisbursements;
  const students = payload?.students ?? emptyStudents;

  const timelineItems = useMemo<ActivityTimelineItem[]>(() => {
    return disbursements.slice(0, 8).map((disbursement) => ({
      id: disbursement.id,
      title: `${sponsorCopy.disbursements.statusLabels[disbursement.status]} ${disbursement.studentDisplayName}`,
      description: disbursement.paystackReference
        ? `${sponsorCopy.disbursements.table.reference}: ${disbursement.paystackReference}`
        : sponsorCopy.disbursements.table.unavailable,
      timestamp: disbursement.updatedAt,
      tone: getTimelineTone(disbursement.status),
    }));
  }, [disbursements]);

  if (isLoading && !payload) {
    return (
      <div className="space-y-4">
        <PageHeader
          title={sponsorCopy.disbursements.title}
          subtitle={sponsorCopy.disbursements.states.loading}
        />
        <div className="h-48 animate-pulse rounded-xl border border-border/70 bg-card/70 dark:bg-card/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={sponsorCopy.disbursements.title}
        subtitle={sponsorCopy.disbursements.subtitle}
        badge={
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <HandCoins className="size-4" aria-hidden="true" />
            {sponsorCopy.disbursements.security.title}
          </span>
        }
        actions={
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => void loadDisbursements(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden="true" />
            {sponsorCopy.disbursements.actions.refresh}
          </Button>
        }
      />

      {loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15">
          <p className="inline-flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" aria-hidden="true" />
            {loadError}
          </p>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-card/95 dark:bg-card/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {sponsorCopy.disbursements.summary.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="inline-flex items-center text-2xl font-semibold text-foreground">
              <span aria-hidden="true">₦</span>
              <MoneyValue amountMinor={payload?.summary.totalKobo ?? 0} showCode={false} />
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/95 dark:bg-card/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {sponsorCopy.disbursements.summary.pending}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{payload?.summary.pendingCount ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/95 dark:bg-card/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {sponsorCopy.disbursements.summary.completed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {payload?.summary.completedCount ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/95 dark:bg-card/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {sponsorCopy.disbursements.summary.failed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{payload?.summary.failedCount ?? 0}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <DisbursementList
          disbursements={disbursements}
          activeFilter={filter}
          query={query}
          cancellingDisbursementId={cancellingDisbursementId}
          onQueryChange={setQuery}
          onFilterChange={setFilter}
          onCancel={onCancelDisbursement}
        />

        <aside className="space-y-4">
          <NewDisbursementForm
            students={students}
            isSubmitting={isCreating}
            disabled={students.length === 0}
            disabledMessage={
              students.length === 0 ? sponsorCopy.disbursements.states.emptyStudents : undefined
            }
            submitError={submitError}
            submitSuccess={submitSuccess}
            onSubmit={onCreateDisbursement}
          />

          <Card className="bg-card/95 dark:bg-card/90">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-base text-foreground">
                <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                {sponsorCopy.disbursements.timeline.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                items={timelineItems}
                emptyLabel={sponsorCopy.disbursements.timeline.empty}
              />
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
