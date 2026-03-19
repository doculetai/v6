import { relations } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { bankAccounts } from './students';
import { users } from './users';

export const balanceVerifications = pgTable(
  'balance_verifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    bankAccountId: uuid('bank_account_id')
      .references(() => bankAccounts.id, { onDelete: 'cascade' })
      .notNull(),
    verifiedAmountKobo: integer('verified_amount_kobo').notNull(),
    currency: text('currency').default('NGN').notNull(),
    method: text('method', { enum: ['mono', 'statement'] }).notNull(),
    verifiedAt: timestamp('verified_at').defaultNow().notNull(),
    ...timestamps,
  },
  (t) => [
    index('balance_verifications_user_idx').on(t.userId),
    index('balance_verifications_bank_account_idx').on(t.bankAccountId),
    index('balance_verifications_verified_at_idx').on(t.verifiedAt),
  ],
);

export const balanceVerificationsRelations = relations(balanceVerifications, ({ one }) => ({
  user: one(users, {
    fields: [balanceVerifications.userId],
    references: [users.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [balanceVerifications.bankAccountId],
    references: [bankAccounts.id],
  }),
}));
