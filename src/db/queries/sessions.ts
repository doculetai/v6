import { createHash } from 'node:crypto';
import { and, desc, eq, ne } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { userSessions } from '@/db/schema';

export type SessionForUI = {
  id: string;
  browser: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  location: string;
  lastActive: string;
  isCurrent: boolean;
  ipAddress?: string;
};

function osToDeviceType(os: string | null): SessionForUI['deviceType'] {
  if (!os) return 'unknown';
  const lower = os.toLowerCase();
  if (lower.includes('iphone') || lower.includes('android') && !lower.includes('pad'))
    return 'mobile';
  if (lower.includes('ipad') || lower.includes('android')) return 'tablet';
  return 'desktop';
}

export async function listSessionsForUser(
  db: DrizzleDB,
  userId: string,
  currentTokenHash?: string,
): Promise<SessionForUI[]> {
  const rows = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.userId, userId))
    .orderBy(desc(userSessions.lastActiveAt));

  return rows.map((r) => ({
    id: r.id,
    browser: r.browser ?? 'Unknown',
    deviceType: osToDeviceType(r.os),
    location: r.location ?? 'Unknown',
    lastActive: formatLastActive(r.lastActiveAt),
    isCurrent: Boolean(
      currentTokenHash
        ? r.sessionTokenHash === currentTokenHash
        : r.isCurrent,
    ),
    ipAddress: r.ipAddress ?? undefined,
  }));
}

function formatLastActive(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Active now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export async function revokeSession(db: DrizzleDB, userId: string, sessionId: string): Promise<boolean> {
  const [deleted] = await db
    .delete(userSessions)
    .where(and(eq(userSessions.userId, userId), eq(userSessions.id, sessionId)))
    .returning({ id: userSessions.id });

  return Boolean(deleted);
}

export async function revokeAllOtherSessions(
  db: DrizzleDB,
  userId: string,
  currentTokenHash: string,
): Promise<number> {
  const deleted = await db
    .delete(userSessions)
    .where(
      and(
        eq(userSessions.userId, userId),
        ne(userSessions.sessionTokenHash, currentTokenHash),
      ),
    )
    .returning({ id: userSessions.id });

  return deleted.length;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex').slice(0, 64);
}
