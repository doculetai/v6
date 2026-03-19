'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { UserPlus } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { agentCopy } from '@/config/copy/agent';
import { trpc } from '@/trpc/client';

const schema = z.object({ email: z.string().email('Enter a valid email address') });
type FormValues = z.infer<typeof schema>;

export function AgentInviteSheet() {
  const [open, setOpen] = useState(false);
  const sheetCopy = agentCopy.inviteSheet;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = trpc.agent.inviteStudent.useMutation({
    onSuccess: () => {
      reset();
      setOpen(false);
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate({ email: values.email });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="default" className="min-h-11 gap-2">
          <UserPlus className="size-4" weight="duotone" aria-hidden="true" />
          {sheetCopy.trigger}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl pb-safe-or-6">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>{sheetCopy.heading}</SheetTitle>
          <p className="text-sm text-muted-foreground">{sheetCopy.description}</p>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">{sheetCopy.emailLabel}</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder={sheetCopy.emailPlaceholder}
              autoComplete="email"
              aria-invalid={errors.email != null}
              aria-describedby={errors.email ? 'invite-email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="invite-email-error" className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {mutation.error && (
            <p className="text-xs text-destructive" role="alert">
              {agentCopy.errors.generic}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              className="flex-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? sheetCopy.submitting : sheetCopy.submitCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              {sheetCopy.cancelCta}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
