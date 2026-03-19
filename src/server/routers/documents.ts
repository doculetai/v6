import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { documents } from '@/db/schema';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const storageBucketName = process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'documents';
const allowedRoles = ['student', 'university', 'admin', 'agent'] as const;

function getStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Storage not configured',
    });
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const documentsRouter = createTRPCRouter({
  getDocumentSignedUrl: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .output(z.object({ url: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
        columns: { role: true },
      });
      if (!profile || !allowedRoles.includes(profile.role as (typeof allowedRoles)[number])) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const doc = await ctx.db.query.documents.findFirst({
        where: eq(documents.id, input.documentId),
      });
      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }

      const role = profile.role as (typeof allowedRoles)[number];

      if (role === 'student') {
        if (doc.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      } else if (role === 'university') {
        const uniProfile = await ctx.db.query.universityProfiles.findFirst({
          where: (t, { eq: eqFn }) => eqFn(t.userId, ctx.user!.id),
          columns: { schoolId: true },
        });
        if (!uniProfile?.schoolId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        const studentProfile = await ctx.db.query.studentProfiles.findFirst({
          where: (t, { eq: eqFn }) => eqFn(t.userId, doc.userId),
          columns: { schoolId: true },
        });
        if (!studentProfile || studentProfile.schoolId !== uniProfile.schoolId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      }
      // admin | agent: allow any

      const storage = getStorageClient();
      const { data, error } = await storage.storage
        .from(storageBucketName)
        .createSignedUrl(doc.storageUrl, 3600);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate signed URL',
        });
      }
      if (!data?.signedUrl) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No signed URL returned',
        });
      }

      return { url: data.signedUrl };
    }),
});
