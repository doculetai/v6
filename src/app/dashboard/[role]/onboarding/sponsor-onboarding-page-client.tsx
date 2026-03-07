'use client';

import { ArrowLeft, Buildings, CheckCircle, CircleNotch, Handshake } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Container, PageShell, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sponsorCopy } from '@/config/copy/sponsor';
import { trpc } from '@/trpc/client';

type SponsorType = 'individual' | 'corporate';

const copy = sponsorCopy.onboarding;
const TOTAL_STEPS = 3;

export function SponsorOnboardingPageClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sponsorType, setSponsorType] = useState<SponsorType>('individual');
  const [companyName, setCompanyName] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const completeOnboardingMutation = trpc.sponsor.completeOnboarding.useMutation({
    onSuccess: () => {
      router.push('/dashboard/sponsor');
    },
    onError: () => {
      setSubmitError('Could not complete setup. Please try again.');
    },
  });

  const handleComplete = () => {
    completeOnboardingMutation.mutate({
      sponsorType,
      companyName: sponsorType === 'corporate' ? companyName : undefined,
    });
  };

  return (
    <PageShell width="narrow">
      <Stack gap="md">
        <PageHeader
          title={copy.title}
          description={copy.subtitle}
        />

        {step > 0 ? (
          <button
            type="button"
            onClick={() => {
              setSubmitError(null);
              setStep(step - 1);
            }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <ArrowLeft weight="duotone" className="size-4" aria-hidden="true" />
            Back
          </button>
        ) : null}

        <p className="text-xs font-medium text-muted-foreground">
          {copy.progress.replace('{current}', String(step + 1)).replace('{total}', String(TOTAL_STEPS))}
        </p>

        {step === 0 ? (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Handshake className="size-5 text-[#15803D]" weight="duotone" aria-hidden="true" />
                {copy.steps.welcome.heading}
              </CardTitle>
              <CardDescription>{copy.steps.welcome.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setStep(1)} className="min-h-11 w-full">
                {copy.steps.welcome.cta}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>{copy.steps.profile.heading}</CardTitle>
              <CardDescription>{copy.steps.profile.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{copy.steps.profile.sponsorTypeLabel}</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SponsorTypeCard
                    type="individual"
                    selected={sponsorType === 'individual'}
                    label={copy.steps.profile.sponsorTypeOptions.individual.label}
                    description={copy.steps.profile.sponsorTypeOptions.individual.description}
                    onSelect={() => setSponsorType('individual')}
                  />
                  <SponsorTypeCard
                    type="corporate"
                    selected={sponsorType === 'corporate'}
                    label={copy.steps.profile.sponsorTypeOptions.corporate.label}
                    description={copy.steps.profile.sponsorTypeOptions.corporate.description}
                    onSelect={() => setSponsorType('corporate')}
                  />
                </div>
              </div>

              {sponsorType === 'corporate' ? (
                <div className="space-y-2">
                  <Label htmlFor="company-name">{copy.steps.profile.companyNameLabel}</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={copy.steps.profile.companyNamePlaceholder}
                    className="min-h-11"
                  />
                </div>
              ) : null}

              <Button
                onClick={() => {
                  if (sponsorType === 'corporate' && !companyName.trim()) return;
                  setStep(2);
                }}
                disabled={sponsorType === 'corporate' && !companyName.trim()}
                className="min-h-11 w-full"
              >
                {copy.steps.profile.cta}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="size-5 text-[#15803D]" weight="duotone" aria-hidden="true" />
                {copy.steps.complete.heading}
              </CardTitle>
              <CardDescription>{copy.steps.complete.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {submitError ? (
                <p className="text-sm text-destructive">{submitError}</p>
              ) : null}
              <Button
                onClick={handleComplete}
                disabled={completeOnboardingMutation.isPending}
                className="min-h-11 w-full gap-2"
              >
                {completeOnboardingMutation.isPending ? (
                  <CircleNotch className="size-5 animate-spin" weight="duotone" aria-hidden="true" />
                ) : null}
                {copy.steps.complete.cta}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </Stack>
    </PageShell>
  );
}

type SponsorTypeCardProps = {
  type: SponsorType;
  selected: boolean;
  label: string;
  description: string;
  onSelect: () => void;
};

function SponsorTypeCard({ type, selected, label, description, onSelect }: SponsorTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border p-4 text-left transition-colors ${
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          {type === 'corporate' ? (
            <Buildings className="size-4 text-muted-foreground" weight="duotone" aria-hidden="true" />
          ) : (
            <Handshake className="size-4 text-muted-foreground" weight="duotone" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}
