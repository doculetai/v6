import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

/** Conversation thread between a sponsor and a student. */
export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sponsorId: uuid('sponsor_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    studentId: uuid('student_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    ...timestamps,
  },
  (t) => [
    index('conversations_sponsor_id_idx').on(t.sponsorId),
    index('conversations_student_id_idx').on(t.studentId),
  ],
);

export const senderRoleValues = ['sponsor', 'student', 'admin'] as const;

/** Individual messages within a conversation. */
export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .references(() => conversations.id, { onDelete: 'cascade' })
      .notNull(),
    senderId: uuid('sender_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    senderRole: text('sender_role', { enum: senderRoleValues }).notNull(),
    body: text('body').notNull(),
    readAt: timestamp('read_at'),
    ...timestamps,
  },
  (t) => [
    index('messages_conversation_id_idx').on(t.conversationId),
    index('messages_sender_id_idx').on(t.senderId),
    index('messages_read_at_idx').on(t.readAt),
  ],
);

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  sponsor: one(users, {
    fields: [conversations.sponsorId],
    references: [users.id],
    relationName: 'conversationSponsor',
  }),
  student: one(users, {
    fields: [conversations.studentId],
    references: [users.id],
    relationName: 'conversationStudent',
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
