'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GraduationCap,
  CircleNotch,
  Buildings,
  ShieldCheck,
  Sparkle,
  Warning,
  Wallet,
  CheckCircle,
} from '@/components/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { FundingTypeOption } from '@/components/student/FundingTypeOption';
import { OnboardingHero, OnboardingLoadingState } from '@/components/student/OnboardingShell';
import { OnboardingStateCard } from '@/components/student/OnboardingStateCard';
import { PageShell, Section, Stack } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { studentCopy } from '@/config/copy/student';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import type { RouterOutputs } from '@/trpc/client';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';
type OnboardingData = RouterOutputs['student']['getOnboardingWizard'];
type FundingTypeValue = NonNullable<OnboardingData['fundingType']>;
type SchoolProgramFormValues = { schoolId: string; programId: string };
type FundingTypeFormValues = { fundingType: string };
const onboardingCopy = studentCopy.onboardingWizard;
const fundingTypeValues = ['self', 'sponsor', 'corporate'] as const;
const stepLabels = [
  onboardingCopy.steps.welcome.title,
  onboardingCopy.steps.schoolProgram.title,
  onboardingCopy.steps.fundingType.title,
  onboardingCopy.steps.action.title,
];
const schoolProgramSchema = z.object({
  schoolId: z.string().min(1, onboardingCopy.steps.schoolProgram.errors.schoolRequired),
  programId: z.string().min(1, onboardingCopy.steps.schoolProgram.errors.programRequired),
});
const fundingTypeSchema = z.object({
  fundingType: z
    .string()
    .min(1, onboardingCopy.steps.fundingType.errors.fundingRequired)
    .refine((value) => fundingTypeValues.includes(value as FundingTypeValue), {
      message: onboardingCopy.steps.fundingType.errors.fundingRequired,
    }),
});
function formatTuition(amount: number, currency: string): string {
  return `${currency} ${new Intl.NumberFormat('en-NG').format(amount)}`;
}
const universityRequestSchema = z.object({
  universityName: z.string().min(2),
  country: z.string().min(2),
  contactEmail: z.string().email().optional().or(z.literal('')),
});
type UniversityRequestValues = z.infer<typeof universityRequestSchema>;

const PROCESSING_FEE_NGN = 15_000;

