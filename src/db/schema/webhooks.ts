import { relations } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: text('event_id').notNull().unique(),
  provider: text('provider', { enum: ['paystack', 'mono', 'dojah'] }).notNull(),
  eventType: text('event_type').notNull(),
  payloadJson: jsonb('payload_json').notNull(),
  processedAt: timestamp('processed_at'),
  status: text('status', { enum: ['received', 'processed', 'failed'] })
    .default('received')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const webhookEventsRelations = relations(webhookEvents, () => ({}));
