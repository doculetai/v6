import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { programs, schools } from './students';
import { users } from './users';

export const verificationRequests = pgTable(
  'verification_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    universityUserId: uuid('university_user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'set null' }),
    programId: uuid('program_id').references(() => programs.id, { onDelete: 'set null' }),
    studentEmail: text('student_email').notNull(),
    token: text('token').notNull().unique(),
    status: text('status', {
      enum: ['sent', 'started', 'in_progress', 'completed', 'expired'],
    })
      .default('sent')
      .notNull(),
    /** The student user who claimed this request after signup/login */
    claimedByUserId: uuid('claimed_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    expiresAt: timestamp('expires_at').notNull(),
    ...timestamps,
  },
  (t) => [
    index('verification_requests_university_idx').on(t.universityUserId),
    index('verification_requests_status_idx').on(t.status),
    index('verification_requests_token_idx').on(t.token),
    index('verification_requests_student_email_idx').on(t.studentEmail),
  ],
);

export const verificationRequestsRelations = relations(verificationRequests, ({ one }) => ({
  universityUser: one(users, {
    fields: [verificationRequests.universityUserId],
    references: [users.id],
    relationName: 'verificationRequestUniversity',
  }),
  school: one(schools, {
    fields: [verificationRequests.schoolId],
    references: [schools.id],
  }),
  program: one(programs, {
    fields: [verificationRequests.programId],
    references: [programs.id],
  }),
  claimedBy: one(users, {
    fields: [verificationRequests.claimedByUserId],
    references: [users.id],
    relationName: 'verificationRequestStudent',
  }),
}));
