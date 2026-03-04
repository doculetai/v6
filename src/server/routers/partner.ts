import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { listPartnerStudents } from '@/db/queries/partner';

import { createTRPCRouter, roleProcedure } from '../trpc';

const PartnerStudentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  tier: z.number().int().min(1).max(3),
  verifiedAt: z.date(),
  schoolName: z.string().nullable(),
});

export const partnerRouter = createTRPCRouter({
  listStudents: roleProcedure('partner')
    .output(z.array(PartnerStudentSchema))
    .query(async ({ ctx }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (table, { eq }) => eq(table.userId, ctx.user.id),
      });

      if (!partnerProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found' });
      }

      return listPartnerStudents(ctx.db, partnerProfile.id);
    }),
});
