import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

import { timestamps } from './_helpers';

export const supportRequestStatusValues = ['open', 'in_progress', 'resolved', 'closed'] as const;

export const supportRequests = pgTable(
  'support_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    status: text('status', { enum: supportRequestStatusValues }).default('open').notNull(),
    ...timestamps,
  },
  (table) => [index('support_requests_user_id_idx').on(table.userId)],
);

export const supportRequestsRelations = relations(supportRequests, ({ one }) => ({
  user: one(users, { fields: [supportRequests.userId], references: [users.id] }),
}));
