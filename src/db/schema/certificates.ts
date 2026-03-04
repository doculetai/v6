import { relations } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { sponsorships } from './sponsorships';
import { users } from './users';

export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  sponsorshipId: uuid('sponsorship_id').references(() => sponsorships.id, {
    onDelete: 'cascade',
  }),
  token: text('token').notNull().unique(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  validUntil: timestamp('valid_until'),
  status: text('status', { enum: ['active', 'revoked'] }).default('active').notNull(),
  metaJson: jsonb('meta_json').notNull(),
});

export const certificatesRelations = relations(certificates, ({ one }) => ({
  student: one(users, {
    fields: [certificates.studentId],
    references: [users.id],
  }),
  sponsorship: one(sponsorships, {
    fields: [certificates.sponsorshipId],
    references: [sponsorships.id],
  }),
}));
