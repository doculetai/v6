import { and, desc, eq, gte, lte } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { transactions } from '@/db/schema';

const transactionTypeValues = ['disbursement', 'platform_fee', 'refund', 'reversal', 'credit', 'debit'] as const;
export type TransactionType = (typeof transactionTypeValues)[number];

export type TransactionRow = {
  id: string;
  type: TransactionType;
  entityType: string;
  entityId: string | null;
  amountKobo: number;
  currency: string;
  userId: string | null;
  meta: string | null;
  createdAt: Date;
};

export type ListTransactionsParams = {
  type?: TransactionType;
  entityType?: string;
  entityId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
};

export async function listTransactions(
  db: DrizzleDB,
  params: ListTransactionsParams = {},
): Promise<TransactionRow[]> {
  const { type, entityType, entityId, userId, dateFrom, dateTo, limit = 50, offset = 0 } = params;

  const conditions = [];
  if (type) conditions.push(eq(transactions.type, type));
  if (entityType) conditions.push(eq(transactions.entityType, entityType));
  if (entityId) conditions.push(eq(transactions.entityId, entityId));
  if (userId) conditions.push(eq(transactions.userId, userId));
  if (dateFrom) conditions.push(gte(transactions.createdAt, dateFrom));
  if (dateTo) conditions.push(lte(transactions.createdAt, dateTo));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(transactions)
    .where(whereClause)
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    entityType: r.entityType,
    entityId: r.entityId,
    amountKobo: r.amountKobo,
    currency: r.currency,
    userId: r.userId,
    meta: r.meta,
    createdAt: r.createdAt,
  }));
}
