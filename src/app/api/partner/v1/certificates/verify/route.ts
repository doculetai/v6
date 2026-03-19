import { NextResponse } from 'next/server';

import { api } from '@/trpc/server';
import {
  authenticatePartnerApiKey,
  getApiKeyFromRequest,
  requireScope,
} from '@/lib/partner-api-auth';
import { withRateLimit } from '@/lib/partner-api-rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const rawKey = getApiKeyFromRequest(request);
  const auth = await authenticatePartnerApiKey(rawKey);

  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Valid API key required' },
      { status: 401 },
    );
  }

  if (!requireScope(auth, 'certificatesRead')) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'API key lacks certificatesRead scope' },
      { status: 403 },
    );
  }

  const rateLimitResponse = await withRateLimit(auth, request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token?.trim()) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Query parameter "token" is required' },
      { status: 400 },
    );
  }

  try {
    const caller = await api();
    const result = await caller.certificate.verifyByToken({ token: token.trim() });

    return NextResponse.json({
      found: result.found,
      valid: result.valid,
      holderLabel: result.holderLabel,
      schoolName: result.schoolName,
      programName: result.programName,
      amountKobo: result.amountKobo,
      currency: result.currency,
      issuedAt: result.issuedAt,
      validUntil: result.validUntil,
      tier: result.tier,
      status: result.status,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Verification failed' },
      { status: 500 },
    );
  }
}
