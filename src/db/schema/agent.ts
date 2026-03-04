import { relations } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { profiles } from './users';

export const agentActivityActionTypes = [
  'claimed_student',
  'sent_reminder',
  'reviewed_document',
  'flagged_issue',
] as const;

export type AgentActivityActionType = (typeof agentActivityActionTypes)[number];

export const agentActivityLogs = pgTable('agent_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  studentId: uuid('student_id').references(() => profiles.id, { onDelete: 'set null' }),
  actionType: text('action_type', { enum: agentActivityActionTypes }).notNull(),
  details: text('details'),
  ...timestamps,
});

export const agentActivityLogsRelations = relations(agentActivityLogs, ({ one }) => ({
  agent: one(profiles, {
    fields: [agentActivityLogs.agentId],
    references: [profiles.id],
    relationName: 'agentActivityLogs_agent',
  }),
  student: one(profiles, {
    fields: [agentActivityLogs.studentId],
    references: [profiles.id],
    relationName: 'agentActivityLogs_student',
  }),
}));
