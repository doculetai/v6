import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const pendingRoleAssignments = pgTable('pending_role_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
