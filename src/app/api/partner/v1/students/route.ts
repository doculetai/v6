import { NextResponse } from 'next/server';

import { db } from '@/db';
import {
  authenticatePartnerApiKey,
  getApiKeyFromRequest,
  requireScope,
} from '@/lib/partner-api-auth';
import { withRateLimit } from '@/lib/partner-api-rate-limit';
import { listPartnerStudents } from '@/db/queries/partner';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const rawKey = getApiKeyFromRequest(request);
  const auth = await authenticatePartnerApiKey(rawKey);

  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Valid API key required' },
      { status: 401 },
    );
  }

  if (!requireScope(auth, 'studentsRead')) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'API key lacks studentsRead scope' },
      { status: 403 },
    );
  }

  const rateLimitResponse = await withRateLimit(auth, request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limitParam = searchParams.get('limit');
  const limit = Math.min(
    Math.max(1, parseInt(limitParam ?? '', 10) || DEFAULT_LIMIT),
    MAX_LIMIT,
  );

  const students = await listPartnerStudents(db, auth.partnerId);

  const startIndex = cursor
    ? students.findIndex((s) => s.id === cursor)
    : 0;
  const fromIndex = startIndex < 0 ? 0 : startIndex;
  const page = students.slice(fromIndex, fromIndex + limit);
  const nextCursor =
    fromIndex + limit < students.length ? page[page.length - 1]?.id : null;

  return NextResponse.json({
    students: page.map((s) => ({
      studentId: s.studentId,
      id: s.id,
      tier: s.tier,
      verifiedAt: s.verifiedAt.toISOString(),
      schoolName: s.schoolName,
    })),
    nextCursor,
  });
}
