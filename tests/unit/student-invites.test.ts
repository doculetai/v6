import { describe, it, expect } from 'vitest';
import { sponsorInviteFixture } from '../fixtures/sponsor-invites';

describe('sponsorInviteFixture', () => {
  it('returns pending invite with valid UUID for resend scenario', () => {
    const invite = sponsorInviteFixture({ status: 'pending' });
    expect(invite.status).toBe('pending');
    expect(invite.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('returns non-pending invite for BAD_REQUEST scenario', () => {
    const invite = sponsorInviteFixture({ status: 'accepted' });
    expect(invite.status).toBe('accepted');
    expect(invite.status).not.toBe('pending');
  });
});
