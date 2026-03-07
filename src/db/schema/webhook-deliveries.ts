import { relations } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { partnerProfiles } from './partner';

export const partnerWebhookConfigs = pgTable(
  'partner_webhook_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .references(() => partnerProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    url: text('url').notNull(),
    secretHash: text('secret_hash').notNull(),
    events: text('events').array().notNull(),
    description: text('description'),
    enabled: boolean('enabled').default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    partnerIdx: index('partner_webhook_configs_partner_id_idx').on(table.partnerId),
  }),
);

export const partnerWebhookConfigsRelations = relations(partnerWebhookConfigs, ({ one }) => ({
  partner: one(partnerProfiles, {
    fields: [partnerWebhookConfigs.partnerId],
    references: [partnerProfiles.id],
  }),
}));

export const webhookDeliveries = pgTable(
  'webhook_deliveries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .references(() => partnerProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    eventType: text('event_type').notNull(),
    entityId: text('entity_id'),
    payloadHash: text('payload_hash').notNull(),
    payloadJson: jsonb('payload_json'),
    url: text('url').notNull(),
    status: text('status', {
      enum: ['pending', 'delivered', 'failed'],
    })
      .default('pending')
      .notNull(),
    attempts: integer('attempts').default(0).notNull(),
    lastAttemptAt: timestamp('last_attempt_at'),
    responseStatus: integer('response_status'),
    ...timestamps,
  },
  (table) => ({
    partnerIdx: index('webhook_deliveries_partner_id_idx').on(table.partnerId),
    statusIdx: index('webhook_deliveries_status_idx').on(table.status),
    createdAtIdx: index('webhook_deliveries_created_at_idx').on(table.createdAt),
  }),
);
