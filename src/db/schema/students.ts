import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  logoUrl: text('logo_url'),
  ...timestamps,
});

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id')
    .references(() => schools.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  tuitionAmount: integer('tuition_amount').notNull(),
  currency: text('currency').notNull(),
  durationMonths: integer('duration_months').notNull(),
  ...timestamps,
});

export const studentProfiles = pgTable('student_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }),
  programId: uuid('program_id').references(() => programs.id, { onDelete: 'cascade' }),
  fundingType: text('funding_type', { enum: ['self', 'sponsor', 'corporate'] })
    .default('sponsor')
    .notNull(),
  kycStatus: text('kyc_status', {
    enum: ['not_started', 'pending', 'verified', 'failed'],
  })
    .default('not_started')
    .notNull(),
  bankStatus: text('bank_status', {
    enum: ['not_started', 'pending', 'verified', 'failed'],
  })
    .default('not_started')
    .notNull(),
  onboardingStep: integer('onboarding_step').default(1).notNull(),
  ...timestamps,
});

export const kycVerifications = pgTable('kyc_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  provider: text('provider', { enum: ['dojah'] }).default('dojah').notNull(),
  status: text('status', { enum: ['pending', 'verified', 'failed'] })
    .default('pending')
    .notNull(),
  tier: integer('tier').notNull(),
  verifiedAt: timestamp('verified_at'),
  referenceId: text('reference_id').notNull(),
  ...timestamps,
});

export const bankAccounts = pgTable('bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  provider: text('provider', { enum: ['mono'] }).default('mono').notNull(),
  accountNumber: text('account_number').notNull(),
  bankName: text('bank_name').notNull(),
  monoAccountId: text('mono_account_id').notNull(),
  linkedAt: timestamp('linked_at').defaultNow().notNull(),
  ...timestamps,
});

export const schoolsRelations = relations(schools, ({ many }) => ({
  programs: many(programs),
  studentProfiles: many(studentProfiles),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  school: one(schools, {
    fields: [programs.schoolId],
    references: [schools.id],
  }),
  studentProfiles: many(studentProfiles),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [studentProfiles.schoolId],
    references: [schools.id],
  }),
  program: one(programs, {
    fields: [studentProfiles.programId],
    references: [programs.id],
  }),
  kycVerifications: many(kycVerifications),
  bankAccounts: many(bankAccounts),
}));

export const kycVerificationsRelations = relations(kycVerifications, ({ one }) => ({
  user: one(users, {
    fields: [kycVerifications.userId],
    references: [users.id],
  }),
  studentProfile: one(studentProfiles, {
    fields: [kycVerifications.userId],
    references: [studentProfiles.userId],
  }),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ one }) => ({
  user: one(users, {
    fields: [bankAccounts.userId],
    references: [users.id],
  }),
  studentProfile: one(studentProfiles, {
    fields: [bankAccounts.userId],
    references: [studentProfiles.userId],
  }),
}));
