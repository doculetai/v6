import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

export const universityProfiles = pgTable('university_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  institutionName: text('institution_name').notNull().default(''),
  accreditationBody: text('accreditation_body'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  webhookUrl: text('webhook_url'),
  notifyOnSubmission: boolean('notify_on_submission').default(true).notNull(),
  notifyOnApproval: boolean('notify_on_approval').default(true).notNull(),
  notifyOnRejection: boolean('notify_on_rejection').default(true).notNull(),
  ...timestamps,
});

export const universityProfilesRelations = relations(universityProfiles, ({ one }) => ({
  user: one(users, {
    fields: [universityProfiles.userId],
    references: [users.id],
  }),
}));

export type UniversityProfileRow = typeof universityProfiles.$inferSelect;
export type UniversityProfileInsert = typeof universityProfiles.$inferInsert;
