import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

/** User consent records — terms, privacy, marketing. NDPR/GDPR compliance. */
export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type', { enum: ['terms', 'privacy', 'marketing'] }).notNull(),
  version: text('version').notNull(),
  acceptedAt: timestamp('accepted_at').defaultNow().notNull(),
});

export const consentsRelations = relations(consents, ({ one }) => ({
  user: one(users, {
    fields: [consents.userId],
    references: [users.id],
  }),
}));
