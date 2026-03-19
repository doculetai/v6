'use client';

import { Buildings, CheckCircle, CircleNotch, GraduationCap } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageShell, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { universityCopy } from '@/config/copy/university';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';

const copy = universityCopy.onboarding;
const TOTAL_STEPS = 3;

export function UniversityOnboardingPageClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [organizationName, setOrganizationName] = useState('');

  const completeOnboardingMutation = trpc.university.completeOnboarding.useMutation({
    onSuccess: () => {
      router.push(routes.dashboard.university.overview);
    },
  });

  const handleComplete = () => {
    if (!organizationName.trim()) return;
    completeOnboardingMutation.mutate({
      organizationName: organizationName.trim(),
    });
  };

  return (
    <PageShell width="narrow">
      <Stack gap="md">
        <PageHeader
          title={copy.title}
          description={copy.subtitle}
        />

        <p className="text-xs font-medium text-muted-foreground">
          {copy.progress.replace('{current}', String(step + 1)).replace('{total}', String(TOTAL_STEPS))}
        </p>

        {step === 0 ? (
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <GraduationCap className="size-5 text-primary" weight="duotone" aria-hidden="true" />
              </div>
              <CardTitle>{copy.steps.welcome.heading}</CardTitle>
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
                <Label htmlFor="institution-name">{copy.steps.profile.institutionNameLabel}</Label>
                <Input
                  id="institution-name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder={copy.steps.profile.institutionNamePlaceholder}
                  className="min-h-11"
                />
              </div>

              <Button
                onClick={() => {
                  if (organizationName.trim().length >= 2) setStep(2);
                }}
                disabled={organizationName.trim().length < 2}
                className="min-h-11 w-full"
              >
                {copy.steps.profile.cta}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle className="size-5 text-primary" weight="duotone" aria-hidden="true" />
              </div>
              <CardTitle>{copy.steps.complete.heading}</CardTitle>
              <CardDescription>{copy.steps.complete.description}</CardDescription>
            </CardHeader>
            <CardContent>
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
