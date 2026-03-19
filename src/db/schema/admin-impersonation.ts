import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './users';

/** Admin impersonation sessions — full audit trail of view-as-user actions. */
export const adminImpersonationSessions = pgTable(
  'admin_impersonation_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    targetUserId: uuid('target_user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    targetRole: text('target_role').notNull(),
    endedAt: timestamp('ended_at'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    ...timestamps,
  },
  (t) => [
    index('impersonation_admin_id_idx').on(t.adminId),
    index('impersonation_target_user_id_idx').on(t.targetUserId),
    index('impersonation_active_idx').on(t.adminId, t.endedAt),
  ],
);

export const adminImpersonationSessionsRelations = relations(
  adminImpersonationSessions,
  ({ one }) => ({
    admin: one(users, {
      fields: [adminImpersonationSessions.adminId],
      references: [users.id],
      relationName: 'admin',
    }),
    targetUser: one(users, {
      fields: [adminImpersonationSessions.targetUserId],
      references: [users.id],
      relationName: 'targetUser',
    }),
  }),
);
