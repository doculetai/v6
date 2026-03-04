'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, LoaderCircle, ShieldCheck, Wallet } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { sponsorCopy } from '@/config/copy/sponsor';
import { cn } from '@/lib/utils';

import {
  newDisbursementFormSchema,
  type NewDisbursementFormValues,
  toCreateDisbursementInput,
} from './disbursement-form-schema';
import type { SponsorDisbursementStudent } from './disbursement-types';

export type CreateDisbursementInput = ReturnType<typeof toCreateDisbursementInput>;

type NewDisbursementFormProps = {
  students: SponsorDisbursementStudent[];
  isSubmitting?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  submitError?: string | null;
  submitSuccess?: string | null;
  onSubmit: (payload: CreateDisbursementInput) => Promise<void>;
};

const formCopy = sponsorCopy.disbursements.form;

const defaultFormValues: NewDisbursementFormValues = {
  sponsorshipId: '',
  amountNaira: '',
  note: '',
  scheduleType: 'now',
  scheduledAt: '',
};

export function NewDisbursementForm({
  students,
  isSubmitting = false,
  disabled = false,
  disabledMessage,
  submitError,
  submitSuccess,
  onSubmit,
}: NewDisbursementFormProps) {
  const {
    control,
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<NewDisbursementFormValues>({
    resolver: zodResolver(newDisbursementFormSchema),
    defaultValues: defaultFormValues,
  });

  const scheduleType = watch('scheduleType');
  const showScheduledAt = scheduleType === 'later';
  const formDisabled = disabled || isSubmitting;

  const submitHandler = handleSubmit(async (values) => {
    const payload = toCreateDisbursementInput(values);
    await onSubmit(payload);
    reset(defaultFormValues);
  });

  return (
    <SurfacePanel variant="glass" density="comfortable" className="space-y-4">
      <header className="space-y-2">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
          <Wallet className="size-5 text-primary" aria-hidden="true" />
          {formCopy.title}
        </h2>
        <p className="text-sm text-muted-foreground">{formCopy.description}</p>
      </header>

      <form className="space-y-4" onSubmit={submitHandler} noValidate>
        <div className="space-y-2">
          <Label htmlFor="disbursement-student">{formCopy.fields.student}</Label>
          <Controller
            name="sponsorshipId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={formDisabled}>
                <SelectTrigger
                  id="disbursement-student"
                  className="h-11 w-full"
                  aria-invalid={Boolean(errors.sponsorshipId)}
                >
                  <SelectValue placeholder={formCopy.placeholders.student} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.sponsorshipId} value={student.sponsorshipId}>
                      {student.studentDisplayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.sponsorshipId?.message ? (
            <p className="text-sm text-destructive">{errors.sponsorshipId.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="disbursement-amount">{formCopy.fields.amount}</Label>
          <Input
            id="disbursement-amount"
            placeholder={formCopy.placeholders.amount}
            className="h-11 bg-background"
            inputMode="numeric"
            aria-invalid={Boolean(errors.amountNaira)}
            disabled={formDisabled}
            {...register('amountNaira')}
          />
          {errors.amountNaira?.message ? (
            <p className="text-sm text-destructive">{errors.amountNaira.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="disbursement-note">{formCopy.fields.note}</Label>
          <textarea
            id="disbursement-note"
            placeholder={formCopy.placeholders.note}
            className={cn(
              'min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground',
              'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            )}
            aria-invalid={Boolean(errors.note)}
            maxLength={160}
            disabled={formDisabled}
            {...register('note')}
          />
          {errors.note?.message ? (
            <p className="text-sm text-destructive">{errors.note.message}</p>
          ) : null}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">{formCopy.fields.schedule}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                value="now"
                className="peer sr-only"
                disabled={formDisabled}
                {...register('scheduleType')}
              />
              <span className="flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors duration-150 peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                {formCopy.fields.scheduleNow}
              </span>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                value="later"
                className="peer sr-only"
                disabled={formDisabled}
                {...register('scheduleType')}
              />
              <span className="flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors duration-150 peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                {formCopy.fields.scheduleLater}
              </span>
            </label>
          </div>
        </fieldset>

        {showScheduledAt ? (
          <div className="space-y-2">
            <Label htmlFor="disbursement-scheduled-at">{formCopy.fields.scheduleDateTime}</Label>
            <div className="relative">
              <CalendarClock
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="disbursement-scheduled-at"
                type="datetime-local"
                className="h-11 bg-background pl-10"
                aria-invalid={Boolean(errors.scheduledAt)}
                disabled={formDisabled}
                {...register('scheduledAt')}
              />
            </div>
            {errors.scheduledAt?.message ? (
              <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>
            ) : null}
          </div>
        ) : null}

        {submitError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15">
            {submitError}
          </p>
        ) : null}

        {submitSuccess ? (
          <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:border-green-500/40 dark:bg-green-500/15 dark:text-green-300">
            {submitSuccess}
          </p>
        ) : null}

        <Button type="submit" className="h-11 w-full" disabled={formDisabled}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              {formCopy.actions.submitting}
            </span>
          ) : (
            formCopy.actions.submit
          )}
        </Button>

        {disabledMessage ? <p className="text-xs text-muted-foreground">{disabledMessage}</p> : null}

        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4" aria-hidden="true" />
          {sponsorCopy.disbursements.security.description}
        </p>
      </form>
    </SurfacePanel>
  );
}
