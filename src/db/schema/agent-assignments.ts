import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { sponsorships } from './sponsorships';
import { users } from './users';

export const agentStudentAssignments = pgTable(
  'agent_student_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    studentId: uuid('student_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    ...timestamps,
  },
  (t) => [unique('agent_student_assignments_agent_student_unique').on(t.agentId, t.studentId)],
);

export const agentCommissions = pgTable('agent_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  sponsorshipId: uuid('sponsorship_id').references(() => sponsorships.id, {
    onDelete: 'cascade',
  }),
  amountKobo: integer('amount_kobo').notNull(),
  currency: text('currency').notNull().default('NGN'),
  status: text('status', {
    enum: ['pending', 'processing', 'paid', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  description: text('description'),
  paidAt: timestamp('paid_at'),
  ...timestamps,
});

export const agentStudentAssignmentsRelations = relations(agentStudentAssignments, ({ one }) => ({
  agent: one(users, {
    fields: [agentStudentAssignments.agentId],
    references: [users.id],
    relationName: 'assignmentAgent',
  }),
  student: one(users, {
    fields: [agentStudentAssignments.studentId],
    references: [users.id],
    relationName: 'assignmentStudent',
  }),
}));

export const agentCommissionsRelations = relations(agentCommissions, ({ one }) => ({
  agent: one(users, {
    fields: [agentCommissions.agentId],
    references: [users.id],
  }),
  sponsorship: one(sponsorships, {
    fields: [agentCommissions.sponsorshipId],
    references: [sponsorships.id],
  }),
}));
