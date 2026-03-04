import type { sponsorshipInvites } from '@/db/schema';

export const sponsorInvitationFixture: typeof sponsorshipInvites.$inferSelect = {
  id: '11111111-1111-1111-1111-111111111111',
  studentId: '22222222-2222-2222-2222-222222222222',
  inviteeEmail: 'sponsor@example.com',
  inviteeEmailNormalized: 'sponsor@example.com',
  status: 'pending',
  message: 'Please sponsor my tuition.',
  respondedByUserId: null,
  respondedAt: null,
  cancelledAt: null,
  lastEmailSentAt: new Date('2026-01-15T10:00:00.000Z'),
  createdAt: new Date('2026-01-15T10:00:00.000Z'),
  updatedAt: new Date('2026-01-15T10:00:00.000Z'),
};
