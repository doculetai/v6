'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authCopy } from '@/config/copy/auth';
import { supabaseBrowserClient } from '@/lib/auth/browser-client';
import { browserTrpcClient } from '@/trpc/client';

const updatePasswordSchema = z
  .object({
    newPassword: z.string().min(8, authCopy.validation.passwordMin),
    confirmPassword: z.string().min(8, authCopy.validation.passwordMin),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: authCopy.validation.passwordsDoNotMatch,
    path: ['confirmPassword'],
  });

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordPageClient() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const { error } = await supabaseBrowserClient.auth.updateUser({
      password: values.newPassword,
    });

    if (error) {
      setSubmitError(error.message || authCopy.updatePassword.genericError);
      return;
    }

    try {
      const profile = await browserTrpcClient.student.getCurrentProfile.query();
      router.push(`/dashboard/${profile.role}`);
    } catch {
      setSubmitError(authCopy.updatePassword.genericError);
    }
  });

  return (
    <Card className="border-border/70 bg-card/95 text-card-foreground shadow-xl dark:border-border">
      <CardHeader className="space-y-3">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <LockKeyhole className="size-4" aria-hidden="true" />
          <span className="text-sm">{authCopy.updatePassword.trustLabel}</span>
        </div>
        <h2 className="leading-none font-semibold text-2xl tracking-tight text-card-foreground">
          {authCopy.updatePassword.title}
        </h2>
        <CardDescription className="text-sm text-muted-foreground">
          {authCopy.updatePassword.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="update-password-new">{authCopy.common.passwordLabel}</Label>
            <Input
              id="update-password-new"
              type="password"
              autoComplete="new-password"
              placeholder={authCopy.common.passwordPlaceholder}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.newPassword)}
              {...register('newPassword')}
            />
            {errors.newPassword?.message ? (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-password-confirm">{authCopy.common.confirmPasswordLabel}</Label>
            <Input
              id="update-password-confirm"
              type="password"
              autoComplete="new-password"
              placeholder={authCopy.common.confirmPasswordPlaceholder}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword?.message ? (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15">
              {submitError}
            </p>
          ) : null}

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {authCopy.common.submittingText}
              </span>
            ) : (
              authCopy.updatePassword.submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