function CostBreakdownCard({
  tuitionAmount,
  tuitionCurrency,
  processingFee,
}: {
  tuitionAmount: number;
  tuitionCurrency: string;
  processingFee: number;
}) {
  const copy = onboardingCopy.costBreakdown;
  const total = tuitionAmount + processingFee;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{copy.tuition}</span>
          <span className="font-mono font-medium">{formatTuition(tuitionAmount, tuitionCurrency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{copy.processingFee}</span>
          <span className="font-mono font-medium">{formatTuition(processingFee, copy.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
          <span>{copy.total}</span>
          <span className="font-mono">{formatTuition(total, copy.currency)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function OnboardingPageClient() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [manualStep, setManualStep] = useState<number | null>(null);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [uniSheetOpen, setUniSheetOpen] = useState(false);
  const [uniSubmitted, setUniSubmitted] = useState(false);
  const [uniSubmitting, setUniSubmitting] = useState(false);
  const universityRequestForm = useForm<UniversityRequestValues>({
    resolver: zodResolver(universityRequestSchema),
    defaultValues: { universityName: '', country: '', contactEmail: '' },
  });
  const uniNotFoundCopy = onboardingCopy.universityNotFound;

  function handleUniversityRequest(values: UniversityRequestValues) {
    setUniSubmitting(true);
    // Stub: no tRPC procedure yet — simulate submission latency
    setTimeout(() => {
      setUniSubmitting(false);
      setUniSubmitted(true);
      universityRequestForm.reset();
    }, 800);
    void values;
  }
  const onboardingQuery = trpc.student.getOnboardingWizard.useQuery();
  const onboardingData = onboardingQuery.data;
  const schoolProgramForm = useForm<SchoolProgramFormValues>({
    resolver: zodResolver(schoolProgramSchema),
    defaultValues: { schoolId: '', programId: '' },
  });
  const fundingTypeForm = useForm<FundingTypeFormValues>({
    resolver: zodResolver(fundingTypeSchema),
    defaultValues: { fundingType: '' },
  });
  const saveSchoolProgram = trpc.student.saveSchoolProgram.useMutation({
    onSuccess: async () => {
      setManualStep(3);
      setSchoolError(null);
      await utils.student.getOnboardingWizard.invalidate();
    },
    onError: (error) => setSchoolError(error.message || studentCopy.errors.generic),
  });
  const saveFundingType = trpc.student.saveFundingType.useMutation({
    onSuccess: async () => {
      setManualStep(4);
      setFundingError(null);
      await utils.student.getOnboardingWizard.invalidate();
    },
    onError: (error) => setFundingError(error.message || studentCopy.errors.generic),
  });
  const completeOnboarding = trpc.student.completeOnboarding.useMutation({
    onSuccess: async () => {
      setManualStep(4);
      setCompleteError(null);
      await utils.student.getOnboardingWizard.invalidate();
    },
    onError: (error) => setCompleteError(error.message || studentCopy.errors.generic),
  });
  useEffect(() => {
    if (!onboardingData) {
      return;
    }
    schoolProgramForm.reset({
      schoolId: onboardingData.selectedSchoolId ?? '',
      programId: onboardingData.selectedProgramId ?? '',
    });
    fundingTypeForm.reset({
      fundingType: onboardingData.fundingType ?? '',
    });
  }, [fundingTypeForm, onboardingData, schoolProgramForm]);
  const selectedSchoolId = useWatch({
    control: schoolProgramForm.control,
    name: 'schoolId',
  });
  const selectedFunding = useWatch({
    control: fundingTypeForm.control,
    name: 'fundingType',
  });
  const selectedSchool = useMemo(() => {
    if (!onboardingData) {
      return null;
    }
    return onboardingData.schools.find((school) => school.id === selectedSchoolId) ?? null;
  }, [onboardingData, selectedSchoolId]);
  const persistedSchool =
    onboardingData?.schools.find((school) => school.id === onboardingData.selectedSchoolId) ?? null;
  const persistedProgram =
    persistedSchool?.programs.find((program) => program.id === onboardingData?.selectedProgramId) ??
    null;
  const persistedFundingTitle = onboardingData?.fundingType
    ? onboardingCopy.steps.fundingType.options[onboardingData.fundingType].title
    : onboardingCopy.steps.action.summary.missingValue;
  const persistedStep = onboardingData?.onboardingComplete ? 4 : onboardingData?.currentStep ?? 1;
  const currentStep = onboardingData?.onboardingComplete ? 4 : (manualStep ?? persistedStep);
  if (onboardingQuery.isLoading) {
    return <OnboardingLoadingState />;
  }
  if (onboardingQuery.isError) {
    return (
      <PageShell width="wide">
        <OnboardingStateCard
          icon={Warning}
          title={onboardingCopy.error.title}
          description={onboardingCopy.error.description}
          actionLabel={onboardingCopy.error.retryCta}
          onAction={() => onboardingQuery.refetch()}
        />
      </PageShell>
    );
  }
  if (!onboardingData || onboardingData.schools.length === 0) {
    return (
      <PageShell width="wide">
        <OnboardingStateCard
          icon={Buildings}
          title={onboardingCopy.empty.title}
          description={onboardingCopy.empty.description}
          actionLabel={onboardingCopy.empty.cta}
          onAction={() => router.push(routes.dashboard.student.overview)}
        />
      </PageShell>
    );
  }
  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="md">
          <PageHeader
            title={onboardingCopy.title}
            description={onboardingCopy.subtitle}
          />
          <OnboardingHero currentStep={currentStep} stepLabels={stepLabels} />
      {currentStep === 1 ? (
        <Card className="border-border bg-card">
          <CardHeader className="space-y-3">
            <Sparkle className="size-5 text-primary" weight="duotone" aria-hidden="true" />
            <CardTitle className="text-2xl text-card-foreground md:text-4xl">
              {onboardingCopy.steps.welcome.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground md:text-base">
              {onboardingCopy.steps.welcome.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-3">
              {onboardingCopy.steps.welcome.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-sm text-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" weight="duotone" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={() => setManualStep(2)}>
              {onboardingCopy.steps.welcome.cta}
            </Button>
          </CardContent>
        </Card>
      ) : null}
      {currentStep === 2 ? (
        <Card className="border-border bg-card">
          <CardHeader className="space-y-3">
            <GraduationCap className="size-5 text-primary" weight="duotone" aria-hidden="true" />
            <CardTitle className="text-2xl text-card-foreground md:text-4xl">
              {onboardingCopy.steps.schoolProgram.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground md:text-base">
              {onboardingCopy.steps.schoolProgram.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={schoolProgramForm.handleSubmit((values) => {
                saveSchoolProgram.mutate(values);
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="schoolId">{onboardingCopy.steps.schoolProgram.schoolLabel}</Label>
                <Select
                  value={schoolProgramForm.watch('schoolId')}
                  onValueChange={(value) => {
                    schoolProgramForm.setValue('schoolId', value, { shouldValidate: true });
                    schoolProgramForm.setValue('programId', '', { shouldValidate: true });
                  }}
                >
                  <SelectTrigger id="schoolId" className="h-11">
                    <SelectValue placeholder={onboardingCopy.steps.schoolProgram.schoolPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {onboardingData.schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {schoolProgramForm.formState.errors.schoolId ? (
                  <p className="text-sm text-destructive">
                    {schoolProgramForm.formState.errors.schoolId.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="programId">{onboardingCopy.steps.schoolProgram.programLabel}</Label>
                <Select
                  value={schoolProgramForm.watch('programId')}
                  onValueChange={(value) => {
                    schoolProgramForm.setValue('programId', value, { shouldValidate: true });
                  }}
                  disabled={!selectedSchool || selectedSchool.programs.length === 0}
                >
                  <SelectTrigger id="programId" className="h-11">
                    <SelectValue placeholder={onboardingCopy.steps.schoolProgram.programPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedSchool?.programs ?? []).map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {schoolProgramForm.formState.errors.programId ? (
                  <p className="text-sm text-destructive">
                    {schoolProgramForm.formState.errors.programId.message}
                  </p>
                ) : null}
              </div>
              {selectedSchool && selectedSchool.programs.length === 0 ? (
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm font-medium text-foreground">
                    {onboardingCopy.steps.schoolProgram.programEmptyTitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {onboardingCopy.steps.schoolProgram.programEmptyDescription}
                  </p>
                </div>
              ) : null}
              {/* Cost breakdown after programme selection */}
              {(() => {
                const selectedProgramId = schoolProgramForm.watch('programId');
                const selectedProg = selectedSchool?.programs.find((p) => p.id === selectedProgramId);
                return selectedProg ? (
                  <CostBreakdownCard
                    tuitionAmount={selectedProg.tuitionAmount}
                    tuitionCurrency={selectedProg.currency}
                    processingFee={PROCESSING_FEE_NGN}
                  />
                ) : null;
              })()}
              <button
                type="button"
                className="text-xs text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => { setUniSheetOpen(true); setUniSubmitted(false); }}
              >
                {uniNotFoundCopy.cta}
              </button>
              {schoolError ? <p className="text-sm text-destructive">{schoolError}</p> : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={() => setManualStep(1)}>
                  {onboardingCopy.navigation.backCta}
                </Button>
                <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={saveSchoolProgram.isPending}>
                  {saveSchoolProgram.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <CircleNotch className="size-5 animate-spin" weight="duotone" aria-hidden="true" />
                      {onboardingCopy.steps.schoolProgram.savingCta}
                    </span>
                  ) : (
                    onboardingCopy.steps.schoolProgram.saveCta
                  )}
                </Button>
              </div>
            </form>
          <Sheet open={uniSheetOpen} onOpenChange={setUniSheetOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8 pt-6 sm:max-w-lg sm:rounded-2xl">
              <SheetHeader className="mb-5">
                <SheetTitle className="text-base font-semibold">{uniNotFoundCopy.sheetTitle}</SheetTitle>
              </SheetHeader>
              {uniSubmitted ? (
                <p className="text-sm text-muted-foreground">{uniNotFoundCopy.successNote}</p>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={universityRequestForm.handleSubmit(handleUniversityRequest)}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="universityName">{uniNotFoundCopy.nameLabel}</Label>
                    <Input
                      id="universityName"
                      {...universityRequestForm.register('universityName')}
                      className="h-11"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country">{uniNotFoundCopy.countryLabel}</Label>
                    <Input
                      id="country"
                      {...universityRequestForm.register('country')}
                      className="h-11"
                      autoComplete="country-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactEmail">{uniNotFoundCopy.emailLabel}</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      {...universityRequestForm.register('contactEmail')}
                      className="h-11"
                      autoComplete="email"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="min-h-11 w-full"
                    disabled={uniSubmitting}
                  >
                    {uniSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <CircleNotch className="size-4 animate-spin" weight="duotone" aria-hidden="true" />
                        {uniNotFoundCopy.submitting}
                      </span>
                    ) : (
                      uniNotFoundCopy.submit
                    )}
                  </Button>
                </form>
              )}
            </SheetContent>
          </Sheet>
          </CardContent>
        </Card>
      ) : null}
      {currentStep === 3 ? (
        <Card className="border-border bg-card">
          <CardHeader className="space-y-3">
            <Wallet className="size-5 text-primary" weight="duotone" aria-hidden="true" />
            <CardTitle className="text-2xl text-card-foreground md:text-4xl">
              {onboardingCopy.steps.fundingType.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground md:text-base">
              {onboardingCopy.steps.fundingType.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={fundingTypeForm.handleSubmit((values) => {
                saveFundingType.mutate({ fundingType: values.fundingType as FundingTypeValue });
              })}
            >
              <div className="space-y-2">
                <Label>{onboardingCopy.steps.fundingType.label}</Label>
                <div className="space-y-3">
                  {fundingTypeValues.map((typeValue) => (
                    <FundingTypeOption
                      key={typeValue}
                      title={onboardingCopy.steps.fundingType.options[typeValue].title}
                      description={onboardingCopy.steps.fundingType.options[typeValue].description}
                      selected={selectedFunding === typeValue}
                      onSelect={() => fundingTypeForm.setValue('fundingType', typeValue, { shouldValidate: true })}
                    />
                  ))}
                </div>
                {fundingTypeForm.formState.errors.fundingType ? (
                  <p className="text-sm text-destructive">
                    {fundingTypeForm.formState.errors.fundingType.message}
                  </p>
                ) : null}
              </div>
              {fundingError ? <p className="text-sm text-destructive">{fundingError}</p> : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={() => setManualStep(2)}>
                  {onboardingCopy.navigation.backCta}
                </Button>
                <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={saveFundingType.isPending}>
                  {saveFundingType.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <CircleNotch className="size-5 animate-spin" weight="duotone" aria-hidden="true" />
                      {onboardingCopy.steps.fundingType.savingCta}
                    </span>
                  ) : (
                    onboardingCopy.steps.fundingType.saveCta
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      {currentStep >= 4 ? (
        <Card className="border-border bg-card">
          <CardHeader className="space-y-3">
            <ShieldCheck className="size-5 text-primary" weight="duotone" aria-hidden="true" />
            <CardTitle className="text-2xl text-card-foreground md:text-4xl">
              {onboardingData.onboardingComplete ? onboardingCopy.steps.action.successTitle : onboardingCopy.steps.action.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground md:text-base">
              {onboardingData.onboardingComplete
                ? onboardingCopy.steps.action.successDescription
                : onboardingCopy.steps.action.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="mb-3 text-sm font-medium text-foreground">
                {onboardingCopy.steps.action.checklistTitle}
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{onboardingCopy.steps.action.summary.school}</dt><dd className="text-right text-foreground">{persistedSchool?.name ?? onboardingCopy.steps.action.summary.missingValue}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{onboardingCopy.steps.action.summary.program}</dt><dd className="text-right text-foreground">{persistedProgram?.name ?? onboardingCopy.steps.action.summary.missingValue}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{onboardingCopy.steps.action.summary.fundingType}</dt><dd className="text-right text-foreground">{persistedFundingTitle}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{onboardingCopy.steps.action.summary.tuition}</dt><dd className="text-right text-foreground">{persistedProgram ? formatTuition(persistedProgram.tuitionAmount, persistedProgram.currency) : onboardingCopy.steps.action.summary.missingValue}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{onboardingCopy.steps.action.summary.duration}</dt><dd className="text-right text-foreground">{persistedProgram ? `${persistedProgram.durationMonths} ${onboardingCopy.steps.action.summary.monthsSuffix}` : onboardingCopy.steps.action.summary.missingValue}</dd></div>
              </dl>
            </div>
            {completeError ? <p className="text-sm text-destructive">{completeError}</p> : null}
            {onboardingData.onboardingComplete ? (
              <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-7 shrink-0 text-primary" weight="duotone" aria-hidden="true" />
                  <p className="text-base font-semibold text-foreground">
                    {onboardingCopy.steps.action.successTitle}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="min-h-11 w-full sm:w-auto">
                    <Link href={routes.dashboard.student.verification}>
                      {onboardingCopy.steps.action.nextStepCta}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
                    <Link href={routes.dashboard.student.overview}>
                      {onboardingCopy.steps.action.overviewCta}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={() => setManualStep(3)}>
                  {onboardingCopy.navigation.backCta}
                </Button>
                <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={() => completeOnboarding.mutate()} disabled={completeOnboarding.isPending}>
                  {completeOnboarding.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <CircleNotch className="size-5 animate-spin" weight="duotone" aria-hidden="true" />
                      {onboardingCopy.steps.action.completingCta}
                    </span>
                  ) : (
                    onboardingCopy.steps.action.completeCta
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
        </Stack>
      </Section>
    </PageShell>
  );
}
