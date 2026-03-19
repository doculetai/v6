import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

export const DOCUMENTS_BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'documents';

/** Path prefix for data export ZIPs. Stored in documents bucket. */
export const EXPORTS_PREFIX = 'exports';

let storageClient: SupabaseClient | null = null;

/** Service-role Supabase client for Storage. Use for server-side operations only. */
export function getSupabaseStorageClient(): SupabaseClient {
  if (storageClient) return storageClient;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Storage not configured',
    });
  }
  storageClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return storageClient;
}

/**
 * Remove a document file from Storage. Call before deleting the document row
 * so orphans are avoided if DB delete fails. Treats "object not found" as
 * success (idempotent delete); rethrows other errors.
 */
export async function removeDocumentFile(storagePath: string): Promise<void> {
  const storage = getSupabaseStorageClient();
  const { error } = await storage.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
  if (!error) return;
  const isNotFound =
    error.message?.toLowerCase().includes('not found') ||
    error.message?.toLowerCase().includes('does not exist') ||
    (error as { code?: string }).code === 'NoSuchKey' ||
    (error as { statusCode?: number }).statusCode === 404;
  if (isNotFound) return;
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Failed to remove document from storage',
  });
}

/**
 * Upload a data export ZIP and return the storage path.
 * Path: exports/{userId}/{timestamp}.zip
 */
export async function uploadExportZip(
  userId: string,
  zipBuffer: ArrayBuffer,
): Promise<string> {
  const storage = getSupabaseStorageClient();
  const timestamp = Date.now();
  const path = `${EXPORTS_PREFIX}/${userId}/${timestamp}.zip`;
  const { error } = await storage.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, zipBuffer, { contentType: 'application/zip', upsert: true });
  if (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to upload export',
    });
  }
  return path;
}

/**
 * Create a signed URL for a data export ZIP. 24h expiry.
 */
export async function createExportSignedUrl(storagePath: string): Promise<string> {
  const storage = getSupabaseStorageClient();
  const expiresIn = 86400; // 24 hours
  const { data, error } = await storage.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error || !data?.signedUrl) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create download link',
    });
  }
  return data.signedUrl;
}

/**
 * Remove all export ZIPs for a user. Call before user deletion.
 */
export async function removeUserExportFiles(userId: string): Promise<void> {
  const storage = getSupabaseStorageClient();
  const folderPath = `${EXPORTS_PREFIX}/${userId}`;
  const { data: files } = await storage.storage.from(DOCUMENTS_BUCKET).list(folderPath, { limit: 100 });
  if (!files?.length) return;
  const paths = files.filter((f) => f.name).map((f) => `${folderPath}/${f.name}`);
  await storage.storage.from(DOCUMENTS_BUCKET).remove(paths);
}
