import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { sponsorshipInvites } from './sponsorships';
import { studentProfiles } from './students';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    role: text('role', {
      enum: ['student', 'sponsor', 'university', 'admin', 'agent', 'partner'],
    }).notNull(),
    onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
    fullName: text('full_name'),
    phone: text('phone'),
    whatsappNumber: text('whatsapp_number'),
    riskScore: text('risk_score').default('low').notNull(),
    referredByAgentId: uuid('referred_by_agent_id'),
    suspendedAt: timestamp('suspended_at'),
    suspendedReason: text('suspended_reason'),
    frozenAt: timestamp('frozen_at'),
    frozenReason: text('frozen_reason'),
    deactivatedAt: timestamp('deactivated_at'),
    ...timestamps,
  },
  (t) => [index('profiles_role_idx').on(t.role)],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  sponsorshipInvitesAsStudent: many(sponsorshipInvites, {
    relationName: 'inviteStudent',
  }),
  sponsorshipInvitesAsResponder: many(sponsorshipInvites, {
    relationName: 'inviteResponder',
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));
