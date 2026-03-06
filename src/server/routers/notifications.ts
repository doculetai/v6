import { and, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';

import { notificationPreferences, notifications } from '@/db/schema';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const CHANNELS = ['email', 'in_app', 'push'] as const;

const notificationSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  metaJson: z.unknown().nullable(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
});

export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .output(z.array(notificationSchema))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.notifications.findMany({
        where: (t, { eq }) => eq(t.userId, ctx.user!.id),
        orderBy: (t, { desc }) => desc(t.createdAt),
        limit: input.limit,
        columns: {
          id: true,
          type: true,
          title: true,
          body: true,
          metaJson: true,
          readAt: true,
          createdAt: true,
        },
      });
      return rows.map((r) => ({
        ...r,
        readAt: r.readAt,
        createdAt: r.createdAt,
      }));
    }),

  unreadCount: protectedProcedure
    .output(z.number().int().min(0))
    .query(async ({ ctx }) => {
      const [row] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, ctx.user!.id),
            isNull(notifications.readAt),
          ),
        );
      return row?.count ?? 0;
    }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string().uuid().optional(), markAll: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.id;
      if (input.markAll) {
        await ctx.db
          .update(notifications)
          .set({ readAt: new Date(), updatedAt: new Date() })
          .where(eq(notifications.userId, userId));
        return;
      }
      if (input.id) {
        await ctx.db
          .update(notifications)
          .set({ readAt: new Date(), updatedAt: new Date() })
          .where(
            and(eq(notifications.id, input.id), eq(notifications.userId, userId)),
          );
      }
    }),

  getPreferences: protectedProcedure
    .output(
      z.array(
        z.object({
          channel: z.enum(CHANNELS),
          enabled: z.boolean(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const rows = await ctx.db.query.notificationPreferences.findMany({
        where: (t, { eq }) => eq(t.userId, ctx.user!.id),
        columns: { channel: true, enabled: true },
      });
      const byChannel = new Map(rows.map((r) => [r.channel, r.enabled]));
      return CHANNELS.map((channel) => ({
        channel,
        enabled: byChannel.get(channel) ?? true,
      }));
    }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        channel: z.enum(CHANNELS),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(notificationPreferences)
        .values({
          userId: ctx.user!.id,
          channel: input.channel,
          enabled: input.enabled,
        })
        .onConflictDoUpdate({
          target: [notificationPreferences.userId, notificationPreferences.channel],
          set: { enabled: input.enabled, updatedAt: new Date() },
        });
    }),
});
