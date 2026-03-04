import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

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
