import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { dashboardRoles } from '@/config/roles';
import { profiles } from '@/db/schema';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const dashboardSessionInputSchema = z.object({
  role: z.enum(dashboardRoles),
});

const dashboardSessionOutputSchema = z.object({
  userId: z.string(),
  email: z.string().nullable(),
  profileRole: z.enum(dashboardRoles).nullable(),
  onboardingComplete: z.boolean(),
});

export const dashboardRouter = createTRPCRouter({
  getSession: protectedProcedure
    .input(dashboardSessionInputSchema)
    .output(dashboardSessionOutputSchema)
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.userId, ctx.user.id),
      });

      if (profile && profile.role !== input.role) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return {
        userId: ctx.user.id,
        email: ctx.user.email ?? null,
        profileRole: profile?.role ?? null,
        onboardingComplete: profile?.onboardingComplete ?? false,
      };
    }),
});
