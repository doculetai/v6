import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { certificateShares, certificates } from '@/db/schema';

import { roleProcedure } from '../trpc';

const shareMethodSchema = z.enum(['email', 'whatsapp', 'link', 'download']);

const trackShareOutputSchema = z.object({
  shareId: z.string().uuid(),
  method: shareMethodSchema,
  sharedAt: z.string().datetime(),
});

const shareHistoryItemSchema = z.object({
  id: z.string().uuid(),
  method: shareMethodSchema,
  recipient: z.string().nullable(),
  sharedAt: z.string().datetime(),
});

export const certificateShareProcedures = {
  trackCertificateShare: roleProcedure('student')
    .input(
      z.object({
        certificateId: z.string().uuid(),
        method: shareMethodSchema,
        recipient: z.string().max(255).optional(),
      }),
    )
    .output(trackShareOutputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the certificate belongs to this student
      const cert = await ctx.db.query.certificates.findFirst({
        where: eq(certificates.id, input.certificateId),
        columns: { id: true, studentId: true },
      });

      if (!cert || cert.studentId !== ctx.user!.id) {
        throw new Error('Certificate not found.');
      }

      const [share] = await ctx.db
        .insert(certificateShares)
        .values({
          certificateId: input.certificateId,
          method: input.method,
          recipient: input.recipient ?? null,
        })
        .returning({
          id: certificateShares.id,
          method: certificateShares.method,
          sharedAt: certificateShares.sharedAt,
        });

      if (!share) {
        throw new Error('Failed to record share.');
      }

      return {
        shareId: share.id,
        method: share.method as z.infer<typeof shareMethodSchema>,
        sharedAt: share.sharedAt.toISOString(),
      };
    }),

  getCertificateShareHistory: roleProcedure('student')
    .input(z.object({ certificateId: z.string().uuid() }))
    .output(z.array(shareHistoryItemSchema))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const cert = await ctx.db.query.certificates.findFirst({
        where: eq(certificates.id, input.certificateId),
        columns: { id: true, studentId: true },
      });

      if (!cert || cert.studentId !== ctx.user!.id) {
        return [];
      }

      const shares = await ctx.db.query.certificateShares.findMany({
        where: eq(certificateShares.certificateId, input.certificateId),
        orderBy: [desc(certificateShares.sharedAt)],
        columns: {
          id: true,
          method: true,
          recipient: true,
          sharedAt: true,
        },
      });

      return shares.map((s) => ({
        id: s.id,
        method: s.method as z.infer<typeof shareMethodSchema>,
        recipient: s.recipient,
        sharedAt: s.sharedAt.toISOString(),
      }));
    }),
};
