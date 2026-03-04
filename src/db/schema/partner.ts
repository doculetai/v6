import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const partnerProfiles = pgTable('partner_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  organizationName: text('organization_name').notNull(),
  webhookUrl: text('webhook_url'),
  brandLogoUrl: text('brand_logo_url'),
  brandColor: text('brand_color'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const partnerApiKeys = pgTable('partner_api_keys', {
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
});

export const partnerProfilesRelations = relations(partnerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [partnerProfiles.userId],
    references: [users.id],
  }),
  apiKeys: many(partnerApiKeys),
}));

export const partnerApiKeysRelations = relations(partnerApiKeys, ({ one }) => ({
  partner: one(partnerProfiles, {
    fields: [partnerApiKeys.partnerId],
    references: [partnerProfiles.id],
  }),
}));
