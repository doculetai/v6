import { captureException } from '@sentry/nextjs';
import { lt } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { apiUsage } from '@/db/schema';

/** Retain API usage rows for this many days. Older rows are pruned. */
const RETENTION_DAYS = parseInt(process.env.API_USAGE_RETENTION_DAYS ?? '90', 10);

function getCutoffPeriod(): string {
  const d = new Date();
  d.setDate(d.getDate() - RETENTION_DAYS);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cutoff = getCutoffPeriod();

    await db.delete(apiUsage).where(lt(apiUsage.period, cutoff));

    return NextResponse.json({
      ok: true,
      cutoff,
      retentionDays: RETENTION_DAYS,
    });
  } catch (err) {
    captureException(err, { tags: { cron: 'prune-api-usage' } });
    return NextResponse.json(
      { error: 'API usage prune failed' },
      { status: 500 },
    );
  }
}
