import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { certificates } from '@/db/schema';

import { createTRPCRouter, publicProcedure } from '../trpc';

const verifyOutputSchema = z.object({
  found: z.boolean(),
  valid: z.boolean(),
  holderLabel: z.string().nullable(),
  schoolName: z.string().nullable(),
  programName: z.string().nullable(),
  amountKobo: z.number().nullable(),
  currency: z.string().nullable(),
  issuedAt: z.string().datetime().nullable(),
  validUntil: z.string().datetime().nullable(),
  tier: z.number().nullable(),
  status: z.enum(['active', 'revoked']).nullable(),
});

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '****@****.***';
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export const certificateRouter = createTRPCRouter({
  verifyByToken: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .output(verifyOutputSchema)
    .query(async ({ ctx, input }) => {
      const cert = await ctx.db.query.certificates.findFirst({
        where: eq(certificates.token, input.token),
        columns: { studentId: true, issuedAt: true, validUntil: true, status: true },
        with: {
          student: {
            columns: { email: true },
          },
        },
      });

      if (!cert) {
        return {
          found: false,
          valid: false,
          holderLabel: null,
          schoolName: null,
          programName: null,
          amountKobo: null,
          currency: null,
          issuedAt: null,
          validUntil: null,
          tier: null,
          status: null,
        };
      }

      const holderLabel = cert.student?.email ? maskEmail(cert.student.email) : 'Certificate holder';

      const sp = await ctx.db.query.studentProfiles.findFirst({
        where: (t, { eq }) => eq(t.userId, cert.studentId),
        columns: { fundingType: true },
        with: {
          school: { columns: { name: true } },
          program: { columns: { name: true, tuitionAmount: true, currency: true } },
        },
      });

      const schoolName = sp?.school?.name ?? null;
      const programName = sp?.program?.name ?? null;
      const amountKobo = sp?.program?.tuitionAmount ?? null;
      const currency = sp?.program?.currency ?? null;

      const now = new Date();
      const expired = cert.validUntil ? new Date(cert.validUntil) < now : false;
      const valid = cert.status === 'active' && !expired;
      const tier = sp?.fundingType ? (sp.fundingType === 'self' ? 2 : 3) : 1;

      return {
        found: true,
        valid,
        holderLabel,
        schoolName,
        programName,
        amountKobo,
        currency,
        issuedAt: cert.issuedAt?.toISOString() ?? null,
        validUntil: cert.validUntil?.toISOString() ?? null,
        tier,
        status: cert.status,
      };
    }),
});
