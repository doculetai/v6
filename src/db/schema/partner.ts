import { relations } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

export const partnerProfiles = pgTable('partner_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  organizationName: text('organization_name').notNull(),
  webhookUrl: text('webhook_url'),
  webhookSigningSecret: text('webhook_signing_secret'),
  brandLogoUrl: text('brand_logo_url'),
  brandColor: text('brand_color'),
  ...timestamps,
});

export const partnerApiKeys = pgTable(
  'partner_api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .references(() => partnerProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    keyHash: text('key_hash').notNull().unique(),
    keyPrefix: text('key_prefix').notNull(),
    scopes: text('scopes').array().notNull(),
    lastUsedAt: timestamp('last_used_at'),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('partner_api_keys_partner_id_idx').on(t.partnerId)],
);

// Records which students were verified through a specific partner's API.
export const partnerStudents = pgTable('partner_students', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id')
    .references(() => partnerProfiles.id, { onDelete: 'cascade' })
    .notNull(),
  studentId: uuid('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  tier: integer('tier').notNull(),
  verifiedAt: timestamp('verified_at').defaultNow().notNull(),
  ...timestamps,
});

export const partnerProfilesRelations = relations(partnerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [partnerProfiles.userId],
    references: [users.id],
  }),
  apiKeys: many(partnerApiKeys),
  students: many(partnerStudents),
}));

export const partnerApiKeysRelations = relations(partnerApiKeys, ({ one }) => ({
  partner: one(partnerProfiles, {
    fields: [partnerApiKeys.partnerId],
    references: [partnerProfiles.id],
  }),
}));

export const partnerStudentsRelations = relations(partnerStudents, ({ one }) => ({
  partner: one(partnerProfiles, {
    fields: [partnerStudents.partnerId],
    references: [partnerProfiles.id],
  }),
  student: one(users, {
    fields: [partnerStudents.studentId],
    references: [users.id],
  }),
}));
