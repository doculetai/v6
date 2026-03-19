import { renderToBuffer } from '@react-pdf/renderer';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { certificates } from '@/db/schema';
import {
  CertificateDocument,
  type CertificatePdfData,
  generateQrDataUri,
} from '@/lib/certificate-pdf';
import { env } from '@/lib/env';

type RouteParams = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { token } = await params;

  // Look up the certificate
  const cert = await db.query.certificates.findFirst({
    where: eq(certificates.token, token),
    columns: {
      id: true,
      issuedAt: true,
      validUntil: true,
      status: true,
      studentId: true,
      sponsorshipId: true,
    },
    with: {
      student: {
        columns: { email: true },
        with: {
          profile: {
            columns: { fullName: true },
          },
        },
      },
    },
  });

  if (!cert || cert.status !== 'active') {
    return NextResponse.json(
      { error: 'Certificate not found or revoked' },
      { status: 404 },
    );
  }

  // Get student profile with school/program
  const sp = await db.query.studentProfiles.findFirst({
    where: (t, { eq: eq_ }) => eq_(t.userId, cert.studentId),
    columns: { fundingType: true },
    with: {
      school: { columns: { name: true } },
      program: { columns: { name: true, tuitionAmount: true, currency: true } },
    },
  });

  if (!sp?.school || !sp?.program) {
    return NextResponse.json(
      { error: 'Incomplete student profile' },
      { status: 422 },
    );
  }

  // Get sponsor info if certificate is linked to a sponsorship
  let sponsorName: string | null = null;
  let sponsorType: string | null = null;

  if (cert.sponsorshipId) {
    const sponsorship = await db.query.sponsorships.findFirst({
      where: (t, { eq: eq_ }) => eq_(t.id, cert.sponsorshipId!),
      columns: { relationship: true, sponsorId: true },
    });

    if (sponsorship) {
      const sponsorProfile = await db.query.profiles.findFirst({
        where: (t, { eq: eq_ }) => eq_(t.userId, sponsorship.sponsorId),
        columns: { fullName: true },
      });
      sponsorName = sponsorProfile?.fullName ?? null;
      sponsorType = sponsorship.relationship ?? null;
    }
  }

  // Format data
  const amountNaira = sp.program.tuitionAmount / 100;
  const amountFormatted = `₦ ${amountNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const issuedDate = cert.issuedAt.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const validUntilFormatted = cert.validUntil
    ? cert.validUntil.toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const appUrl = env.NEXT_PUBLIC_APP_URL ?? 'https://doculet.ai';
  const verificationUrl = `${appUrl}/certificate/${token}`;
  const tier = sp.fundingType === 'self' ? 2 : sp.fundingType ? 3 : 1;

  const studentName =
    cert.student?.profile?.fullName ?? cert.student?.email ?? 'Certificate Holder';

  const pdfData: CertificatePdfData = {
    studentName,
    schoolName: sp.school.name,
    programName: sp.program.name,
    amountFormatted,
    issuedDate,
    validUntil: validUntilFormatted,
    certificateId: cert.id,
    verificationUrl,
    tier,
    sponsorName,
    sponsorType,
  };

  // Generate QR code
  const qrDataUri = await generateQrDataUri(verificationUrl);

  // Render PDF
  const pdfBuffer = await renderToBuffer(
    CertificateDocument({ data: pdfData, qrDataUri }),
  );

  // Return PDF with proper headers
  const filename = `doculet-certificate-${cert.id.slice(0, 8)}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
