import type { DrizzleDB } from '@/db';

export async function getPartnerOverview(db: DrizzleDB, userId: string) {
  const profile = await db.query.partnerProfiles.findFirst({
    where: (t, { eq }) => eq(t.userId, userId),
    with: { apiKeys: true },
  });

  if (!profile) return null;

  const activeApiKeys = profile.apiKeys.filter((k) => !k.revokedAt).length;

  return {
    organizationName: profile.organizationName,
    activeApiKeys,
    // These metrics require future schema additions (API call logs, etc.)
    totalVerifications: 0,
    certificatesIssued: 0,
    apiCallsThisMonth: 0,
  };
}
