import { and, desc, eq, sql } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { auditLog, users } from '@/db/schema';

export async function insertAuditLog(
  db: DrizzleDB,
  params: {
    actorId: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    meta?: Record<string, unknown> | null;
    ip?: string | null;
    userAgent?: string | null;
  },
): Promise<void> {
  await db.insert(auditLog).values({
    actorId: params.actorId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    meta: params.meta ?? null,
    ip: params.ip ?? null,
    userAgent: params.userAgent ?? null,
  });
}

export interface AuditLogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  meta: unknown;
  ip: string | null;
  actorEmail: string | null;
  createdAt: Date;
}

export interface ListAuditLogParams {
  limit: number;
  offset: number;
  action?: string;
  entityType?: string;
}

export interface ListAuditLogResult {
  rows: AuditLogRow[];
  total: number;
}

export async function listAuditLog(
  db: DrizzleDB,
  params: ListAuditLogParams,
): Promise<ListAuditLogResult> {
  const conditions = [];
  if (params.action) {
    conditions.push(eq(auditLog.action, params.action));
  }
  if (params.entityType) {
    conditions.push(eq(auditLog.entityType, params.entityType));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        meta: auditLog.meta,
        ip: auditLog.ip,
        actorEmail: users.email,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .leftJoin(users, eq(users.id, auditLog.actorId))
      .where(whereClause)
      .orderBy(desc(auditLog.createdAt))
      .limit(params.limit)
      .offset(params.offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(whereClause),
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      meta: r.meta,
      ip: r.ip,
      actorEmail: r.actorEmail,
      createdAt: r.createdAt,
    })),
    total: totalRow[0]?.count ?? 0,
  };
}
