import crypto from 'crypto';

import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { partnerWebhookConfigs } from '@/db/schema/webhook-deliveries';

import { createTRPCRouter, roleProcedure } from '../trpc';

const WEBHOOK_EVENTS = ['cert_issued', 'doc_approved', 'doc_rejected', 'kyc_complete'] as const;

const WebhookOutputSchema = z.object({
  id: z.string(),
  url: z.string(),
  events: z.array(z.string()),
  description: z.string().nullable(),
  enabled: z.boolean(),
  createdAt: z.date().nullable(),
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
      const partner = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!partner) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });
      }

      const secret = crypto.randomBytes(32).toString('hex');
      const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

      const [webhook] = await ctx.db
        .insert(partnerWebhookConfigs)
        .values({
          partnerId: partner.id,
          url: input.url,
          secretHash,
          events: input.events,
          description: input.description ?? null,
          enabled: true,
        })
        .returning({ id: partnerWebhookConfigs.id });

      if (!webhook) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create webhook.' });
      }

      return { id: webhook.id, secret };
    }),

  listWebhooks: roleProcedure('partner')
    .output(z.array(WebhookOutputSchema))
    .query(async ({ ctx }) => {
      const partner = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!partner) return [];

      const rows = await ctx.db.query.partnerWebhookConfigs.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.partnerId, partner.id),
        columns: {
          id: true,
          url: true,
          events: true,
          description: true,
          enabled: true,
          createdAt: true,
        },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      return rows.map((r) => ({
        id: r.id,
        url: r.url,
        events: r.events,
        description: r.description ?? null,
        enabled: r.enabled,
        createdAt: r.createdAt,
      }));
    }),

  updateWebhook: roleProcedure('partner')
    .input(
      z.object({
        webhookId: z.string().uuid(),
        url: z.string().url().optional(),
        enabled: z.boolean().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const partner = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!partner) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner not found.' });
      }

      const updates: Partial<{ url: string; enabled: boolean; updatedAt: Date }> = {
        updatedAt: new Date(),
      };
      if (input.url !== undefined) updates.url = input.url;
      if (input.enabled !== undefined) updates.enabled = input.enabled;

      await ctx.db
        .update(partnerWebhookConfigs)
        .set(updates)
        .where(
          and(
            eq(partnerWebhookConfigs.id, input.webhookId),
            eq(partnerWebhookConfigs.partnerId, partner.id),
          ),
        );
    }),

  deleteWebhook: roleProcedure('partner')
    .input(z.object({ webhookId: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const partner = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!partner) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner not found.' });
      }

      await ctx.db
        .delete(partnerWebhookConfigs)
        .where(
          and(
            eq(partnerWebhookConfigs.id, input.webhookId),
            eq(partnerWebhookConfigs.partnerId, partner.id),
          ),
        );
    }),

  sendTestDelivery: roleProcedure('partner')
    .input(z.object({ webhookId: z.string().uuid() }))
    .output(z.object({ statusCode: z.number().nullable(), success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const partner = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!partner) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner not found.' });
      }

      const webhook = await ctx.db.query.partnerWebhookConfigs.findFirst({
        where: (t, { and: andFn, eq: eqFn }) =>
          andFn(eqFn(t.id, input.webhookId), eqFn(t.partnerId, partner.id)),
      });
      if (!webhook) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Webhook not found.' });
      }

      try {
        const payload = JSON.stringify({ event: 'test', timestamp: new Date().toISOString() });
        const signature = crypto
          .createHmac('sha256', webhook.secretHash)
          .update(payload)
          .digest('hex');

        const res = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Doculet-Signature': signature,
          },
          body: payload,
          signal: AbortSignal.timeout(10_000),
        });

        return { statusCode: res.status, success: res.ok };
      } catch {
        return { statusCode: null, success: false };
      }
    }),
});
