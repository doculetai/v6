import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { timestamps } from './_helpers';
import { users } from './users';

export const agentCommissions = pgTable('agent_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  studentId: uuid('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  studentName: text('student_name').notNull(),
  universityName: text('university_name').notNull().default(''),
  tier: integer('tier').notNull().default(1),
  eventType: text('event_type', {
    enum: ['kycComplete', 'certificateIssued', 'sponsorCommitted', 'referralBonus'],
  }).notNull(),
  amountKobo: integer('amount_kobo').notNull().default(0),
  status: text('status', {
    enum: ['pending', 'processing', 'paid'],
  })
    .notNull()
    .default('pending'),
  paidAt: timestamp('paid_at'),
  ...timestamps,
});

export const agentCommissionsRelations = relations(agentCommissions, ({ one }) => ({
  agent: one(users, {
    fields: [agentCommissions.agentId],
    references: [users.id],
    relationName: 'agentUser',
  }),
  student: one(users, {
    fields: [agentCommissions.studentId],
    references: [users.id],
    relationName: 'studentUser',
  }),
}));
