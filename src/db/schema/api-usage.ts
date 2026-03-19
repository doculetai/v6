import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { partnerApiKeys } from './partner';
import { partnerProfiles } from './partner';

/** Partner API usage for rate limiting (counts per key per endpoint per period) */
export const apiUsage = pgTable(
  'api_usage',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .references(() => partnerProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    keyId: uuid('key_id').references(() => partnerApiKeys.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    period: text('period').notNull(), // e.g. '2025-03-04' for daily, '2025-W10' for weekly
    requestCount: integer('request_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    partnerPeriodIdx: index('api_usage_partner_period_idx').on(table.partnerId, table.period),
    keyPeriodIdx: index('api_usage_key_period_idx').on(table.keyId, table.endpoint, table.period),
    uniquePartnerKeyEndpointPeriod: uniqueIndex('api_usage_partner_key_endpoint_period_idx').on(
      table.partnerId,
      table.keyId,
      table.endpoint,
      table.period,
    ),
  }),
);
