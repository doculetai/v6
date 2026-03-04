import { relations, sql } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

export const sponsorProfiles = pgTable('sponsor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  sponsorType: text('sponsor_type', { enum: ['individual', 'corporate', 'self'] }).notNull(),
  kycStatus: text('kyc_status', {
    enum: ['not_started', 'pending', 'verified', 'failed'],
  })
    .default('not_started')
    .notNull(),
  companyName: text('company_name'),
  ...timestamps,
});

export const sponsorships = pgTable('sponsorships', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  sponsorId: uuid('sponsor_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status', { enum: ['pending', 'active', 'completed', 'cancelled'] })
    .default('pending')
    .notNull(),
  amountKobo: integer('amount_kobo').notNull(),
  currency: text('currency').notNull(),
  ...timestamps,
});

export const disbursements = pgTable('disbursements', {
  id: uuid('id').primaryKey().defaultRandom(),
  sponsorshipId: uuid('sponsorship_id')
    .references(() => sponsorships.id, { onDelete: 'cascade' })
    .notNull(),
  amountKobo: integer('amount_kobo').notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  disbursedAt: timestamp('disbursed_at'),
  status: text('status', { enum: ['scheduled', 'processing', 'disbursed', 'failed'] })
    .default('scheduled')
    .notNull(),
  paystackReference: text('paystack_reference'),
  ...timestamps,
});

export const sponsorshipInvites = pgTable(
  'sponsorship_invites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    inviteeEmail: text('invitee_email').notNull(),
    inviteeEmailNormalized: text('invitee_email_normalized').notNull(),
    status: text('status', {
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
    })
      .default('pending')
      .notNull(),
    message: text('message'),
    respondedByUserId: uuid('responded_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    respondedAt: timestamp('responded_at'),
    cancelledAt: timestamp('cancelled_at'),
    lastEmailSentAt: timestamp('last_email_sent_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    studentStatusIdx: index('sponsorship_invites_student_status_idx').on(table.studentId, table.status),
    inviteeStatusIdx: index('sponsorship_invites_invitee_status_idx').on(
      table.inviteeEmailNormalized,
      table.status,
    ),
    pendingInviteUniqueIdx: uniqueIndex('sponsorship_invites_pending_unique_idx')
      .on(table.studentId, table.inviteeEmailNormalized)
      .where(sql`${table.status} = 'pending'`),
  }),
);

export const sponsorProfilesRelations = relations(sponsorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [sponsorProfiles.userId],
    references: [users.id],
  }),
}));

export const sponsorshipsRelations = relations(sponsorships, ({ one, many }) => ({
  student: one(users, {
    fields: [sponsorships.studentId],
    references: [users.id],
    relationName: 'sponsorshipStudent',
  }),
  sponsor: one(users, {
    fields: [sponsorships.sponsorId],
    references: [users.id],
    relationName: 'sponsorshipSponsor',
  }),
  disbursements: many(disbursements),
}));

export const disbursementsRelations = relations(disbursements, ({ one }) => ({
  sponsorship: one(sponsorships, {
    fields: [disbursements.sponsorshipId],
    references: [sponsorships.id],
  }),
}));

export const sponsorshipInvitesRelations = relations(sponsorshipInvites, ({ one }) => ({
  student: one(users, {
    fields: [sponsorshipInvites.studentId],
    references: [users.id],
    relationName: 'inviteStudent',
  }),
  responder: one(users, {
    fields: [sponsorshipInvites.respondedByUserId],
    references: [users.id],
    relationName: 'inviteResponder',
  }),
}));
