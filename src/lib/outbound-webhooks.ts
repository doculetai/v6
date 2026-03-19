import { createHmac, createHash } from 'node:crypto';

import { eq, isNotNull } from 'drizzle-orm';

import { db } from '@/db';
import { partnerProfiles, webhookDeliveries } from '@/db/schema';

const MAX_ATTEMPTS = 4; // initial + 3 retries
const BASE_DELAY_MS = 1000;

export type WebhookEvent =
  | 'certificate.issued'
  | 'certificate.revoked'
  | 'sponsorship.accepted'
  | 'document.approved'
  | 'document.rejected'
  | 'document.more_info_requested'
  | 'disbursement.disbursed';

export type WebhookPayload = Record<string, unknown>;

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function hashPayload(payload: string): string {
  return createHash('sha256').update(payload).digest('hex');
}

export async function enqueueWebhooks(
  eventType: WebhookEvent,
  payload: WebhookPayload,
  studentId?: string,
): Promise<void> {
  const payloadStr = JSON.stringify(payload);
  const payloadHash = hashPayload(payloadStr);

  const partners = await db
    .select({
      id: partnerProfiles.id,
      webhookUrl: partnerProfiles.webhookUrl,
      webhookSigningSecret: partnerProfiles.webhookSigningSecret,
    })
    .from(partnerProfiles)
    .where(isNotNull(partnerProfiles.webhookUrl));

  const withUrl = partners.filter((p) => p.webhookUrl);
  for (const partner of withUrl) {
    const url = partner.webhookUrl!;
    const entityId =
      (payload.certificateId as string) ??
      (payload.documentId as string) ??
      (payload.disbursementId as string) ??
      (payload.sponsorshipId as string) ??
      null;
    const [inserted] = await db
      .insert(webhookDeliveries)
      .values({
        partnerId: partner.id,
        eventType,
        entityId,
        payloadHash,
        payloadJson: payload as Record<string, unknown>,
        url,
        status: 'pending',
        attempts: 0,
      })
      .returning({ id: webhookDeliveries.id });

    if (inserted) {
      try {
        await deliverWebhook(inserted.id);
      } catch {
        // Status remains pending; cron will retry
      }
    }
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function deliverWebhook(deliveryId: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.id, deliveryId))
    .limit(1);

  if (!row || row.status === 'delivered') return true;
  if (row.attempts >= MAX_ATTEMPTS) return false;

  const partner = await db.query.partnerProfiles.findFirst({
    where: (t, { eq: eqFn }) => eqFn(t.id, row.partnerId),
    columns: { webhookSigningSecret: true },
  });

  const payloadJson = row.payloadJson ?? {};
  const payloadStr = JSON.stringify(payloadJson);
  const signature = partner?.webhookSigningSecret
    ? signPayload(payloadStr, partner.webhookSigningSecret)
    : null;

  const attempts = row.attempts + 1;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Doculet-Event': row.eventType,
      'X-Doculet-Delivery-Id': row.id,
      'User-Agent': 'Doculet-Webhooks/1.0',
    };
    if (signature) {
      headers['X-Webhook-Signature'] = `sha256=${signature}`;
    }

    const res = await fetch(row.url, {
      method: 'POST',
      headers,
      body: payloadStr,
      signal: AbortSignal.timeout(15000),
    });

    await db
      .update(webhookDeliveries)
      .set({
        attempts,
        lastAttemptAt: new Date(),
        responseStatus: res.status,
        status: res.ok ? 'delivered' : 'failed',
        updatedAt: new Date(),
      })
      .where(eq(webhookDeliveries.id, deliveryId));

    return res.ok;
  } catch (err) {
    await db
      .update(webhookDeliveries)
      .set({
        attempts,
        lastAttemptAt: new Date(),
        status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
        updatedAt: new Date(),
      })
      .where(eq(webhookDeliveries.id, deliveryId));
    throw err;
  }
}

export async function deliverPendingWebhooks(): Promise<void> {
  const pending = await db
    .select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.status, 'pending'))
    .limit(50);

  for (const row of pending) {
    try {
      await deliverWebhook(row.id);
    } catch {
      // Logged; continue with next
    }
    await delay(BASE_DELAY_MS * Math.pow(2, row.attempts));
  }
}
