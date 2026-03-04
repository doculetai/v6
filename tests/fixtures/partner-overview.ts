import type { partnerApiKeys, partnerProfiles } from '@/db/schema';
import type { PartnerOverview } from '@/server/routers/partner';

type PartnerProfile = typeof partnerProfiles.$inferSelect;
type PartnerApiKey = typeof partnerApiKeys.$inferSelect;

export const partnerProfileFixture: PartnerProfile = {
  id: 'aaaaaaaa-0000-0000-0000-000000000001',
  userId: 'bbbbbbbb-0000-0000-0000-000000000001',
  organizationName: 'Acme University Portal',
  webhookUrl: 'https://acme.example.com/webhooks/doculet',
  brandLogoUrl: null,
  brandColor: null,
  createdAt: new Date('2025-09-01T10:00:00Z'),
  updatedAt: new Date('2025-09-01T10:00:00Z'),
};

export const partnerApiKeyFixtures: PartnerApiKey[] = [
  {
    id: 'cccccccc-0000-0000-0000-000000000001',
    partnerId: partnerProfileFixture.id,
    keyHash: 'hash_production_key',
    keyPrefix: 'dk_live_acme',
    scopes: ['verifications:read', 'certificates:read'],
    lastUsedAt: new Date('2025-12-20T08:30:00Z'),
    revokedAt: null,
    createdAt: new Date('2025-09-01T10:00:00Z'),
  },
  {
    id: 'cccccccc-0000-0000-0000-000000000002',
    partnerId: partnerProfileFixture.id,
    keyHash: 'hash_sandbox_key',
    keyPrefix: 'dk_test_acme',
    scopes: ['verifications:read'],
    lastUsedAt: null,
    revokedAt: new Date('2025-11-01T09:00:00Z'),
    createdAt: new Date('2025-09-01T10:00:00Z'),
  },
];

export const partnerOverviewFixture: PartnerOverview = {
  organizationName: partnerProfileFixture.organizationName,
  activeApiKeys: 1,
  totalVerifications: 0,
  certificatesIssued: 0,
  apiCallsThisMonth: 0,
};
