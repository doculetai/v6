import { relations, sql } from 'drizzle-orm';
import { index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { schools } from './students';
import { users } from './users';

export const universityProfiles = pgTable(
  'university_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'set null' }),
    organizationName: text('organization_name'),
    universitySlug: text('university_slug').unique(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('university_profiles_school_id_unique')
      .on(t.schoolId)
      .where(sql`${t.schoolId} IS NOT NULL`),
  ],
);

export const universityTeamMembers = pgTable(
  'university_team_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    universityProfileId: uuid('university_profile_id')
      .references(() => universityProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    role: text('role', { enum: ['admin', 'reviewer', 'viewer'] }).default('viewer').notNull(),
    ...timestamps,
  },
  (t) => [index('university_team_members_profile_idx').on(t.universityProfileId)],
);

export const universityProfilesRelations = relations(universityProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [universityProfiles.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [universityProfiles.schoolId],
    references: [schools.id],
  }),
  teamMembers: many(universityTeamMembers),
}));

export const universityTeamMembersRelations = relations(universityTeamMembers, ({ one }) => ({
  universityProfile: one(universityProfiles, {
    fields: [universityTeamMembers.universityProfileId],
    references: [universityProfiles.id],
  }),
}));
