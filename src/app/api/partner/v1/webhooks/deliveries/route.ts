import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { webhookDeliveries } from '@/db/schema';
import {
  authenticatePartnerApiKey,
  getApiKeyFromRequest,
  requireScope,
} from '@/lib/partner-api-auth';
import { withRateLimit } from '@/lib/partner-api-rate-limit';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const VALID_STATUSES = ['pending', 'delivered', 'failed'] as const;

export async function GET(request: Request) {
  const rawKey = getApiKeyFromRequest(request);
  const auth = await authenticatePartnerApiKey(rawKey);

  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Valid API key required' },
      { status: 401 },
    );
  }

  if (!requireScope(auth, 'webhooksWrite')) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'API key lacks webhooksWrite scope' },
      { status: 403 },
    );
  }

  const rateLimitResponse = await withRateLimit(auth, request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = Math.min(
    Math.max(1, parseInt(limitParam ?? '', 10) || DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  const statusParam = searchParams.get('status');
  const statusFilter =
    statusParam && VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])
      ? (statusParam as (typeof VALID_STATUSES)[number])
      : null;

  const whereClause = statusFilter
    ? and(
        eq(webhookDeliveries.partnerId, auth.partnerId),
        eq(webhookDeliveries.status, statusFilter),
      )
    : eq(webhookDeliveries.partnerId, auth.partnerId);

  const rows = await db
    .select({
      id: webhookDeliveries.id,
      eventType: webhookDeliveries.eventType,
      entityId: webhookDeliveries.entityId,
      status: webhookDeliveries.status,
      attempts: webhookDeliveries.attempts,
      responseStatus: webhookDeliveries.responseStatus,
      lastAttemptAt: webhookDeliveries.lastAttemptAt,
      createdAt: webhookDeliveries.createdAt,
    })
    .from(webhookDeliveries)
    .where(whereClause)
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(limit);

  return NextResponse.json({
    deliveries: rows.map((r) => ({
      id: r.id,
      eventType: r.eventType,
      entityId: r.entityId,
      status: r.status,
      attempts: r.attempts,
      responseStatus: r.responseStatus,
      lastAttemptAt: r.lastAttemptAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
