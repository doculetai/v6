import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

export const agentProfiles = pgTable('agent_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  referralCode: text('referral_code').notNull().unique(),
  ...timestamps,
});

export const agentCommissions = pgTable('agent_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentProfileId: uuid('agent_profile_id')
    .references(() => agentProfiles.id, { onDelete: 'cascade' })
    .notNull(),
  studentId: uuid('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  studentName: text('student_name').notNull(),
  universityName: text('university_name').notNull(),
  tier: integer('tier').notNull(),
  eventType: text('event_type', {
    enum: ['kycComplete', 'certificateIssued', 'sponsorCommitted', 'referralBonus'],
  }).notNull(),
  amountKobo: integer('amount_kobo').notNull(),
  status: text('status', { enum: ['pending', 'processing', 'paid'] })
    .default('pending')
    .notNull(),
  paidAt: timestamp('paid_at'),
  ...timestamps,
});

export const agentProfilesRelations = relations(agentProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [agentProfiles.userId],
    references: [users.id],
  }),
  commissions: many(agentCommissions),
}));

export const agentCommissionsRelations = relations(agentCommissions, ({ one }) => ({
  agentProfile: one(agentProfiles, {
    fields: [agentCommissions.agentProfileId],
    references: [agentProfiles.id],
  }),
  student: one(users, {
    fields: [agentCommissions.studentId],
    references: [users.id],
  }),
}));
