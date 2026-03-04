import { describe, expect, it } from 'vitest';

import {
  canTransitionInvitationStatus,
  isPendingInviteConflictError,
  normalizeEmail,
} from '@/db/queries/sponsor-invitations';

import { sponsorInvitationFixture } from '../fixtures/sponsor-invitations';

describe('sponsor invitation helpers', () => {
  it('normalizes invitee email for case-insensitive matching', () => {
    expect(normalizeEmail('  Sponsor+Alias@Example.com  ')).toBe('sponsor+alias@example.com');
  });

  it('allows status transitions from pending to accepted, declined, or cancelled', () => {
    expect(canTransitionInvitationStatus('pending', 'accepted')).toBe(true);
    expect(canTransitionInvitationStatus('pending', 'declined')).toBe(true);
    expect(canTransitionInvitationStatus('pending', 'cancelled')).toBe(true);
  });

  it('blocks transitions from terminal statuses', () => {
    expect(canTransitionInvitationStatus('accepted', 'declined')).toBe(false);
    expect(canTransitionInvitationStatus('declined', 'accepted')).toBe(false);
    expect(canTransitionInvitationStatus('cancelled', 'pending')).toBe(false);
  });

  it('keeps fixture status at pending for initial invitation rows', () => {
    expect(sponsorInvitationFixture.status).toBe('pending');
    expect(sponsorInvitationFixture.respondedAt).toBeNull();
  });

  it('detects unique-constraint conflict for pending invites', () => {
    expect(
      isPendingInviteConflictError({
        code: '23505',
        constraint_name: 'sponsorship_invites_pending_unique_idx',
      }),
    ).toBe(true);

    expect(
      isPendingInviteConflictError({
        code: '23505',
        constraint_name: 'some_other_constraint',
      }),
    ).toBe(false);
  });
});
