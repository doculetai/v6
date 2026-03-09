'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { CircleNotch, ShieldCheck } from '@/components/icons';
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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
    <Card className="border-0 bg-card text-card-foreground shadow-2xl dark:border dark:border-border">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center gap-1.5">
          <ShieldCheck className="size-4 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">{authCopy.login.trustLabel}</span>
        </div>
        <h2 className="leading-none font-semibold text-2xl tracking-tight text-card-foreground">
          {authCopy.login.title}
        </h2>
        <CardDescription className="text-sm text-muted-foreground">
          {authCopy.login.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
            <div className="space-y-2">
              <Label htmlFor="login-email">{authCopy.common.emailLabel}</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder={authCopy.common.emailHint}
                className="h-11"
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
                className="h-11"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              {errors.password?.message ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            {submitError ? (
              <p role="alert" aria-live="polite" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15">
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full transition-transform active:scale-[0.99] disabled:opacity-70"
              disabled={isSubmitting || !isHydrated}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <CircleNotch className="size-4 animate-spin" weight="bold" aria-hidden="true" />
                  {authCopy.common.submittingText}
                </span>
              ) : (
                authCopy.login.submitLabel
              )}
            </Button>
        </form>

        {/* Divider + magic link — outside main form to avoid invalid nested <form> */}
        <div className="space-y-5 pt-1">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {authCopy.orContinueWith}
                </span>
              </div>
            </div>

            <MagicLinkForm />

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
        </div>
      </CardContent>
    </Card>
  );
}

function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: otpError } = await supabaseBrowserClient.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (otpError) {
      setError(authCopy.magicLink.errorMessage);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {authCopy.magicLink.successMessage}
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={authCopy.magicLink.inputPlaceholder}
          className="h-11 flex-1"
        />
        <Button
          type="submit"
          variant="outline"
          disabled={loading}
          className="h-11 shrink-0 transition-transform active:scale-[0.99]"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <CircleNotch className="size-4 animate-spin" weight="bold" aria-hidden="true" />
              {authCopy.common.submittingText}
            </span>
          ) : (
            authCopy.magicLink.buttonLabel
          )}
        </Button>
      </form>
      {error ? (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
