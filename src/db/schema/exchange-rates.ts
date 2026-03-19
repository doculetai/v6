import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';

export const exchangeRates = pgTable(
  'exchange_rates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    baseCurrency: text('base_currency').notNull(),
    targetCurrency: text('target_currency').notNull(),
    /** Rate as integer: multiply by 100 for 2-decimal precision. E.g., 158950 = 1589.50 */
    rateX100: integer('rate_x100').notNull(),
    source: text('source').notNull(),
    fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
    ...timestamps,
  },
  (t) => [
    index('exchange_rates_pair_idx').on(t.baseCurrency, t.targetCurrency),
    index('exchange_rates_fetched_at_idx').on(t.fetchedAt),
  ],
);
