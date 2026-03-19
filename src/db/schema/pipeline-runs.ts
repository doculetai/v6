import { relations } from 'drizzle-orm';
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { documents } from './documents';
import { users } from './users';

export const pipelineRunStatusValues = [
  'pending',
  'intake',
  'fast_ocr',
  'fast_validation',
  'fast_complete',
  'deep_ocr',
  'deep_fraud',
  'consensus',
  'completed',
  'failed',
  'partial',
] as const;

export const riskCategoryValues = ['low', 'medium', 'high', 'critical'] as const;

export const autoDecisionValues = ['approve', 'review', 'reject'] as const;

/** Tracks OCR processing pipeline runs for each document. */
export const pipelineRuns = pgTable(
  'pipeline_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    status: text('status', { enum: pipelineRunStatusValues }).default('pending').notNull(),
    /** 0-100 progress indicator */
    progress: integer('progress').default(0).notNull(),
    currentStep: text('current_step'),

    /** Fast path results (Claude Vision primary extraction) */
    fastExtraction: jsonb('fast_extraction'),
    fastValidation: jsonb('fast_validation'),

    /** Deep scan results (multi-provider) */
    providerExtractions: jsonb('provider_extractions'),
    consensusResult: jsonb('consensus_result'),
    fraudChecks: jsonb('fraud_checks'),

    /** Risk assessment */
    compositeScore: integer('composite_score'),
    riskCategory: text('risk_category', { enum: riskCategoryValues }),
    autoDecision: text('auto_decision', { enum: autoDecisionValues }),

    /** Extracted statement metadata */
    statementPeriodStart: timestamp('statement_period_start'),
    statementPeriodEnd: timestamp('statement_period_end'),
    bankName: text('bank_name'),
    accountHolder: text('account_holder'),

    /** Error details if pipeline fails */
    errorMessage: text('error_message'),

    ...timestamps,
  },
  (t) => [
    index('pipeline_runs_document_id_idx').on(t.documentId),
    index('pipeline_runs_user_id_idx').on(t.userId),
    index('pipeline_runs_status_idx').on(t.status),
  ],
);

export const pipelineRunsRelations = relations(pipelineRuns, ({ one }) => ({
  document: one(documents, {
    fields: [pipelineRuns.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [pipelineRuns.userId],
    references: [users.id],
  }),
}));
