import { createHash } from 'node:crypto';

import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/db';
import { partnerApiKeys } from '@/db/schema';

export type PartnerApiAuth = {
  partnerId: string;
  keyId: string;
  scopes: string[];
};

export async function authenticatePartnerApiKey(
  rawKey: string | null,
): Promise<PartnerApiAuth | null> {
  if (!rawKey?.trim()) return null;

  const trimmed = rawKey.trim();
  if (!trimmed.startsWith('pk_live_')) return null;

  const keyHash = createHash('sha256').update(trimmed).digest('hex');

  const [row] = await db
    .select({
      partnerId: partnerApiKeys.partnerId,
      keyId: partnerApiKeys.id,
      scopes: partnerApiKeys.scopes,
    })
    .from(partnerApiKeys)
    .where(
      and(eq(partnerApiKeys.keyHash, keyHash), isNull(partnerApiKeys.revokedAt)),
    )
    .limit(1);

  if (!row) return null;

  await db
    .update(partnerApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(partnerApiKeys.keyHash, keyHash));

  return { partnerId: row.partnerId, keyId: row.keyId, scopes: row.scopes };
}

export function getApiKeyFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return request.headers.get('X-API-Key')?.trim() ?? null;
}

export function requireScope(auth: PartnerApiAuth, scope: string): boolean {
  return auth.scopes.includes(scope) || auth.scopes.includes('*');
}
