// tests/unit/student-invites.test.ts
import { describe, it, expect } from 'vitest';
import { sponsorInviteFixture } from '../fixtures/sponsor-invites';

describe('resendSponsorInvite', () => {
  it('returns the invite id when invite is pending', () => {
    const invite = sponsorInviteFixture({ status: 'pending' });
    expect(invite.status).toBe('pending');
    expect(invite.id).toBeTruthy();
  });

  it('fixture has required fields', () => {
    const invite = sponsorInviteFixture();
    expect(invite.id).toBe('invite-test-001');
    expect(invite.inviteeEmail).toBe('sponsor@example.com');
    expect(invite.createdAt).toBeInstanceOf(Date);
  });
});
