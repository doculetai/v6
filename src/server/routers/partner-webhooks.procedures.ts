import crypto from 'node:crypto';

import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { partnerProfiles, partnerWebhookConfigs, webhookDeliveries } from '@/db/schema';
import { createTRPCRouter, roleProcedure } from '../trpc';

const WEBHOOK_EVENTS = ['cert_issued', 'doc_approved', 'doc_rejected', 'kyc_complete'] as const;
type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

const WebhookConfigOutputSchema = z.object({
  id: z.string(),
  url: z.string(),
  events: z.array(z.enum(WEBHOOK_EVENTS)),
  description: z.string().nullable(),
  enabled: z.boolean(),
  createdAt: z.date(),
});

const WebhookDeliveryOutputSchema = z.object({
  id: z.string(),
  eventType: z.string(),
  url: z.string(),
  status: z.enum(['pending', 'delivered', 'failed']),
  attempts: z.number(),
  responseStatus: z.number().nullable(),
  createdAt: z.date(),
});

export const partnerWebhooksRouter = createTRPCRouter({
  registerWebhook: roleProcedure('partner')
    .input(
      z.object({
        url: z.string().url(),
        events: z.array(z.enum(WEBHOOK_EVENTS)).min(1),
        description: z.string().max(200).optional(),
      }),
    )
    .output(z.object({ id: z.string(), secret: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { id: true },
      });
      if (!partnerProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });
      }

      // Generate a random signing secret. Stored directly so the server can
      // sign outgoing webhook payloads with the same key the partner uses to
      // verify them. Partners treat this value as their HMAC verification key.
      const secret = crypto.randomBytes(32).toString('hex');

      const [row] = await ctx.db
        .insert(partnerWebhookConfigs)
        .values({
          partnerId: partnerProfile.id,
          url: input.url,
          secretHash: secret,
          events: input.events,
          description: input.description ?? null,
        })
        .returning({ id: partnerWebhookConfigs.id });

      return { id: row.id, secret };
    }),

  updateWebhook: roleProcedure('partner')
    .input(
      z.object({
        webhookId: z.string().uuid(),
        url: z.string().url().optional(),
        enabled: z.boolean().optional(),
        events: z.array(z.enum(WEBHOOK_EVENTS)).min(1).optional(),
        description: z.string().max(200).optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { id: true },
      });
      if (!partnerProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });
      }

      const config = await ctx.db.query.partnerWebhookConfigs.findFirst({
        where: (t, { eq: eqFn, and: andFn }) =>
          andFn(eqFn(t.id, input.webhookId), eqFn(t.partnerId, partnerProfile.id)),
        columns: { id: true },
      });
      if (!config) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Webhook not found.' });
      }

      const updates: Partial<typeof partnerWebhookConfigs.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (input.url !== undefined) updates.url = input.url;
      if (input.enabled !== undefined) updates.enabled = input.enabled;
      if (input.events !== undefined) updates.events = input.events;
      if (input.description !== undefined) updates.description = input.description;

      await ctx.db
        .update(partnerWebhookConfigs)
        .set(updates)
        .where(
          and(
            eq(partnerWebhookConfigs.id, input.webhookId),
            eq(partnerWebhookConfigs.partnerId, partnerProfile.id),
          ),
        );
    }),

  listWebhooks: roleProcedure('partner')
    .output(z.array(WebhookConfigOutputSchema))
    .query(async ({ ctx }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { id: true },
      });
      if (!partnerProfile) return [];

      const rows = await ctx.db.query.partnerWebhookConfigs.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.partnerId, partnerProfile.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      return rows.map((r) => ({
        id: r.id,
        url: r.url,
        events: r.events as WebhookEvent[],
        description: r.description ?? null,
        enabled: r.enabled,
        createdAt: r.createdAt,
      }));
    }),

  deleteWebhook: roleProcedure('partner')
    .input(z.object({ webhookId: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { id: true },
      });
      if (!partnerProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });
      }

      await ctx.db
        .delete(partnerWebhookConfigs)
        .where(
          and(
            eq(partnerWebhookConfigs.id, input.webhookId),
            eq(partnerWebhookConfigs.partnerId, partnerProfile.id),
          ),
        );
    }),

  sendTestDelivery: roleProcedure('partner')
    .input(z.object({ webhookId: z.string().uuid() }))
    .output(z.object({ statusCode: z.number().nullable(), success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { id: true },
      });
      if (!partnerProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });
      }

      const config = await ctx.db.query.partnerWebhookConfigs.findFirst({
        where: (t, { eq: eqFn, and: andFn }) =>
          andFn(eqFn(t.id, input.webhookId), eqFn(t.partnerId, partnerProfile.id)),
      });
      if (!config) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Webhook not found.' });
      }

      const payload = JSON.stringify({
        event: 'test',
        webhookId: config.id,
        timestamp: new Date().toISOString(),
      });
      const signature = crypto
        .createHmac('sha256', config.secretHash)
        .update(payload)
        .digest('hex');

      let statusCode: number | null = null;
      let success = false;

      try {
        const response = await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Doculet-Signature': `sha256=${signature}`,
          },
          body: payload,
          signal: AbortSignal.timeout(10_000),
        });
        statusCode = response.status;
        success = response.ok;
      } catch {
        // Network error — statusCode stays null, success stays false
      }

      await ctx.db.insert(webhookDeliveries).values({
        partnerId: partnerProfile.id,
        eventType: 'test',
        payloadHash: crypto.createHash('sha256').update(payload).digest('hex'),
        payloadJson: { event: 'test', webhookId: config.id },
        url: config.url,
        status: success ? 'delivered' : 'failed',
        attempts: 1,
        lastAttemptAt: new Date(),
        responseStatus: statusCode,
      });

      return { statusCode, success };
    }),

  listDeliveries: roleProcedure('partner')
    .input(z.object({ webhookId: z.string().uuid() }))
    .output(z.array(WebhookDeliveryOutputSchema))
    .query(async ({ ctx, input }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user.id),
        columns: { id: true },
      });
      if (!partnerProfile) return [];

      const config = await ctx.db.query.partnerWebhookConfigs.findFirst({
        where: (t, { eq: eqFn, and: andFn }) =>
          andFn(eqFn(t.id, input.webhookId), eqFn(t.partnerId, partnerProfile.id)),
        columns: { id: true, url: true },
      });
      if (!config) return [];

      const rows = await ctx.db.query.webhookDeliveries.findMany({
        where: (t, { eq: eqFn, and: andFn }) =>
          andFn(eqFn(t.partnerId, partnerProfile.id), eqFn(t.url, config.url)),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        limit: 50,
      });

      return rows.map((r) => ({
        id: r.id,
        eventType: r.eventType,
        url: r.url,
        status: r.status,
        attempts: r.attempts,
        responseStatus: r.responseStatus ?? null,
        createdAt: r.createdAt,
      }));
    }),
});
