import { z } from 'zod';

import {
  getUniversityStudentMetrics,
  getUniversityStudents,
} from '@/db/queries/university-students';
import { createTRPCRouter, roleProcedure } from '../trpc';

// ─── Zod schemas ─────────────────────────────────────────

const kycStatusSchema = z.enum(['not_started', 'pending', 'verified', 'failed']);
const bankStatusSchema = z.enum(['not_started', 'pending', 'verified', 'failed']);

export const universityStudentRowSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  kycStatus: kycStatusSchema,
  bankStatus: bankStatusSchema,
  tier: z.number().int().min(0).max(3),
  amountKobo: z.number().int().min(0),
  submittedAt: z.string().datetime(),
  schoolName: z.string().nullable(),
  programName: z.string().nullable(),
});

export const universityStudentMetricsSchema = z.object({
  total: z.number().int().min(0),
  kycVerified: z.number().int().min(0),
  kycPending: z.number().int().min(0),
  kycFailed: z.number().int().min(0),
});

// ─── Router ──────────────────────────────────────────────

export const universityRouter = createTRPCRouter({
  listStudents: roleProcedure('university')
    .output(z.array(universityStudentRowSchema))
    .query(async ({ ctx }) => {
      return getUniversityStudents(ctx.db);
    }),

  getStudentMetrics: roleProcedure('university')
    .output(universityStudentMetricsSchema)
    .query(async ({ ctx }) => {
      return getUniversityStudentMetrics(ctx.db);
    }),
});
