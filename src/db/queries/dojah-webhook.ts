import { and, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { kycVerifications, studentProfiles } from '@/db/schema';

export async function processDojahWebhook(
  db: DrizzleDB,
  referenceId: string,
  status: 'verified' | 'failed',
): Promise<void> {
  await db.transaction(async (tx) => {
    const [record] = await tx
      .select()
      .from(kycVerifications)
      .where(eq(kycVerifications.referenceId, referenceId))
      .limit(1);

    if (!record) return; // unknown reference — ignore
    if (record.status !== 'pending') return; // already processed

    // Atomic guard: only update if still pending (prevents TOCTOU race)
    const updated = await tx
      .update(kycVerifications)
      .set({
        status,
        verifiedAt: status === 'verified' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(kycVerifications.id, record.id),
          eq(kycVerifications.status, 'pending'),
        ),
      )
      .returning({ id: kycVerifications.id });

    if (updated.length === 0) return; // another concurrent request won the race

    // Sync student profile kycStatus
    await tx
      .update(studentProfiles)
      .set({
        kycStatus: status === 'verified' ? 'verified' : 'failed',
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.userId, record.userId));
  });
}
