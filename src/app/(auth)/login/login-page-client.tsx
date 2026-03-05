'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
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
import { cn } from '@/lib/utils';
import { browserTrpcClient } from '@/trpc/client';

const loginSchema = z.object({
  email: z.string().email(authCopy.validation.invalidEmail),
  password: z.string().min(8, authCopy.validation.passwordMin),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPageClient() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const { error } = await supabaseBrowserClient.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setSubmitError(error.message || authCopy.login.genericError);
      return;
    }

    try {
      await browserTrpcClient.student.ensureProfile.mutate();
      const profile = await browserTrpcClient.student.getCurrentProfile.query();
      router.push(`/dashboard/${profile.role}`);
    } catch {
      setSubmitError(authCopy.login.genericError);
    }
  });

  return (
    <Card className="border-border/70 bg-card/95 text-card-foreground shadow-xl dark:border-border">
      <CardHeader className="space-y-3">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-4" aria-hidden="true" />
          <span className="text-sm">{authCopy.login.trustLabel}</span>
        </div>
        <h2 className="leading-none font-semibold text-2xl tracking-tight text-card-foreground">
          {authCopy.login.title}
        </h2>
        <CardDescription className="text-sm text-muted-foreground">
          {authCopy.login.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="login-email">{authCopy.common.emailLabel}</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder={authCopy.common.emailHint}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email?.message ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">{authCopy.common.passwordLabel}</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder={authCopy.common.passwordHint}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password?.message ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
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
              authCopy.login.submitLabel
            )}
          </Button>

          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              {authCopy.login.links.noAccount}{' '}
              <Link
                href={authCopy.routes.signup}
                className={cn(
                  'inline-flex min-h-11 items-center px-1 font-medium text-primary underline-offset-4 transition-colors duration-150 hover:text-primary/80 hover:underline',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              >
                {authCopy.login.links.signup}
              </Link>
            </p>
            <p>
              <Link
                href={authCopy.routes.forgotPassword}
                className={cn(
                  'inline-flex min-h-11 items-center px-1 font-medium text-primary underline-offset-4 transition-colors duration-150 hover:text-primary/80 hover:underline',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              >
                {authCopy.login.links.forgotPassword}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
