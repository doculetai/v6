import type { disbursements, sponsorProfiles, sponsorships } from '@/db/schema';

const now = new Date('2026-03-04T10:00:00.000Z');

export const sponsorProfileFixture: typeof sponsorProfiles.$inferSelect = {
  id: 'd5f6f250-6708-4f31-b8d5-f08b4ed21520',
  userId: '88d20543-f99a-4ddb-ae03-e27e0be917f5',
  sponsorType: 'individual',
  kycStatus: 'verified',
  companyName: null,
  createdAt: now,
  updatedAt: now,
};

export const sponsorshipFixture: typeof sponsorships.$inferSelect = {
  id: '2d8da22e-6086-4c97-b0d8-266b30777d19',
  studentId: '4a95822f-6c2d-4a8f-bde9-2ec3a2f08145',
  sponsorId: sponsorProfileFixture.userId,
  status: 'active',
  amountKobo: 450_000_000,
  currency: 'NGN',
  createdAt: now,
  updatedAt: now,
};

export const disbursementFixture: typeof disbursements.$inferSelect = {
  id: '07db8f37-6414-4ca1-a4a8-e99670708d13',
  sponsorshipId: sponsorshipFixture.id,
  amountKobo: 125_000_000,
  scheduledAt: new Date('2026-03-20T10:00:00.000Z'),
  disbursedAt: new Date('2026-03-22T10:00:00.000Z'),
  status: 'disbursed',
  paystackReference: 'PST_ref_20260322',
  createdAt: now,
  updatedAt: now,
};
