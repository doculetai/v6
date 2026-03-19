import { captureException } from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

import { deliverPendingWebhooks } from '@/lib/outbound-webhooks';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deliverPendingWebhooks();
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureException(err, { tags: { cron: 'retry-webhooks' } });
    return NextResponse.json({ error: 'Delivery failed' }, { status: 500 });
  }
}
