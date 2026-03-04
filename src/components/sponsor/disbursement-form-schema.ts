import { z } from 'zod';

import { sponsorCopy } from '@/config/copy/sponsor';

const disbursementValidationCopy = sponsorCopy.disbursements.form.validation;

const MIN_DISBURSEMENT_KOBO = 100_000;
const MAX_DISBURSEMENT_KOBO = 50_000_000_000;

export const disbursementScheduleOptions = ['now', 'later'] as const;

function parseWholeNaira(value: string): number | null {
  const normalized = value.trim().replaceAll(',', '');
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const naira = Number.parseInt(normalized, 10);
  return Number.isSafeInteger(naira) ? naira : null;
}

export function parseNairaInputToKobo(value: string): number | null {
  const wholeNaira = parseWholeNaira(value);
  if (wholeNaira === null) {
    return null;
  }

  return wholeNaira * 100;
}

export const newDisbursementFormSchema = z
  .object({
    sponsorshipId: z.string().uuid(disbursementValidationCopy.studentRequired),
    amountNaira: z.string().trim().min(1, disbursementValidationCopy.amountRequired),
    note: z.string().trim().max(160, disbursementValidationCopy.noteTooLong).optional(),
    scheduleType: z.enum(disbursementScheduleOptions),
    scheduledAt: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const amountKobo = parseNairaInputToKobo(values.amountNaira);
    if (amountKobo === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amountNaira'],
        message: disbursementValidationCopy.amountInvalid,
      });
      return;
    }

    if (amountKobo < MIN_DISBURSEMENT_KOBO) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amountNaira'],
        message: disbursementValidationCopy.amountTooLow,
      });
    }

    if (amountKobo > MAX_DISBURSEMENT_KOBO) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amountNaira'],
        message: disbursementValidationCopy.amountTooHigh,
      });
    }

    if (values.scheduleType !== 'later') {
      return;
    }

    if (!values.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledAt'],
        message: disbursementValidationCopy.scheduleRequired,
      });
      return;
    }

    const scheduledDate = new Date(values.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledAt'],
        message: disbursementValidationCopy.scheduleInPast,
      });
    }
  });

export type NewDisbursementFormValues = z.infer<typeof newDisbursementFormSchema>;

export function toCreateDisbursementInput(values: NewDisbursementFormValues) {
  const amountKobo = parseNairaInputToKobo(values.amountNaira);
  if (amountKobo === null) {
    throw new Error(disbursementValidationCopy.amountInvalid);
  }

  return {
    sponsorshipId: values.sponsorshipId,
    amountKobo,
    note: values.note?.trim() ? values.note.trim() : undefined,
    scheduledAt: values.scheduleType === 'later' ? values.scheduledAt : undefined,
  };
}

export const disbursementFormLimits = {
  minKobo: MIN_DISBURSEMENT_KOBO,
  maxKobo: MAX_DISBURSEMENT_KOBO,
} as const;
