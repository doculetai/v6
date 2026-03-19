import { and, desc, eq, isNull, or, sql } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { conversations, messages } from '@/db/schema/messages';
import { profiles, users } from '@/db/schema';

/** List conversations for a user (either sponsor or student side). */
export async function listConversations(
  db: DrizzleDB,
  userId: string,
  params: { limit: number; offset: number },
) {
  return db.query.conversations.findMany({
    where: (t, { or: o, eq: e }) =>
      o(e(t.sponsorId, userId), e(t.studentId, userId)),
    with: {
      messages: {
        orderBy: (m, { desc: d }) => [d(m.createdAt)],
        limit: 1,
        columns: { body: true, createdAt: true, senderId: true },
      },
    },
    orderBy: (t, { desc: d }) => [d(t.updatedAt)],
    limit: params.limit,
    offset: params.offset,
  });
}

/** Get or create a conversation between a sponsor and student. */
export async function getOrCreateConversation(
  db: DrizzleDB,
  sponsorId: string,
  studentId: string,
): Promise<string> {
  // Check for existing conversation
  const existing = await db.query.conversations.findFirst({
    where: (t, { and: a, eq: e }) =>
      a(e(t.sponsorId, sponsorId), e(t.studentId, studentId)),
    columns: { id: true },
  });

  if (existing) return existing.id;

  // Create new conversation
  const [row] = await db
    .insert(conversations)
    .values({ sponsorId, studentId })
    .returning({ id: conversations.id });

  return row.id;
}

/** List messages in a conversation with pagination. */
export async function listMessages(
  db: DrizzleDB,
  conversationId: string,
  params: { limit: number; offset: number },
) {
  return db.query.messages.findMany({
    where: (t, { eq: e }) => e(t.conversationId, conversationId),
    orderBy: (t, { desc: d }) => [d(t.createdAt)],
    limit: params.limit,
    offset: params.offset,
  });
}

/** Send a message in a conversation. */
export async function sendMessage(
  db: DrizzleDB,
  params: {
    conversationId: string;
    senderId: string;
    senderRole: 'sponsor' | 'student' | 'admin';
    body: string;
  },
) {
  const [msg] = await db
    .insert(messages)
    .values({
      conversationId: params.conversationId,
      senderId: params.senderId,
      senderRole: params.senderRole,
      body: params.body,
    })
    .returning();

  // Update conversation updatedAt
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, params.conversationId));

  return msg;
}

/** Mark all unread messages in a conversation as read (for the given user). */
export async function markMessagesRead(
  db: DrizzleDB,
  conversationId: string,
  userId: string,
) {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        isNull(messages.readAt),
        // Only mark messages NOT sent by the current user
        sql`${messages.senderId} != ${userId}`,
      ),
    );
}

/** Count unread messages for a user across all conversations. */
export async function countUnreadMessages(
  db: DrizzleDB,
  userId: string,
): Promise<number> {
  // Get all conversation IDs where user is a participant
  const userConversations = await db.query.conversations.findMany({
    where: (t, { or: o, eq: e }) =>
      o(e(t.sponsorId, userId), e(t.studentId, userId)),
    columns: { id: true },
  });

  if (userConversations.length === 0) return 0;

  const conversationIds = userConversations.map((c) => c.id);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messages)
    .where(
      and(
        sql`${messages.conversationId} = ANY(${conversationIds})`,
        isNull(messages.readAt),
        sql`${messages.senderId} != ${userId}`,
      ),
    );

  return result[0]?.count ?? 0;
}
