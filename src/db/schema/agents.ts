import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

export const agentProfiles = pgTable('agent_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  fullName: text('full_name'),
  phoneNumber: text('phone_number'),
  region: text('region'),
  accreditationNumber: text('accreditation_number'),
  notifyNewStudent: boolean('notify_new_student').default(true).notNull(),
  notifyCommissionPaid: boolean('notify_commission_paid').default(true).notNull(),
  notifyStudentMilestone: boolean('notify_student_milestone').default(true).notNull(),
  notifyAccountSecurity: boolean('notify_account_security').default(true).notNull(),
  ...timestamps,
});

export const agentProfilesRelations = relations(agentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [agentProfiles.userId],
    references: [users.id],
  }),
}));
