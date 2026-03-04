/**
 * Typed test fixtures for partner API keys.
 * Matches the shape returned by partner.listApiKeys tRPC procedure.
 */

export type ApiKeyFixture = {
  id: string;
  name: string;
  environment: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export const apiKeyFixtures = {
  activeProductionKey: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Production key',
    environment: 'production',
    keyPrefix: 'dlk_live_abc1234',
    scopes: ['verifications:read', 'certificates:read'],
    lastUsedAt: '2026-03-01T10:00:00.000Z',
    revokedAt: null,
    createdAt: '2026-01-15T09:00:00.000Z',
  } satisfies ApiKeyFixture,

  activeSandboxKey: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Sandbox key',
    environment: 'sandbox',
    keyPrefix: 'dlk_test_xyz9876',
    scopes: ['verifications:read'],
    lastUsedAt: null,
    revokedAt: null,
    createdAt: '2026-02-10T14:30:00.000Z',
  } satisfies ApiKeyFixture,

  revokedKey: {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Old integration key',
    environment: 'production',
    keyPrefix: 'dlk_live_def5678',
    scopes: ['verifications:read', 'certificates:read', 'students:read'],
    lastUsedAt: '2026-02-28T18:00:00.000Z',
    revokedAt: '2026-03-01T08:00:00.000Z',
    createdAt: '2025-12-01T11:00:00.000Z',
  } satisfies ApiKeyFixture,

  allScopesKey: {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Full access key',
    environment: 'production',
    keyPrefix: 'dlk_live_ghi2345',
    scopes: ['verifications:read', 'certificates:read', 'webhooks:write', 'students:read'],
    lastUsedAt: '2026-03-04T07:15:00.000Z',
    revokedAt: null,
    createdAt: '2026-03-01T09:00:00.000Z',
  } satisfies ApiKeyFixture,
} as const;

/** Convenience list of all fixtures */
export const allApiKeyFixtures: ApiKeyFixture[] = Object.values(apiKeyFixtures);

/** Only active (non-revoked) keys */
export const activeApiKeyFixtures: ApiKeyFixture[] = allApiKeyFixtures.filter(
  (k) => k.revokedAt === null,
);
