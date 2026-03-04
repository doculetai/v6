import { relations } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { schools } from './students';
import { users } from './users';

export const universityProfiles = pgTable('university_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'set null' }),
  organizationName: text('organization_name'),
  ...timestamps,
});

export const universityProfilesRelations = relations(universityProfiles, ({ one }) => ({
  user: one(users, {
    fields: [universityProfiles.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [universityProfiles.schoolId],
    references: [schools.id],
  }),
}));
