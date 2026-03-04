import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { dashboardRoles } from '@/config/roles';
import { profiles } from '@/db/schema';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

const profileRoleSchema = z.enum(dashboardRoles);

export const studentRouter = createTRPCRouter({
  createProfile: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: profileRoleSchema,
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(profiles)
        .values({
          userId: input.userId,
          role: input.role,
        })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: {
            role: input.role,
            updatedAt: new Date(),
          },
        });
    }),

  getCurrentProfile: protectedProcedure
    .output(
      z.object({
        role: profileRoleSchema,
      }),
    )
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: (table, { eq }) => eq(table.userId, ctx.user.id),
      });

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
      }

      return {
        role: profile.role,
      };
    }),
});
