import { describe, expect, it } from 'vitest';

import { computeSponsorKycState } from '@/db/queries/sponsor-kyc';

import { sponsorKycFixtures } from '../fixtures/sponsor-kyc';

describe('computeSponsorKycState', () => {
  it('keeps a new sponsor in draft on tier 1', () => {
    const result = computeSponsorKycState(sponsorKycFixtures.draft);

    expect(result.tier).toBe(1);
    expect(result.currentStep).toBe(1);
    expect(result.kycStatus).toBe('draft');
  });

  it('moves to source-of-funds step after identity submission', () => {
    const result = computeSponsorKycState(sponsorKycFixtures.identitySubmitted);

    expect(result.identityComplete).toBe(true);
    expect(result.currentStep).toBe(2);
    expect(result.tier).toBe(1);
    expect(result.kycStatus).toBe('submitted');
  });

  it('promotes individual sponsor to tier 3 review when identity, source, and bank are complete', () => {
    const result = computeSponsorKycState(sponsorKycFixtures.individualReadyForReview);

    expect(result.tier).toBe(3);
    expect(result.currentStep).toBe(4);
    expect(result.kycStatus).toBe('under_review');
  });

  it('holds corporate sponsor at tier 2 until corporate details are complete', () => {
    const result = computeSponsorKycState(sponsorKycFixtures.corporateMissingDetails);

    expect(result.corporateRequired).toBe(true);
    expect(result.corporateComplete).toBe(false);
    expect(result.tier).toBe(2);
    expect(result.currentStep).toBe(4);
    expect(result.kycStatus).toBe('submitted');
  });

  it('flags action required and PDF fallback after mono failure', () => {
    const result = computeSponsorKycState(sponsorKycFixtures.monoFailed);

    expect(result.shouldOfferPdfFallback).toBe(true);
    expect(result.kycStatus).toBe('action_required');
  });
});
