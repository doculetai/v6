import { and, eq, isNull } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { adminImpersonationSessions } from '@/db/schema/admin-impersonation';

/** Create a new impersonation session. Returns the session ID. */
export async function startImpersonationSession(
  db: DrizzleDB,
  params: {
    adminId: string;
    targetUserId: string;
    targetRole: string;
    ipAddress?: string;
    userAgent?: string;
  },
): Promise<string> {
  // End any existing active session for this admin
  await endActiveSessionsForAdmin(db, params.adminId);

  const [row] = await db
    .insert(adminImpersonationSessions)
    .values({
      adminId: params.adminId,
      targetUserId: params.targetUserId,
      targetRole: params.targetRole,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    })
    .returning({ id: adminImpersonationSessions.id });

  return row.id;
}

/** End a specific impersonation session. */
export async function endImpersonationSession(
  db: DrizzleDB,
  sessionId: string,
): Promise<void> {
  await db
    .update(adminImpersonationSessions)
    .set({ endedAt: new Date() })
    .where(
      and(
        eq(adminImpersonationSessions.id, sessionId),
        isNull(adminImpersonationSessions.endedAt),
      ),
    );
}

/** End all active sessions for an admin. */
export async function endActiveSessionsForAdmin(
  db: DrizzleDB,
  adminId: string,
): Promise<void> {
  await db
    .update(adminImpersonationSessions)
    .set({ endedAt: new Date() })
    .where(
      and(
        eq(adminImpersonationSessions.adminId, adminId),
        isNull(adminImpersonationSessions.endedAt),
      ),
    );
}

/** Get the active impersonation session for an admin (if any). */
export async function getActiveImpersonationSession(
  db: DrizzleDB,
  adminId: string,
) {
  return db.query.adminImpersonationSessions.findFirst({
    where: (t, { and: a, eq: e, isNull: n }) =>
      a(e(t.adminId, adminId), n(t.endedAt)),
    columns: {
      id: true,
      targetUserId: true,
      targetRole: true,
      createdAt: true,
    },
  });
}
