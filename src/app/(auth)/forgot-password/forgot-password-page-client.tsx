'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authCopy } from '@/config/copy/auth';
import { supabaseBrowserClient } from '@/lib/auth/browser-client';
import { cn } from '@/lib/utils';

const forgotPasswordSchema = z.object({
  email: z.string().email(authCopy.validation.invalidEmail),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPageClient() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetSentEmail, setResetSentEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const { error } = await supabaseBrowserClient.auth.resetPasswordForEmail(values.email, {
      redirectTo: authCopy.routes.updatePassword,
    });

    if (error) {
      setSubmitError(error.message || authCopy.forgotPassword.genericError);
      return;
    }

    setResetSentEmail(values.email);
  });

  if (resetSentEmail) {
    return (
      <Card className="border-border/70 bg-card/95 text-card-foreground shadow-xl dark:border-border">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto inline-flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary dark:bg-primary/25">
            <CheckCircle2 className="size-4" aria-hidden="true" />
          </div>
          <h1 className="leading-none font-semibold text-2xl tracking-tight text-card-foreground">
            {authCopy.forgotPassword.successTitle}
          </h1>
          <CardDescription className="text-sm text-muted-foreground">
            {authCopy.forgotPassword.successDescription(resetSentEmail)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={authCopy.routes.login}
            className={cn(
              'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            {authCopy.forgotPassword.links.backToLogin}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/95 text-card-foreground shadow-xl dark:border-border">
      <CardHeader className="space-y-3">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <Mail className="size-4" aria-hidden="true" />
          <span className="text-sm">{authCopy.forgotPassword.trustLabel}</span>
        </div>
        <h1 className="leading-none font-semibold text-2xl tracking-tight text-card-foreground">
          {authCopy.forgotPassword.title}
        </h1>
        <CardDescription className="text-sm text-muted-foreground">
          {authCopy.forgotPassword.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="forgot-password-email">{authCopy.common.emailLabel}</Label>
            <Input
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              placeholder={authCopy.common.emailPlaceholder}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email?.message ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
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
              authCopy.forgotPassword.submitLabel
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={authCopy.routes.login}
              className={cn(
                'inline-flex min-h-11 items-center px-1 font-medium text-primary underline-offset-4 transition-colors duration-150 hover:text-primary/80 hover:underline',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              {authCopy.forgotPassword.links.backToLogin}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
