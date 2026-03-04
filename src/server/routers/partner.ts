import crypto from 'node:crypto';

import { TRPCError } from '@trpc/server';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

import type { DrizzleDB } from '@/db';
import { partnerApiKeys } from '@/db/schema';

import { createTRPCRouter, roleProcedure } from '../trpc';

const ALLOWED_SCOPES = [
  'verifications:read',
  'certificates:read',
  'webhooks:write',
  'students:read',
] as const;

export type AllowedScope = (typeof ALLOWED_SCOPES)[number];

const ApiKeySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  environment: z.string(),
  keyPrefix: z.string(),
  scopes: z.array(z.string()),
  lastUsedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
});

type PartnerApiKeyRow = typeof partnerApiKeys.$inferSelect;

function toApiKey(row: PartnerApiKeyRow): z.infer<typeof ApiKeySchema> {
  return {
    id: row.id,
    name: row.name,
    environment: row.environment,
    keyPrefix: row.keyPrefix,
    scopes: row.scopes,
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function getPartnerProfileId(db: DrizzleDB, userId: string): Promise<string> {
  const profile = await db.query.partnerProfiles.findFirst({
    where: (table, { eq: eqFn }) => eqFn(table.userId, userId),
  });
  if (!profile) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Partner profile not found' });
  }
  return profile.id;
}

export const partnerRouter = createTRPCRouter({
  listApiKeys: roleProcedure('partner')
    .output(z.array(ApiKeySchema))
    .query(async ({ ctx }) => {
      const partnerId = await getPartnerProfileId(ctx.db, ctx.user.id);
      const keys = await ctx.db
        .select()
        .from(partnerApiKeys)
        .where(eq(partnerApiKeys.partnerId, partnerId))
        .orderBy(desc(partnerApiKeys.createdAt));
      return keys.map(toApiKey);
    }),

  createApiKey: roleProcedure('partner')
    .input(
      z.object({
        name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
        environment: z.enum(['production', 'sandbox']),
        scopes: z.array(z.enum(ALLOWED_SCOPES)).min(1, 'Select at least one scope'),
      }),
    )
    .output(
      z.object({
        key: ApiKeySchema,
        plaintext: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const partnerId = await getPartnerProfileId(ctx.db, ctx.user.id);

      const envTag = input.environment === 'production' ? 'live' : 'test';
      const rawKey = `dlk_${envTag}_${crypto.randomBytes(24).toString('hex')}`;
      const keyPrefix = rawKey.slice(0, 16);
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

      const [created] = await ctx.db
        .insert(partnerApiKeys)
        .values({
          partnerId,
          name: input.name,
          environment: input.environment,
          keyHash,
          keyPrefix,
          scopes: input.scopes,
        })
        .returning();

      if (!created) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return { key: toApiKey(created), plaintext: rawKey };
    }),

  revokeApiKey: roleProcedure('partner')
    .input(z.object({ keyId: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const partnerId = await getPartnerProfileId(ctx.db, ctx.user.id);

      const [revoked] = await ctx.db
        .update(partnerApiKeys)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(partnerApiKeys.id, input.keyId),
            eq(partnerApiKeys.partnerId, partnerId),
            isNull(partnerApiKeys.revokedAt),
          ),
        )
        .returning({ id: partnerApiKeys.id });

      if (!revoked) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Key not found or already revoked',
        });
      }
    }),
});
