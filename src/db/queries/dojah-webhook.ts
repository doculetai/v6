import { eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { kycVerifications, studentProfiles } from '@/db/schema';

export async function processDojahWebhook(
  db: DrizzleDB,
  referenceId: string,
  status: 'verified' | 'failed',
): Promise<void> {
  const [record] = await db
    .select()
    .from(kycVerifications)
    .where(eq(kycVerifications.referenceId, referenceId))
    .limit(1);

  if (!record) return; // idempotent — unknown reference, ignore

  if (record.status !== 'pending') return; // already processed

  await db
    .update(kycVerifications)
    .set({
      status,
      verifiedAt: status === 'verified' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(kycVerifications.id, record.id));

  // Sync student profile kycStatus
  await db
    .update(studentProfiles)
    .set({
      kycStatus: status === 'verified' ? 'verified' : 'failed',
      updatedAt: new Date(),
    })
    .where(eq(studentProfiles.userId, record.userId));
}
