'use client';

import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

// ── Types ─────────────────────────────────────────────────────────────────────

type KycStatus = {
  sponsorType: 'individual' | 'corporate' | 'self' | null;
  kycStatus: 'not_started' | 'pending' | 'verified' | 'failed';
  companyName: string | null;
};

type Copy = typeof sponsorCopy.kyc;

type IdentityType = 'bvn' | 'nin' | 'passport';

type KycPageClientProps = {
  kycStatus: KycStatus;
  copy: Copy;
};

type FeedbackState = { kind: 'success' | 'error'; message: string } | null;

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
    pending: 'bg-muted text-muted-foreground border-0',
    verified: 'bg-primary/10 text-primary border-0',
    failed: 'bg-destructive/10 text-destructive border-0',
  }[status];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium text-foreground">{copy.overallStatusLabel}:</span>
      <Badge className={badgeClass}>{label}</Badge>
    </div>
  );
}

// ── Identity form ─────────────────────────────────────────────────────────────

type IdentityFormProps = {
  tier: 2 | 3;
  copy: Copy;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

function IdentityForm({ tier, copy, onCancel, onSuccess, onError }: IdentityFormProps) {
  const [identityType, setIdentityType] = useState<IdentityType>('bvn');
  const [identityNumber, setIdentityNumber] = useState('');

  const mutation = trpc.sponsor.startDojahIdentityCheck.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: () => {
      onError(copy.feedback.error);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ tier, identityType, identityNumber });
  };

  return (
    <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor={`identity-type-${tier}`} className="text-xs">
          {copy.form.identityTypeLabel}
        </Label>
        <select
          id={`identity-type-${tier}`}
          value={identityType}
          onChange={(event) => {
            setIdentityType(event.target.value as IdentityType);
          }}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground dark:bg-input/30"
        >
          <option value="bvn">{copy.identityTypes.bvn}</option>
          <option value="nin">{copy.identityTypes.nin}</option>
          <option value="passport">{copy.identityTypes.passport}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`identity-number-${tier}`} className="text-xs">
          {copy.form.identityNumberLabel}
        </Label>
        <Input
          id={`identity-number-${tier}`}
          value={identityNumber}
          onChange={(event) => {
            setIdentityNumber(event.target.value);
          }}
          minLength={6}
          maxLength={32}
          required
          className="h-9 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={mutation.isPending} className="min-h-9">
          {copy.form.submitCta}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={mutation.isPending}
          className="min-h-9"
          onClick={onCancel}
        >
          {copy.form.cancelCta}
        </Button>
      </div>
    </form>
  );
}

// ── Tier card ─────────────────────────────────────────────────────────────────

type TierCardProps = {
  tierIndex: number;
  tier: { tierHeading: string; label: string; description: string };
  kycStatus: KycStatus['kycStatus'];
  startCta: string;
  retryLabel: string;
  statusLabels: Copy['status'];
  copy: Copy;
  onFeedback: (feedback: FeedbackState) => void;
};

function TierCard({
  tierIndex,
  tier,
  kycStatus,
  startCta,
  retryLabel,
  statusLabels,
  copy,
  onFeedback,
}: TierCardProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  // Tier 1 (index 0) is always verified — auto-verified via email auth
  if (tierIndex === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-start gap-3 pb-2">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-card-foreground">
              {tier.tierHeading} — {tier.label}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {tier.description}
            </CardDescription>
          </div>
          <Badge className="ml-auto shrink-0 bg-primary/10 text-primary border-0">
            {statusLabels.verified}
          </Badge>
        </CardHeader>
      </Card>
    );
  }

  // Tier 2 (index 1) and Tier 3 (index 2) — identity verification
  const tierNumber = (tierIndex + 1) as 2 | 3;
  const isVerified = kycStatus === 'verified';
  const isFailed = kycStatus === 'failed';
  const isPending = kycStatus === 'pending';

  const statusBadge = isVerified ? (
    <Badge className="ml-auto shrink-0 bg-primary/10 text-primary border-0">
      {statusLabels.verified}
    </Badge>
  ) : isPending ? (
    <Badge className="ml-auto shrink-0 bg-muted text-muted-foreground border-0">
      {statusLabels.inProgress}
    </Badge>
  ) : isFailed ? (
    <Badge className="ml-auto shrink-0 bg-destructive/10 text-destructive border-0">
      {statusLabels.failed}
    </Badge>
  ) : null;

  const headingIcon = isVerified ? (
    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
  ) : isFailed ? (
    <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
  ) : (
    <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        {headingIcon}
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold text-card-foreground">
            {tier.tierHeading} — {tier.label}
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-muted-foreground">
            {tier.description}
          </CardDescription>
        </div>
        {statusBadge}
      </CardHeader>

      {!isVerified ? (
        <CardContent className="pt-0">
          {showForm ? (
            <IdentityForm
              tier={tierNumber}
              copy={copy}
              onCancel={() => {
                setShowForm(false);
              }}
              onSuccess={() => {
                setShowForm(false);
                onFeedback({ kind: 'success', message: copy.feedback.started });
                router.refresh();
              }}
              onError={(message) => {
                onFeedback({ kind: 'error', message });
              }}
            />
          ) : (
            <Button
              size="sm"
              className={cn('min-h-9', isFailed && 'mt-1')}
              onClick={() => {
                onFeedback(null);
                setShowForm(true);
              }}
            >
              {isFailed ? retryLabel : startCta}
            </Button>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}

// ── Feedback banner ────────────────────────────────────────────────────────────

function FeedbackBanner({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) return null;

  return (
    <Card
      className={
        feedback.kind === 'error'
          ? 'border-destructive/30 bg-destructive/5 dark:border-destructive/40 dark:bg-destructive/10'
          : 'border-border bg-card'
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
              : 'text-sm text-foreground'
          }
        >
          {feedback.message}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function KycPageClient({ kycStatus, copy }: KycPageClientProps) {
  const [feedback, setFeedback] = useState<FeedbackState>(null);

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
            statusLabels={copy.status}
            copy={copy}
            onFeedback={setFeedback}
          />
        ))}
      </div>

      <FeedbackBanner feedback={feedback} />
    </div>
  );
}
