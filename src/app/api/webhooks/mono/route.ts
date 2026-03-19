import { captureException } from '@sentry/nextjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import {
  processMonoWebhook,
  type MonoWebhookEvent,
} from '@/db/queries/mono-webhook';

function verifyMonoSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.MONO_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  try {
    const sigBuf = Buffer.from(signature, 'hex');
    if (expected.length !== sigBuf.length) return false;
    return timingSafeEqual(expected, sigBuf);
  } catch {
    return false;
  }
}

const monoEventSchema = z.enum([
  'account.connected',
  'account.disconnected',
  'account.reauthorization_required',
]);

const monoPayloadSchema = z.object({
  event: monoEventSchema,
  data: z.object({ id: z.string() }),
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-mono-signature') ?? '';

  if (!verifyMonoSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: z.infer<typeof monoPayloadSchema>;
  try {
    const parsed = monoPayloadSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return NextResponse.json({ received: true });
    }
    payload = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    await processMonoWebhook(db, payload.event as MonoWebhookEvent, payload.data);
  } catch (error) {
    captureException(error, { tags: { webhook: 'mono' } });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
