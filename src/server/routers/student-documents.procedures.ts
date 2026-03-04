import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { documents } from '@/db/schema';
import {
  maxDocumentUploadSizeBytes,
  studentDocumentStatusValues,
  studentDocumentTypeValues,
  supportedDocumentMimeTypes,
} from '@/lib/documents';

import { roleProcedure } from '../trpc';

const storageBucketName = process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'documents';
const storageUploadErrorMessage = 'Unable to upload document right now';

const studentDocumentOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(studentDocumentTypeValues),
  storageUrl: z.string(),
  status: z.enum(studentDocumentStatusValues),
  rejectionReason: z.string().nullable(),
  reviewedAt: z.date().nullable(),
  reviewedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const uploadDocumentInputSchema = z.object({
  documentType: z.enum(studentDocumentTypeValues),
  fileName: z.string().min(1).max(120),
  mimeType: z.enum(supportedDocumentMimeTypes),
  fileSizeBytes: z.number().int().positive().max(maxDocumentUploadSizeBytes),
  fileBase64: z.string().min(1).max(12 * 1024 * 1024),
});

function getStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: storageUploadErrorMessage });
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

function getFileExtensionFromMimeType(mimeType: (typeof supportedDocumentMimeTypes)[number]) {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/png') return 'png';
  return 'jpg';
}

function decodeFileBase64(fileBase64: string, expectedSize: number) {
  const normalizedBase64 = fileBase64.replace(/\s/g, '');

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalizedBase64)) {
    throw new TRPCError({ code: 'BAD_REQUEST' });
  }

  const fileBuffer = Buffer.from(normalizedBase64, 'base64');

  if (fileBuffer.byteLength !== expectedSize) {
    throw new TRPCError({ code: 'BAD_REQUEST' });
  }

  return fileBuffer;
}

export const documentProcedures = {
  listDocuments: roleProcedure('student')
    .output(z.array(studentDocumentOutputSchema))
    .query(async ({ ctx }) => {
      const studentDocuments = await ctx.db.query.documents.findMany({
        where: eq(documents.userId, ctx.user.id),
        orderBy: [desc(documents.createdAt)],
      });

      return studentDocuments;
    }),

  uploadDocument: roleProcedure('student')
    .input(uploadDocumentInputSchema)
    .output(studentDocumentOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const fileBuffer = decodeFileBase64(input.fileBase64, input.fileSizeBytes);
      const storageClient = getStorageClient();
      const now = new Date();
      const extension = getFileExtensionFromMimeType(input.mimeType);
      const sanitizedName = sanitizeFileName(input.fileName) || `document.${extension}`;
      const storagePath = `${ctx.user.id}/${now.toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID()}-${sanitizedName}`;

      const { error: uploadError } = await storageClient.storage
        .from(storageBucketName)
        .upload(storagePath, fileBuffer, { contentType: input.mimeType, upsert: false });

      if (uploadError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: storageUploadErrorMessage });
      }

      try {
        const [createdDocument] = await ctx.db
          .insert(documents)
          .values({ userId: ctx.user.id, type: input.documentType, storageUrl: storagePath, status: 'pending' })
          .returning();

        if (!createdDocument) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: storageUploadErrorMessage });
        }

        return createdDocument;
      } catch {
        await storageClient.storage.from(storageBucketName).remove([storagePath]);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: storageUploadErrorMessage });
      }
    }),
};
