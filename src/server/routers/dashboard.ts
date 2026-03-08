import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { dashboardRoles } from '@/config/roles';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const dashboardSessionInputSchema = z.object({
  role: z.enum(dashboardRoles),
});

const dashboardSessionOutputSchema = z.object({
  userId: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  profileRole: z.enum(dashboardRoles).nullable(),
  onboardingComplete: z.boolean(),
});

export const dashboardRouter = createTRPCRouter({
  getDisplayUser: protectedProcedure
    .output(
      z.object({
        fullName: z.string().nullable(),
        email: z.string().nullable(),
      })
    )
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: (t, { eq }) => eq(t.userId, ctx.user!.id),
        columns: { fullName: true },
      });
      return {
        fullName: profile?.fullName ?? null,
        email: ctx.user!.email ?? null,
      };
    }),

  getSession: protectedProcedure
    .input(dashboardSessionInputSchema)
    .output(dashboardSessionOutputSchema)
    .query(async ({ ctx, input }) => {
      const user = ctx.user!;
      const profile = await ctx.db.query.profiles.findFirst({
        where: (table, { eq }) => eq(table.userId, user.id),
      });

      if (profile && profile.role !== input.role) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return {
        userId: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
        profileRole: profile?.role ?? null,
        onboardingComplete: profile?.onboardingComplete ?? false,
      };
    }),
});
