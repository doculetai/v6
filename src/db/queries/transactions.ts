import type { DrizzleDB } from '@/db';
import { transactions } from '@/db/schema';

export type TransactionType =
  | 'disbursement'
  | 'platform_fee'
  | 'refund'
  | 'reversal'
  | 'credit'
  | 'debit';

export async function insertTransaction(
  db: DrizzleDB,
  params: {
    type: TransactionType;
    entityType: string;
    entityId: string | null;
    amountKobo: number;
    currency: string;
    userId?: string | null;
    meta?: string | null;
  },
): Promise<void> {
  await db.insert(transactions).values({
    type: params.type,
    entityType: params.entityType,
    entityId: params.entityId,
    amountKobo: params.amountKobo,
    currency: params.currency,
    userId: params.userId ?? null,
    meta: params.meta ?? null,
  });
}
