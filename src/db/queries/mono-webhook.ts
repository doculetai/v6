import { eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { bankAccounts, studentProfiles } from '@/db/schema';

export type MonoWebhookEvent =
  | 'account.connected'
  | 'account.disconnected'
  | 'account.reauthorization_required';

type MonoWebhookData = {
  id: string; // mono account id
};

/** Idempotently process Mono webhook. Updates student_profiles.bankStatus for known accounts. */
export async function processMonoWebhook(
  db: DrizzleDB,
  event: MonoWebhookEvent,
  data: MonoWebhookData,
): Promise<boolean> {
  const monoAccountId = data.id;
  if (!monoAccountId || typeof monoAccountId !== 'string') return false;

  const [existing] = await db
    .select({ userId: bankAccounts.userId })
    .from(bankAccounts)
    .where(eq(bankAccounts.monoAccountId, monoAccountId))
    .limit(1);

  if (!existing) return true;

  if (event === 'account.connected') {
    await db
      .update(studentProfiles)
      .set({ bankStatus: 'verified', updatedAt: new Date() })
      .where(eq(studentProfiles.userId, existing.userId));
    return true;
  }

  if (event === 'account.disconnected' || event === 'account.reauthorization_required') {
    const newStatus = event === 'account.disconnected' ? 'failed' : 'pending';
    await db
      .update(studentProfiles)
      .set({ bankStatus: newStatus, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, existing.userId));
    return true;
  }

  return false;
}
