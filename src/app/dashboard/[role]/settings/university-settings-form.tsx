'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { universityCopy } from '@/config/copy/university';
import { browserTrpcClient } from '@/trpc/client';

import { FormErrorBanner, FormSuccessBanner } from './settings-shared';

const copy = universityCopy.settings;

const universityProfileSchema = z.object({
  organizationName: z.string()
    .min(2, copy.profile.validation.orgNameMin)
    .max(120, copy.profile.validation.orgNameMax),
});

type UniversityProfileFormValues = z.infer<typeof universityProfileSchema>;

type UniversityProfile = {
  schoolId: string | null;
  schoolName: string | null;
  organizationName: string | null;
};

export function UniversityProfileSettingsForm({ profile }: { profile: UniversityProfile | null }) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UniversityProfileFormValues>({
    resolver: zodResolver(universityProfileSchema),
    defaultValues: {
      organizationName: profile?.organizationName ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSaved(false);

    try {
      await browserTrpcClient.university.updateUniversitySettings.mutate({
        organizationName: values.organizationName,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch {
      setSubmitError(copy.errors.saveError);
    }
  });

  return (
    <Card className="border-border bg-card dark:border-border dark:bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">
          {copy.profile.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {/* Organisation name */}
          <div className="space-y-2">
            <Label htmlFor="university-org-name">
              {copy.profile.organizationNameLabel}
            </Label>
            <Input
              id="university-org-name"
              type="text"
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.organizationName)}
              aria-describedby={
                errors.organizationName ? 'university-org-name-error' : undefined
              }
              {...register('organizationName')}
            />
            {errors.organizationName?.message ? (
              <p id="university-org-name-error" className="text-sm text-destructive">
                {errors.organizationName.message}
              </p>
            ) : null}
          </div>

          {/* Linked school (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="university-school-name">
              {copy.profile.schoolNameLabel}
            </Label>
            <div
              id="university-school-name"
              className="flex h-11 items-center rounded-md border border-border bg-muted/30 px-3 text-sm text-muted-foreground"
            >
              {profile?.schoolName ?? '\u2014'}
            </div>
            <p className="text-xs text-muted-foreground">
              {copy.profile.schoolNameHint}
            </p>
          </div>

          {submitError ? <FormErrorBanner message={submitError} /> : null}
          {saved ? <FormSuccessBanner message={copy.profile.savedLabel} /> : null}

          <div className="flex justify-end">
            <Button type="submit" className="min-h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {copy.profile.savingLabel}
                </span>
              ) : (
                copy.profile.saveLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
