import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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
  fullName: text('full_name'),
  phoneNumber: text('phone_number'),
  relationshipToStudent: text('relationship_to_student', {
    enum: ['parent', 'guardian', 'relative', 'corporate', 'other'],
  }),
  companyName: text('company_name'),
  cacNumber: text('cac_number'),
  directorBvn: text('director_bvn'),
  notifyFundingUpdates: boolean('notify_funding_updates').default(true).notNull(),
  notifyVerificationUpdates: boolean('notify_verification_updates').default(true).notNull(),
  notifySecurityAlerts: boolean('notify_security_alerts').default(true).notNull(),
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
