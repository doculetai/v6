import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';

import { insertAuditLog } from '@/db/queries/audit-log';
import { getExportDataForUser } from '@/db/queries/export-data';
import { consents, documents, profiles, userSessions, users } from '@/db/schema';
import { sendDataExportReadyEmail } from '@/lib/email/send-data-export-ready-email';
import { removeDocumentFile, removeUserExportFiles } from '@/lib/storage';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const consentTypeSchema = z.enum(['terms', 'privacy', 'marketing']);

export const accountRouter = createTRPCRouter({
  /** Record user consent (terms, privacy, marketing). NDPR/GDPR. */
  recordConsent: protectedProcedure
    .input(
      z.object({
        type: consentTypeSchema,
        version: z.string().min(1),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(consents).values({
        userId: ctx.user!.id,
        type: input.type,
        version: input.version,
      });
    }),

  /** List user's consents by type (latest per type). */
  listConsents: protectedProcedure
    .output(
      z.array(
        z.object({
          type: z.enum(['terms', 'privacy', 'marketing']),
          version: z.string(),
          acceptedAt: z.date(),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      const rows = await ctx.db
        .select({ type: consents.type, version: consents.version, acceptedAt: consents.acceptedAt })
        .from(consents)
        .where(eq(consents.userId, ctx.user!.id))
        .orderBy(desc(consents.acceptedAt));
      return rows.map((r) => ({
        type: r.type as 'terms' | 'privacy' | 'marketing',
        version: r.version,
        acceptedAt: r.acceptedAt,
      }));
    }),
  /** Request a data export. Sends JSON export via email. */
  requestDataExport: protectedProcedure
    .output(z.void())
    .mutation(async ({ ctx }) => {
      const { db, user } = ctx;

      const userRow = await db.query.users.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.id, user!.id),
        columns: { email: true },
      });

      if (!userRow?.email) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No email address on file.' });
      }

      const exportData = await getExportDataForUser(db, user!.id);

      // TODO: store export as a blob and send a signed URL instead of inline data
      const downloadUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;

      await sendDataExportReadyEmail(userRow.email, downloadUrl);
    }),

  deactivateAccount: protectedProcedure
    .output(z.void())
    .mutation(async ({ ctx }) => {
      const { db, user } = ctx;

      const [profile] = await db
        .select({ id: profiles.id, deactivatedAt: profiles.deactivatedAt })
        .from(profiles)
        .where(eq(profiles.userId, user!.id))
        .limit(1);

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
      }
      if (profile.deactivatedAt) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Account is already closed' });
      }

      await db
        .update(profiles)
        .set({ deactivatedAt: new Date(), updatedAt: new Date() })
        .where(eq(profiles.userId, user!.id));

      await db.delete(userSessions).where(eq(userSessions.userId, user!.id));

      await insertAuditLog(db, {
        actorId: user!.id,
        action: 'account.deactivate',
        entityType: 'profile',
        entityId: profile.id,
        meta: {},
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      });
    }),

  /** Permanently delete account and all data. Right-to-erasure. Requires deactivation. */
  deleteMyData: protectedProcedure
    .output(z.void())
    .mutation(async ({ ctx }) => {
      const { db, user } = ctx;

      const [profile] = await db
        .select({ id: profiles.id, deactivatedAt: profiles.deactivatedAt })
        .from(profiles)
        .where(eq(profiles.userId, user!.id))
        .limit(1);

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
      }
      if (!profile.deactivatedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Account must be deactivated before permanent deletion',
        });
      }

      const userDocs = await db
        .select({ storageUrl: documents.storageUrl })
        .from(documents)
        .where(eq(documents.userId, user!.id));

      for (const doc of userDocs) {
        await removeDocumentFile(doc.storageUrl);
      }
      await removeUserExportFiles(user!.id);

      await db.delete(userSessions).where(eq(userSessions.userId, user!.id));
      await db.delete(users).where(eq(users.id, user!.id));

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseServiceRoleKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        await supabase.auth.admin.deleteUser(user!.id);
      }
    }),
});
