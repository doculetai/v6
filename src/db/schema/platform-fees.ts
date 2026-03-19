import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { disbursements } from './sponsorships';

/** Platform fee config: fixed or percentage per disbursement */
export const platformFeeConfig = pgTable('platform_fee_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  feeType: text('fee_type', { enum: ['percentage', 'fixed'] }).notNull(),
  valueKobo: integer('value_kobo').notNull(), // basis points (1/10000) if percentage, or kobo if fixed
  currency: text('currency').notNull(),
  effectiveFrom: timestamp('effective_from').defaultNow().notNull(),
  effectiveTo: timestamp('effective_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/** Fee record per disbursement (denormalized for audit) */
export const disbursementFees = pgTable('disbursement_fees', {
  id: uuid('id').primaryKey().defaultRandom(),
  disbursementId: uuid('disbursement_id')
    .references(() => disbursements.id, { onDelete: 'cascade' })
    .notNull(),
  amountKobo: integer('amount_kobo').notNull(),
  currency: text('currency').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
