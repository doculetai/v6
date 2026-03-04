import {
  corporateSponsorProfileFixture,
  individualSponsorProfileFixture,
} from '../fixtures/sponsor-settings';
import { sponsorProfileInputSchema } from '@/server/routers/sponsor.schemas';
import { describe, expect, it } from 'vitest';

describe('sponsorProfileInputSchema', () => {
  it('accepts a valid individual sponsor profile with +234 phone format', () => {
    const parsed = sponsorProfileInputSchema.safeParse(individualSponsorProfileFixture);

    expect(parsed.success).toBe(true);
  });

  it('rejects phone numbers that are not in +234 format', () => {
    const parsed = sponsorProfileInputSchema.safeParse({
      ...individualSponsorProfileFixture,
      phoneNumber: '08012345678',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toEqual(['phoneNumber']);
    }
  });

  it('requires CAC and director BVN for corporate sponsors', () => {
    const parsed = sponsorProfileInputSchema.safeParse({
      ...corporateSponsorProfileFixture,
      companyName: '',
      cacNumber: '',
      directorBvn: '',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issuePaths = parsed.error.issues.map((issue) => issue.path.join('.'));
      expect(issuePaths).toContain('companyName');
      expect(issuePaths).toContain('cacNumber');
      expect(issuePaths).toContain('directorBvn');
    }
  });

  it('accepts a complete corporate sponsor profile', () => {
    const parsed = sponsorProfileInputSchema.safeParse(corporateSponsorProfileFixture);

    expect(parsed.success).toBe(true);
  });
});
