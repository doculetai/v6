import { relations } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { certificates } from './certificates';
import { users } from './users';

export const certificatePayments = pgTable(
  'certificate_payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    certificateId: uuid('certificate_id')
      .references(() => certificates.id, { onDelete: 'cascade' })
      .notNull(),
    studentId: uuid('student_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    /** User who actually paid — may be agent paying on student's behalf */
    paidByUserId: uuid('paid_by_user_id').references(() => users.id, { onDelete: 'set null' }),
    amountKobo: integer('amount_kobo').notNull(),
    currency: text('currency').default('NGN').notNull(),
    paystackReference: text('paystack_reference').unique(),
    status: text('status', { enum: ['pending', 'paid', 'failed', 'waived'] })
      .default('pending')
      .notNull(),
    paidAt: timestamp('paid_at'),
    ...timestamps,
  },
  (t) => [
    index('certificate_payments_certificate_idx').on(t.certificateId),
    index('certificate_payments_student_idx').on(t.studentId),
    index('certificate_payments_status_idx').on(t.status),
  ],
);

export const certificatePaymentsRelations = relations(certificatePayments, ({ one }) => ({
  certificate: one(certificates, {
    fields: [certificatePayments.certificateId],
    references: [certificates.id],
  }),
  student: one(users, {
    fields: [certificatePayments.studentId],
    references: [users.id],
    relationName: 'certificatePaymentStudent',
  }),
  paidBy: one(users, {
    fields: [certificatePayments.paidByUserId],
    references: [users.id],
    relationName: 'certificatePaymentPayer',
  }),
}));
