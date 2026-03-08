import { and, eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { disbursements } from '@/db/schema';

const DOCULET_PREFIX = 'DOCULET-';

export type DisbursementRecord = {
  id: string;
  sponsorshipId: string;
  amountKobo: number;
  disbursedAt: Date | null;
};

export async function processPaystackWebhook(
  db: DrizzleDB,
  reference: string,
  event: 'transfer.success' | 'transfer.failed' | 'transfer.reversed',
): Promise<DisbursementRecord | null> {
  const newStatus = event === 'transfer.success' ? 'disbursed' : 'failed';
  const disbursedAt = event === 'transfer.success' ? new Date() : null;

  const [record] = await db
    .select()
    .from(disbursements)
    .where(
      reference.startsWith(DOCULET_PREFIX)
        ? eq(disbursements.id, reference.slice(DOCULET_PREFIX.length))
        : eq(disbursements.paystackReference, reference),
    )
    .limit(1);

  if (!record) return null;
  if (record.status === 'disbursed') return null;

  await db
    .update(disbursements)
    .set({
      status: newStatus,
      disbursedAt,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(disbursements.id, record.id),
        eq(disbursements.status, 'processing'),
      ),
    );

  return event === 'transfer.success' && disbursedAt
    ? {
        id: record.id,
        sponsorshipId: record.sponsorshipId,
        amountKobo: record.amountKobo,
        disbursedAt,
      }
    : null;
}
