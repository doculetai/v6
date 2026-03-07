// tests/fixtures/sponsor-invites.ts
export function sponsorInviteFixture(overrides: Partial<{
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  inviteeEmail: string;
  studentId: string;
}> = {}) {
  return {
    id: overrides.id ?? 'invite-test-001',
    status: overrides.status ?? 'pending',
    inviteeEmail: overrides.inviteeEmail ?? 'sponsor@example.com',
    studentId: overrides.studentId ?? 'student-test-001',
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
  };
}
