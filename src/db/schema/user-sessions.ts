import { boolean, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

export const userSessions = pgTable(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    sessionTokenHash: text('session_token_hash').notNull(),
    deviceName: text('device_name'),
    browser: text('browser'),
    os: text('os'),
    ipAddress: text('ip_address'),
    fingerprint: text('fingerprint'),
    location: text('location'),
    isCurrent: boolean('is_current').default(false).notNull(),
    lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [unique('user_sessions_session_token_hash_key').on(t.sessionTokenHash)],
);
