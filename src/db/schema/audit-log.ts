import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id')
      .references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    meta: jsonb('meta'),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    actorIdx: index('audit_log_actor_id_idx').on(table.actorId),
    entityIdx: index('audit_log_entity_idx').on(table.entityType, table.entityId),
    createdAtIdx: index('audit_log_created_at_idx').on(table.createdAt),
  }),
);
