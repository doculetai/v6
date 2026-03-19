import { NextResponse } from 'next/server';

import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db';
import {
  certificates,
  partnerStudents,
  studentProfiles,
} from '@/db/schema';
import {
  authenticatePartnerApiKey,
  getApiKeyFromRequest,
  requireScope,
} from '@/lib/partner-api-auth';
import { withRateLimit } from '@/lib/partner-api-rate-limit';

export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ studentId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { studentId } = await params;

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

  const linked = await db.query.partnerStudents.findFirst({
    where: and(
      eq(partnerStudents.partnerId, auth.partnerId),
      eq(partnerStudents.studentId, studentId),
    ),
    columns: { tier: true, verifiedAt: true },
  });

  if (!linked) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Student not linked to this partner' },
      { status: 404 },
    );
  }

  const [profile] = await db
    .select({
      kycStatus: studentProfiles.kycStatus,
      bankStatus: studentProfiles.bankStatus,
    })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, studentId))
    .limit(1);

  const [cert] = await db
    .select({
      issuedAt: certificates.issuedAt,
      status: certificates.status,
    })
    .from(certificates)
    .where(
      and(
        eq(certificates.studentId, studentId),
        eq(certificates.status, 'active'),
      ),
    )
    .orderBy(desc(certificates.issuedAt))
    .limit(1);

  return NextResponse.json({
    studentId,
    tier: linked.tier,
    verifiedAt: linked.verifiedAt.toISOString(),
    kycStatus: profile?.kycStatus ?? null,
    bankStatus: profile?.bankStatus ?? null,
    certificateStatus: cert?.status ?? null,
    certificateIssuedAt: cert?.issuedAt?.toISOString() ?? null,
  });
}
