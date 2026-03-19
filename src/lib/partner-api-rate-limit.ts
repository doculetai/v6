import { NextResponse } from 'next/server';

import { db } from '@/db';
import { checkAndIncrementUsage } from '@/db/queries/api-usage';

import type { PartnerApiAuth } from './partner-api-auth';

const DAILY_LIMIT = parseInt(process.env.PARTNER_API_DAILY_LIMIT ?? '10000', 10);

export function getEndpointFromRequest(request: Request): string {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path.startsWith('/api/partner/v1/')) {
    return path.slice('/api/partner/v1/'.length) || 'unknown';
  }
  return 'unknown';
}

export async function withRateLimit(
  auth: PartnerApiAuth,
  request: Request,
): Promise<NextResponse | null> {
  const endpoint = getEndpointFromRequest(request);
  const result = await checkAndIncrementUsage(db, {
    partnerId: auth.partnerId,
    keyId: auth.keyId,
    endpoint,
    limit: DAILY_LIMIT,
  });

  if (!result.allowed) {
    const retryAfterSeconds = 60;
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        retryAfter: retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  return null;
}
