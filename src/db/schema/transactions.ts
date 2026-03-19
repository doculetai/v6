import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

/** Ledger entries for money flow audit trail (disbursements, fees, credits, debits) */
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type', {
      enum: ['disbursement', 'platform_fee', 'refund', 'reversal', 'credit', 'debit'],
    }).notNull(),
    entityType: text('entity_type').notNull(), // 'disbursement' | 'sponsorship' | etc.
    entityId: text('entity_id'),
    amountKobo: integer('amount_kobo').notNull(),
    currency: text('currency').notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    meta: text('meta'), // JSON string for extensibility
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index('transactions_entity_idx').on(table.entityType, table.entityId),
    typeIdx: index('transactions_type_idx').on(table.type),
    userIdIdx: index('transactions_user_id_idx').on(table.userId),
    createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
  }),
);
