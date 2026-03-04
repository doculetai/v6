'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, UserRoundPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authCopy, type AuthRoleKey } from '@/config/copy/auth';
import { supabaseBrowserClient } from '@/lib/auth/browser-client';
import { cn } from '@/lib/utils';
import { browserTrpcClient } from '@/trpc/client';

const signupRoleSchema = z.enum(['student', 'sponsor', 'university', 'agent', 'partner']);

const signupSchema = z
  .object({
    email: z.string().email(authCopy.validation.invalidEmail),
    password: z.string().min(8, authCopy.validation.passwordMin),
    confirmPassword: z.string().min(8, authCopy.validation.passwordMin),
    role: signupRoleSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: authCopy.validation.passwordsDoNotMatch,
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

type SignupRole = z.infer<typeof signupRoleSchema>;

const signupRoleOptions: SignupRole[] = signupRoleSchema.options;

export function SignupPageClient() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const { data, error } = await supabaseBrowserClient.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setSubmitError(error.message || authCopy.signup.genericError);
      return;
    }

    if (!data.user?.id) {
      setSubmitError(authCopy.signup.genericError);
      return;
    }

    try {
      await browserTrpcClient.student.createProfile.mutate({
        userId: data.user.id,
        role: values.role,
      });
      setConfirmationEmail(values.email);
    } catch {
      setSubmitError(authCopy.signup.genericError);
    }
  });

  if (confirmationEmail) {
    return (
      <Card className="border-border/70 bg-card/95 text-card-foreground shadow-xl dark:border-border">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto inline-flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary dark:bg-primary/25">
            <CheckCircle2 className="size-4" aria-hidden="true" />
          </div>
          <h1 className="leading-none font-semibold text-2xl tracking-tight text-card-foreground">
            {authCopy.signup.successTitle}
          </h1>
          <CardDescription className="text-sm text-muted-foreground">
            {authCopy.signup.successDescription}
          </CardDescription>
          <CardDescription className="font-medium text-foreground">
            {confirmationEmail}
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
            {authCopy.signup.links.login}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/95 text-card-foreground shadow-xl dark:border-border">
      <CardHeader className="space-y-3">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <UserRoundPlus className="size-4" aria-hidden="true" />
          <span className="text-sm">{authCopy.signup.trustLabel}</span>
        </div>
        <h1 className="leading-none font-semibold text-2xl tracking-tight text-card-foreground">
          {authCopy.signup.title}
        </h1>
        <CardDescription className="text-sm text-muted-foreground">
          {authCopy.signup.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="signup-email">{authCopy.common.emailLabel}</Label>
            <Input
              id="signup-email"
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

          <div className="space-y-2">
            <Label htmlFor="signup-password">{authCopy.common.passwordLabel}</Label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              placeholder={authCopy.common.passwordPlaceholder}
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password?.message ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password">{authCopy.common.confirmPasswordLabel}</Label>
            <Input
              id="signup-confirm-password"
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

          <div className="space-y-2">
            <Label htmlFor="signup-role">{authCopy.common.roleLabel}</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="signup-role"
                    className="h-11 w-full bg-background"
                    aria-invalid={Boolean(errors.role)}
                  >
                    <SelectValue placeholder={authCopy.common.roleLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {signupRoleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {authCopy.roleOptions[role as AuthRoleKey]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role?.message ? (
              <p className="text-sm text-destructive">{errors.role.message}</p>
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
              authCopy.signup.submitLabel
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {authCopy.signup.links.hasAccount}{' '}
            <Link
              href={authCopy.routes.login}
              className={cn(
                'inline-flex min-h-11 items-center px-1 font-medium text-primary underline-offset-4 transition-colors duration-150 hover:text-primary/80 hover:underline',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              {authCopy.signup.links.login}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
