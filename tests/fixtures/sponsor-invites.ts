// tests/fixtures/sponsor-invites.ts
export function sponsorInviteFixture(overrides: Partial<{
  id: string;
  studentId: string;
  inviteeEmail: string;
  inviteeEmailNormalized: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string | null;
  respondedByUserId: string | null;
  respondedAt: Date | null;
  cancelledAt: Date | null;
  lastEmailSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: overrides.id ?? 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    studentId: overrides.studentId ?? 'b1ffcd00-0d1c-5f09-cc7e-7cc0ce491b22',
    inviteeEmail: overrides.inviteeEmail ?? 'sponsor@example.com',
    inviteeEmailNormalized: overrides.inviteeEmailNormalized ?? 'sponsor@example.com',
    status: overrides.status ?? 'pending',
    message: overrides.message !== undefined ? overrides.message : null,
    respondedByUserId: overrides.respondedByUserId !== undefined ? overrides.respondedByUserId : null,
    respondedAt: overrides.respondedAt !== undefined ? overrides.respondedAt : null,
    cancelledAt: overrides.cancelledAt !== undefined ? overrides.cancelledAt : null,
    lastEmailSentAt: overrides.lastEmailSentAt !== undefined ? overrides.lastEmailSentAt : null,
    createdAt: overrides.createdAt ?? new Date('2026-03-01'),
    updatedAt: overrides.updatedAt ?? new Date('2026-03-01'),
  };
}
