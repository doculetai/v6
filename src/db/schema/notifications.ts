import { relations } from 'drizzle-orm';
import { boolean, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

/** In-app notification feed. */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: text('type', {
      enum: [
        'invite',
        'invite_accepted',
        'invite_rejected',
        'doc_approved',
        'doc_rejected',
        'doc_more_info',
        'cert_issued',
        'disbursement_success',
        'disbursement_failed',
        'kyc_reminder',
        'system',
      ],
    }).notNull(),
    title: text('title').notNull(),
    body: text('body'),
    metaJson: jsonb('meta_json'),
    readAt: timestamp('read_at'),
    ...timestamps,
  },
  (t) => [
    index('notifications_user_id_idx').on(t.userId),
    index('notifications_read_at_idx').on(t.readAt),
  ],
);

/** Per-user, per-channel notification preferences. One row per (userId, channel). */
export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    channel: text('channel', { enum: ['email', 'in_app', 'push'] }).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex('notification_preferences_user_channel_idx').on(t.userId, t.channel)],
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
  }),
);
