import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

export const sponsorProfiles = pgTable(
  'sponsor_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    sponsorType: text('sponsor_type', { enum: ['individual', 'corporate', 'self'] })
      .default('individual')
      .notNull(),
    kycStatus: text('kyc_status', {
      enum: [
        'draft',
        'submitted',
        'under_review',
        'approved',
        'certificate_issued',
        'rejected',
        'action_required',
        'expired',
      ],
    })
      .default('draft')
      .notNull(),
    identityMethod: text('identity_method', { enum: ['nin', 'passport'] }),
    identityStatus: text('identity_status', {
      enum: ['not_started', 'submitted', 'under_review', 'verified', 'failed'],
    })
      .default('not_started')
      .notNull(),
    nin: text('nin'),
    passportNumber: text('passport_number'),
    sourceOfFundsType: text('source_of_funds_type', {
      enum: ['salary', 'business', 'savings', 'investment'],
    }),
    sourceOfFundsAmountKobo: integer('source_of_funds_amount_kobo'),
    bankVerificationMethod: text('bank_verification_method', { enum: ['pdf', 'mono'] }),
    bankStatus: text('bank_status', {
      enum: ['not_started', 'submitted', 'under_review', 'verified', 'failed'],
    })
      .default('not_started')
      .notNull(),
    bankStatementFileName: text('bank_statement_file_name'),
    bankStatementUploadedAt: timestamp('bank_statement_uploaded_at'),
    monoAccountId: text('mono_account_id'),
    monoLinkedAt: timestamp('mono_linked_at'),
    isCorporate: boolean('is_corporate').default(false).notNull(),
    cacRegistrationNumber: text('cac_registration_number'),
    directorBvn: text('director_bvn'),
    sponsorshipLetterFileName: text('sponsorship_letter_file_name'),
    corporateStatus: text('corporate_status', {
      enum: ['not_started', 'submitted', 'under_review', 'verified', 'failed'],
    })
      .default('not_started')
      .notNull(),
    tier: integer('tier').default(1).notNull(),
    currentStep: integer('current_step').default(1).notNull(),
    reviewedAt: timestamp('reviewed_at'),
    reviewNotes: text('review_notes'),
    ...timestamps,
  },
  (table) => [
    index('sponsor_profiles_kyc_status_idx').on(table.kycStatus),
    index('sponsor_profiles_tier_idx').on(table.tier),
  ],
);

export const sponsorProfilesRelations = relations(sponsorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [sponsorProfiles.userId],
    references: [users.id],
  }),
}));
