import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { certificates } from './certificates';

export const certificateShares = pgTable(
  'certificate_shares',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    certificateId: uuid('certificate_id')
      .references(() => certificates.id, { onDelete: 'cascade' })
      .notNull(),
    method: text('method', { enum: ['email', 'whatsapp', 'link', 'download'] }).notNull(),
    recipient: text('recipient'),
    sharedAt: timestamp('shared_at').defaultNow().notNull(),
  },
  (t) => [
    index('certificate_shares_certificate_idx').on(t.certificateId),
    index('certificate_shares_method_idx').on(t.method),
  ],
);

export const certificateSharesRelations = relations(certificateShares, ({ one }) => ({
  certificate: one(certificates, {
    fields: [certificateShares.certificateId],
    references: [certificates.id],
  }),
}));
