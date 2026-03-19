import { captureException } from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray, isNotNull, lt } from 'drizzle-orm';

import { db } from '@/db';
import { documents } from '@/db/schema';

/** Document types that have a printed expiry (passport, ID card). */
const EXPIRY_TYPES = ['passport'] as const;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await db
      .update(documents)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(
        and(
          eq(documents.status, 'approved'),
          isNotNull(documents.expiresAt),
          lt(documents.expiresAt, new Date()),
          inArray(documents.type, [...EXPIRY_TYPES]),
        ),
      )
      .returning({ id: documents.id });

    return NextResponse.json({
      ok: true,
      expiredCount: result.length,
    });
  } catch (err) {
    captureException(err, { tags: { cron: 'document-expiry' } });
    return NextResponse.json(
      { error: 'Document expiry cron failed' },
      { status: 500 },
    );
  }
}
