import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { getPartnerUsageToday } from '@/db/queries/partner-api-usage';
import { listPartnerStudents } from '@/db/queries/partner';
import { partnerApiKeys, partnerProfiles } from '@/db/schema';

import { createTRPCRouter, roleProcedure } from '../trpc';

const PartnerStudentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  tier: z.number().int().min(1).max(3),
  verifiedAt: z.date(),
  schoolName: z.string().nullable(),
});

export const partnerRouter = createTRPCRouter({
  listStudents: roleProcedure('partner')
    .output(z.array(PartnerStudentSchema))
    .query(async ({ ctx }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (table, { eq: eqFn }) => eqFn(table.userId, ctx.user!.id),
      });

      if (!partnerProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found' });
      }

      return listPartnerStudents(ctx.db, partnerProfile.id);
    }),

  getPartnerOverview: roleProcedure('partner')
    .output(
      z.object({
        totalStudents: z.number(),
        verifiedStudents: z.number(),
        activeApiKeys: z.number(),
        organizationName: z.string(),
        apiCallsToday: z.number(),
        apiDailyLimit: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
      });

      if (!partnerProfile) {
        return {
          totalStudents: 0,
          verifiedStudents: 0,
          activeApiKeys: 0,
          organizationName: 'Partner',
          apiCallsToday: 0,
          apiDailyLimit: 10_000,
        };
      }

      const [students, apiKeys, usage] = await Promise.all([
        ctx.db.query.partnerStudents.findMany({
          where: (t, { eq: eqFn }) => eqFn(t.partnerId, partnerProfile.id),
          columns: { tier: true },
        }),
        ctx.db.query.partnerApiKeys.findMany({
          where: (t, { and: andFn, eq: eqFn, isNull: isNullFn }) =>
            andFn(eqFn(t.partnerId, partnerProfile.id), isNullFn(t.revokedAt)),
          columns: { id: true },
        }),
        getPartnerUsageToday(ctx.db, partnerProfile.id),
      ]);

      const apiDailyLimit = parseInt(process.env.PARTNER_API_DAILY_LIMIT ?? '10000', 10);

      return {
        totalStudents: students.length,
        verifiedStudents: students.filter((s) => s.tier >= 2).length,
        activeApiKeys: apiKeys.length,
        organizationName: partnerProfile.organizationName,
        apiCallsToday: usage.total,
        apiDailyLimit,
      };
    }),

  getApiUsage: roleProcedure('partner')
    .output(
      z.object({
        total: z.number(),
        dailyLimit: z.number(),
        byEndpoint: z.array(z.object({ endpoint: z.string(), requestCount: z.number() })),
      }),
    )
    .query(async ({ ctx }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });

      if (!partnerProfile) {
        return { total: 0, dailyLimit: 10_000, byEndpoint: [] };
      }

      const usage = await getPartnerUsageToday(ctx.db, partnerProfile.id);
      const dailyLimit = parseInt(process.env.PARTNER_API_DAILY_LIMIT ?? '10000', 10);

      return {
        total: usage.total,
        dailyLimit,
        byEndpoint: usage.byEndpoint,
      };
    }),

  listApiKeys: roleProcedure('partner')
    .output(
      z.array(
        z.object({
          id: z.string(),
          keyPrefix: z.string(),
          scopes: z.array(z.string()),
          lastUsedAt: z.date().nullable(),
          revokedAt: z.date().nullable(),
          createdAt: z.date(),
          isActive: z.boolean(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!partnerProfile) return [];

      const keys = await ctx.db.query.partnerApiKeys.findMany({
        where: (t, { eq: eqFn }) => eqFn(t.partnerId, partnerProfile.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });

      return keys.map((k) => ({
        id: k.id,
        keyPrefix: k.keyPrefix,
        scopes: k.scopes,
        lastUsedAt: k.lastUsedAt ?? null,
        revokedAt: k.revokedAt ?? null,
        createdAt: k.createdAt,
        isActive: k.revokedAt === null,
      }));
    }),

  createApiKey: roleProcedure('partner')
    .input(z.object({
      scopes: z.array(z.enum(['students:read', 'certificates:verify', 'certificates:read', 'students:write'])).min(1),
    }))
    .output(
      z.object({
        id: z.string(),
        keyPrefix: z.string(),
        rawKey: z.string(),
        scopes: z.array(z.string()),
        createdAt: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!partnerProfile) throw new TRPCError({ code: 'NOT_FOUND' });

      const rawKey = `pk_live_${crypto.randomUUID().replace(/-/g, '')}`;
      // keyPrefix: first 16 chars to give a recognisable hint without revealing the full key
      const keyPrefix = rawKey.slice(0, 16);

      const { createHash } = await import('node:crypto');
      const keyHash = createHash('sha256').update(rawKey).digest('hex');

      const [created] = await ctx.db
        .insert(partnerApiKeys)
        .values({
          partnerId: partnerProfile.id,
          keyHash,
          keyPrefix,
          scopes: input.scopes,
        })
        .returning();

      if (!created) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      return {
        id: created.id,
        keyPrefix: created.keyPrefix,
        rawKey, // only time this is returned to the caller
        scopes: created.scopes,
        createdAt: created.createdAt,
      };
    }),

  revokeApiKey: roleProcedure('partner')
    .input(z.object({ keyId: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const partnerProfile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!partnerProfile) throw new TRPCError({ code: 'NOT_FOUND' });

      await ctx.db
        .update(partnerApiKeys)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(partnerApiKeys.id, input.keyId),
            eq(partnerApiKeys.partnerId, partnerProfile.id),
          ),
        );
    }),

  getPartnerBranding: roleProcedure('partner')
    .output(
      z.object({
        brandLogoUrl: z.string().nullable(),
        brandColor: z.string().nullable(),
        organizationName: z.string(),
        webhookUrl: z.string().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
      });
      if (!profile) {
        return { brandLogoUrl: null, brandColor: null, organizationName: 'Partner', webhookUrl: null };
      }
      return {
        brandLogoUrl: profile.brandLogoUrl ?? null,
        brandColor: profile.brandColor ?? null,
        organizationName: profile.organizationName,
        webhookUrl: profile.webhookUrl ?? null,
      };
    }),

  updatePartnerBranding: roleProcedure('partner')
    .input(
      z.object({
        brandLogoUrl: z.string().url().nullable().optional(),
        brandColor: z
          .string()
          .regex(/^#[0-9a-fA-F]{6}$/)
          .nullable()
          .optional(),
        webhookUrl: z.string().url().nullable().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });

      await ctx.db
        .update(partnerProfiles)
        .set({
          ...(input.brandLogoUrl !== undefined && { brandLogoUrl: input.brandLogoUrl }),
          ...(input.brandColor !== undefined && { brandColor: input.brandColor }),
          ...(input.webhookUrl !== undefined && { webhookUrl: input.webhookUrl }),
          updatedAt: new Date(),
        })
        .where(eq(partnerProfiles.userId, ctx.user!.id));
    }),

  getPartnerSettings: roleProcedure('partner')
    .output(
      z.object({
        organizationName: z.string(),
        webhookUrl: z.string().nullable(),
        webhookSigningSecretConfigured: z.boolean(),
        brandColor: z.string().nullable(),
        brandLogoUrl: z.string().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      const profile = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
      });
      if (!profile) {
        return {
          organizationName: 'Partner',
          webhookUrl: null,
          webhookSigningSecretConfigured: false,
          brandColor: null,
          brandLogoUrl: null,
        };
      }
      return {
        organizationName: profile.organizationName,
        webhookUrl: profile.webhookUrl ?? null,
        webhookSigningSecretConfigured: Boolean(profile.webhookSigningSecret),
        brandColor: profile.brandColor ?? null,
        brandLogoUrl: profile.brandLogoUrl ?? null,
      };
    }),

  updatePartnerSettings: roleProcedure('partner')
    .input(
      z.object({
        organizationName: z.string().min(2).max(120).optional(),
        webhookUrl: z.string().url().nullable().optional(),
        webhookSigningSecret: z.string().min(16).nullable().optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.partnerProfiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { id: true },
      });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Partner profile not found.' });

      await ctx.db
        .update(partnerProfiles)
        .set({
          ...(input.organizationName !== undefined && { organizationName: input.organizationName }),
          ...(input.webhookUrl !== undefined && { webhookUrl: input.webhookUrl }),
          ...(input.webhookSigningSecret !== undefined && {
            webhookSigningSecret: input.webhookSigningSecret,
          }),
          updatedAt: new Date(),
        })
        .where(eq(partnerProfiles.userId, ctx.user!.id));
    }),
});
