import { captureException } from '@sentry/nextjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { processDojahWebhook } from '@/db/queries/dojah-webhook';

function verifyDojahSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.DOJAH_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

const dojahPayloadSchema = z.object({
  event: z.string().optional(),
  data: z
    .object({
      reference_id: z.string().optional(),
      status: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-dojah-signature') ?? '';

  if (!verifyDojahSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: z.infer<typeof dojahPayloadSchema>;
  try {
    const parsed = dojahPayloadSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      captureException(new Error('Dojah webhook schema mismatch'), {
        extra: { issues: parsed.error.issues },
        tags: { webhook: 'dojah' },
      });
      return NextResponse.json({ received: true });
    }
    payload = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const referenceId = payload.data?.reference_id;
  const rawStatus = payload.data?.status;

  if (!referenceId || !rawStatus) {
    return NextResponse.json({ received: true }); // ignore unrecognised events
  }

  const status = rawStatus === 'successful' ? 'verified' : 'failed';

  try {
    await processDojahWebhook(db, referenceId, status);
  } catch (error) {
    captureException(error, { tags: { webhook: 'dojah' } });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
