import type { partnerProfiles } from '@/db/schema';

export const partnerProfileFixture: typeof partnerProfiles.$inferSelect = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  organizationName: 'Lagos Scholars Hub',
  webhookUrl: 'https://lagoscholarshub.edu.ng/webhooks/doculet',
  brandLogoUrl: 'https://lagoscholarshub.edu.ng/logo.svg',
  brandColor: '#1a5276',
  createdAt: new Date('2026-01-10T09:00:00.000Z'),
  updatedAt: new Date('2026-02-20T14:30:00.000Z'),
};

export const partnerProfileNoBrandingFixture: typeof partnerProfiles.$inferSelect = {
  id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  userId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  organizationName: 'Afri-Scholar Connect',
  webhookUrl: null,
  brandLogoUrl: null,
  brandColor: null,
  createdAt: new Date('2026-03-01T08:00:00.000Z'),
  updatedAt: new Date('2026-03-01T08:00:00.000Z'),
};
