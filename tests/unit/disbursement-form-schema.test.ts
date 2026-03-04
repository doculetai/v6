import { describe, expect, it } from 'vitest';

import { sponsorCopy } from '@/config/copy/sponsor';
import {
  newDisbursementFormSchema,
  parseNairaInputToKobo,
  toCreateDisbursementInput,
} from '@/components/sponsor/disbursement-form-schema';
import { newDisbursementFormFixture } from '../fixtures/sponsor-disbursements';

describe('newDisbursementFormSchema', () => {
  it('parses valid disbursement form input', () => {
    const parsed = newDisbursementFormSchema.safeParse(newDisbursementFormFixture);

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      return;
    }

    const payload = toCreateDisbursementInput(parsed.data);

    expect(payload.amountKobo).toBe(200_000_000);
    expect(payload.sponsorshipId).toBe(newDisbursementFormFixture.sponsorshipId);
    expect(payload.note).toBe(newDisbursementFormFixture.note);
    expect(payload.scheduledAt).toBe(newDisbursementFormFixture.scheduledAt);
  });

  it('rejects invalid amount format', () => {
    const parsed = newDisbursementFormSchema.safeParse({
      ...newDisbursementFormFixture,
      amountNaira: '12.50',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    expect(parsed.error.issues[0]?.message).toBe(
      sponsorCopy.disbursements.form.validation.amountInvalid,
    );
  });

  it('requires scheduled date when schedule type is later', () => {
    const parsed = newDisbursementFormSchema.safeParse({
      ...newDisbursementFormFixture,
      scheduledAt: '',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    expect(parsed.error.issues[0]?.message).toBe(
      sponsorCopy.disbursements.form.validation.scheduleRequired,
    );
  });

  it('rejects scheduled date in the past', () => {
    const parsed = newDisbursementFormSchema.safeParse({
      ...newDisbursementFormFixture,
      scheduledAt: '2000-01-01T10:00',
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    expect(parsed.error.issues[0]?.message).toBe(
      sponsorCopy.disbursements.form.validation.scheduleInPast,
    );
  });

  it('converts naira string to kobo safely', () => {
    expect(parseNairaInputToKobo('1,500,000')).toBe(150_000_000);
    expect(parseNairaInputToKobo('abc')).toBeNull();
  });
});
