import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type', {
    enum: ['passport', 'bank_statement', 'offer_letter', 'affidavit', 'cac'],
  }).notNull(),
  storageUrl: text('storage_url').notNull(),
  status: text('status', {
    enum: ['pending', 'approved', 'rejected', 'more_info_requested'],
  })
    .default('pending')
    .notNull(),
  rejectionReason: text('rejection_reason'),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
    relationName: 'documentUser',
  }),
  reviewer: one(users, {
    fields: [documents.reviewedBy],
    references: [users.id],
    relationName: 'documentReviewer',
  }),
}));
