import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  countUnreadMessages,
  getOrCreateConversation,
  listConversations,
  listMessages,
  markMessagesRead,
  sendMessage,
} from '@/db/queries/messages';
import { conversations } from '@/db/schema/messages';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  senderRole: z.enum(['sponsor', 'student', 'admin']),
  body: z.string(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const messagesRouter = createTRPCRouter({
  /** List conversations for the current user. */
  listConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      return listConversations(ctx.db, ctx.user!.id, input);
    }),

  /** Get messages in a conversation. Verifies the user is a participant. */
  listMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify user is a participant
      const conv = await ctx.db.query.conversations.findFirst({
        where: (t, { eq }) => eq(t.id, input.conversationId),
        columns: { sponsorId: true, studentId: true },
      });

      if (!conv) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isParticipant =
        conv.sponsorId === ctx.user!.id ||
        conv.studentId === ctx.user!.id ||
        ctx.profile?.role === 'admin';

      if (!isParticipant) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Mark messages as read for this user
      await markMessagesRead(ctx.db, input.conversationId, ctx.user!.id);

      return listMessages(ctx.db, input.conversationId, {
        limit: input.limit,
        offset: input.offset,
      });
    }),

  /** Send a message in a conversation. */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        body: z.string().min(1).max(2000),
      }),
    )
    .output(messageSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user is a participant
      const conv = await ctx.db.query.conversations.findFirst({
        where: (t, { eq }) => eq(t.id, input.conversationId),
        columns: { sponsorId: true, studentId: true },
      });

      if (!conv) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isParticipant =
        conv.sponsorId === ctx.user!.id ||
        conv.studentId === ctx.user!.id ||
        ctx.profile?.role === 'admin';

      if (!isParticipant) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const role = ctx.profile?.role;
      const senderRole =
        role === 'admin'
          ? 'admin'
          : conv.sponsorId === ctx.user!.id
            ? 'sponsor'
            : 'student';

      return sendMessage(ctx.db, {
        conversationId: input.conversationId,
        senderId: ctx.user!.id,
        senderRole: senderRole as 'sponsor' | 'student' | 'admin',
        body: input.body,
      });
    }),

  /** Start or resume a conversation with a sponsor/student. */
  startConversation: protectedProcedure
    .input(
      z.object({
        /** The other participant's user ID. */
        participantId: z.string().uuid(),
      }),
    )
    .output(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const role = ctx.profile?.role;
      if (!role || !['student', 'sponsor', 'admin'].includes(role)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Determine sponsor and student IDs based on roles
      const otherProfile = await ctx.db.query.profiles.findFirst({
        where: (t, { eq }) => eq(t.userId, input.participantId),
        columns: { role: true },
      });

      if (!otherProfile) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      let sponsorId: string;
      let studentId: string;

      if (role === 'student' && otherProfile.role === 'sponsor') {
        studentId = ctx.user!.id;
        sponsorId = input.participantId;
      } else if (role === 'sponsor' && otherProfile.role === 'student') {
        sponsorId = ctx.user!.id;
        studentId = input.participantId;
      } else if (role === 'admin') {
        // Admin can start conversations on behalf of either side
        if (otherProfile.role === 'student') {
          sponsorId = ctx.user!.id; // Admin acts as the sponsor-side
          studentId = input.participantId;
        } else {
          sponsorId = input.participantId;
          studentId = ctx.user!.id;
        }
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Messaging is available between sponsors and students',
        });
      }

      const conversationId = await getOrCreateConversation(ctx.db, sponsorId, studentId);
      return { conversationId };
    }),

  /** Count unread messages for the current user. */
  unreadCount: protectedProcedure.output(z.object({ count: z.number() })).query(async ({ ctx }) => {
    const count = await countUnreadMessages(ctx.db, ctx.user!.id);
    return { count };
  }),
});
