'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';
import {
  relationshipToStudentSchema,
  sponsorProfileInputSchema,
  type SponsorProfileInput,
} from '@/server/routers/sponsor.schemas';

type SponsorProfileFormProps = {
  initialValues: SponsorProfileInput;
  onSubmit: (values: SponsorProfileInput) => Promise<void>;
  isSaving: boolean;
  submitError: string | null;
  submitSuccess: string | null;
};

export function SponsorProfileForm({
  initialValues,
  onSubmit,
  isSaving,
  submitError,
  submitSuccess,
}: SponsorProfileFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SponsorProfileInput>({
    resolver: zodResolver(sponsorProfileInputSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const sponsorType = useWatch({
    control,
    name: 'sponsorType',
  });

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur-sm dark:border-border/70 dark:bg-card/80">
      <CardHeader className="space-y-3">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <UserRound className="size-5" aria-hidden="true" />
          <span className="text-sm">{sponsorCopy.settings.profile.title}</span>
        </div>
        <CardTitle className="text-2xl text-card-foreground">
          {sponsorCopy.settings.profile.title}
        </CardTitle>
        <CardDescription>{sponsorCopy.settings.profile.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={submitHandler} noValidate>
          <div className="space-y-2">
            <Label htmlFor="sponsor-full-name">{sponsorCopy.settings.profile.fullNameLabel}</Label>
            <Input
              id="sponsor-full-name"
              className="h-11 bg-background"
              placeholder={sponsorCopy.settings.profile.fullNamePlaceholder}
              aria-invalid={Boolean(errors.fullName)}
              {...register('fullName')}
            />
            {errors.fullName?.message ? (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sponsor-email">{sponsorCopy.settings.profile.emailLabel}</Label>
              <Input
                id="sponsor-email"
                type="email"
                autoComplete="email"
                className="h-11 bg-background"
                placeholder={sponsorCopy.settings.profile.emailPlaceholder}
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              {errors.email?.message ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsor-phone">{sponsorCopy.settings.profile.phoneLabel}</Label>
              <Input
                id="sponsor-phone"
                type="tel"
                className="h-11 bg-background"
                placeholder={sponsorCopy.settings.profile.phonePlaceholder}
                aria-invalid={Boolean(errors.phoneNumber)}
                {...register('phoneNumber')}
              />
              <p className="text-xs text-muted-foreground">
                {sponsorCopy.settings.profile.phoneHint}
              </p>
              {errors.phoneNumber?.message ? (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{sponsorCopy.settings.profile.sponsorTypeLabel}</Label>
            <p className="text-sm text-muted-foreground">
              {sponsorCopy.settings.profile.sponsorTypeDescription}
            </p>

            <Controller
              name="sponsorType"
              control={control}
              render={({ field }) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(['individual', 'corporate'] as const).map((option) => {
                    const optionCopy = sponsorCopy.settings.profile.sponsorTypeOptions[option];
                    const isActive = field.value === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => field.onChange(option)}
                        className={cn(
                          'flex min-h-11 flex-col items-start rounded-lg border p-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isActive
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border/70 bg-background/60 text-muted-foreground hover:bg-accent/50',
                        )}
                      >
                        <span className="text-sm font-medium text-foreground">
                          {optionCopy.label}
                        </span>
                        <span className="mt-1 text-xs">{optionCopy.description}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">{sponsorCopy.settings.profile.relationshipLabel}</Label>
            <Controller
              name="relationshipToStudent"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="relationship"
                    className="h-11 w-full bg-background"
                    aria-invalid={Boolean(errors.relationshipToStudent)}
                  >
                    <SelectValue
                      placeholder={sponsorCopy.settings.profile.relationshipPlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipToStudentSchema.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {sponsorCopy.settings.profile.relationshipOptions[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.relationshipToStudent?.message ? (
              <p className="text-sm text-destructive">{errors.relationshipToStudent.message}</p>
            ) : null}
          </div>

          {sponsorType === 'corporate' ? (
            <section className="space-y-4 rounded-xl border border-border/70 bg-background/60 p-4 dark:border-border/80 dark:bg-background/40">
              <div className="inline-flex items-center gap-2 text-foreground">
                <Building2 className="size-5 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">
                  {sponsorCopy.settings.profile.corporateSectionTitle}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {sponsorCopy.settings.profile.corporateSectionDescription}
              </p>

              <div className="space-y-2">
                <Label htmlFor="company-name">{sponsorCopy.settings.profile.companyNameLabel}</Label>
                <Input
                  id="company-name"
                  className="h-11 bg-background"
                  placeholder={sponsorCopy.settings.profile.companyNamePlaceholder}
                  aria-invalid={Boolean(errors.companyName)}
                  {...register('companyName')}
                />
                {errors.companyName?.message ? (
                  <p className="text-sm text-destructive">{errors.companyName.message}</p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cac-number">{sponsorCopy.settings.profile.cacNumberLabel}</Label>
                  <Input
                    id="cac-number"
                    className="h-11 bg-background"
                    placeholder={sponsorCopy.settings.profile.cacNumberPlaceholder}
                    aria-invalid={Boolean(errors.cacNumber)}
                    {...register('cacNumber')}
                  />
                  {errors.cacNumber?.message ? (
                    <p className="text-sm text-destructive">{errors.cacNumber.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="director-bvn">
                    {sponsorCopy.settings.profile.directorBvnLabel}
                  </Label>
                  <Input
                    id="director-bvn"
                    className="h-11 bg-background"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder={sponsorCopy.settings.profile.directorBvnPlaceholder}
                    aria-invalid={Boolean(errors.directorBvn)}
                    {...register('directorBvn')}
                  />
                  {errors.directorBvn?.message ? (
                    <p className="text-sm text-destructive">{errors.directorBvn.message}</p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {submitError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:bg-destructive/15">
              {submitError}
            </p>
          ) : null}

          {submitSuccess ? (
            <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary dark:bg-primary/15">
              {submitSuccess}
            </p>
          ) : null}

          <Button type="submit" className="h-11 w-full md:w-auto" disabled={isSaving}>
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {sponsorCopy.settings.profile.submittingLabel}
              </span>
            ) : (
              sponsorCopy.settings.profile.submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
