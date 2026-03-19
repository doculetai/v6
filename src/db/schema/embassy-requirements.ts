import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';

export const embassyRequirements = pgTable('embassy_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  country: text('country').notNull(),
  visaType: text('visa_type').notNull(),
  /** Minimum funds required in USD (kobo-like: multiply by 100) */
  minFundsUsdX100: integer('min_funds_usd_x100'),
  /** Minimum consecutive days the balance must be held */
  minBalanceDays: integer('min_balance_days'),
  /** JSON array of required document types */
  requiredDocs: jsonb('required_docs'),
  notes: text('notes'),
  ...timestamps,
});
