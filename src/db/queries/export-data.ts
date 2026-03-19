import { eq, inArray, or } from 'drizzle-orm';

import type { DrizzleDB } from '../index';
import { disbursements, sponsorships } from '../schema';

export type ExportDataPayload = {
  exportedAt: string;
  user: { id: string; email: string | null; createdAt: Date } | null;
  profile: {
    role: string;
    onboardingComplete: boolean;
    createdAt: Date;
  } | null;
  studentProfile: { schoolId: string | null; programId: string | null } | null;
  documents: Array<{
    type: string;
    status: string;
    createdAt: Date;
    reviewedAt: Date | null;
  }>;
  kycVerifications: Array<{ tier: number; verifiedAt: Date | null }>;
  bankAccounts: Array<{
    bankName: string | null;
    accountNumberMasked: string | null;
    linkedAt: Date | null;
  }>;
  sponsorships: Array<{
    id: string;
    role: 'student' | 'sponsor';
    status: string;
    amountKobo: number;
    currency: string;
    createdAt: Date;
  }>;
  disbursements: Array<{
    id: string;
    sponsorshipId: string;
    amountKobo: number;
    scheduledAt: Date;
    disbursedAt: Date | null;
    status: string;
    createdAt: Date;
  }>;
  consents: Array<{ type: string; version: string; acceptedAt: Date }>;
};

export async function getExportDataForUser(db: DrizzleDB, userId: string): Promise<ExportDataPayload> {
  const [user, profile] = await Promise.all([
    db.query.users.findFirst({ where: (t, { eq: eqFn }) => eqFn(t.id, userId) }),
    db.query.profiles.findFirst({ where: (t, { eq: eqFn }) => eqFn(t.userId, userId) }),
  ]);

  const studentProfile =
    profile?.role === 'student'
      ? await db.query.studentProfiles.findFirst({
          where: (t, { eq: eqFn }) => eqFn(t.userId, userId),
        })
      : null;

  const [docs, kyc, bank, userConsents, userSponsorships] = await Promise.all([
    db.query.documents.findMany({
      where: (t, { eq: eqFn }) => eqFn(t.userId, userId),
      columns: { type: true, status: true, createdAt: true, reviewedAt: true },
    }),
    db.query.kycVerifications.findMany({
      where: (t, { eq: eqFn }) => eqFn(t.userId, userId),
      columns: { tier: true, verifiedAt: true },
    }),
    db.query.bankAccounts.findMany({
      where: (t, { eq: eqFn }) => eqFn(t.userId, userId),
      columns: { bankName: true, accountNumber: true, linkedAt: true },
    }),
    db.query.consents.findMany({
      where: (t, { eq: eqFn }) => eqFn(t.userId, userId),
      columns: { type: true, version: true, acceptedAt: true },
    }),
    db
      .select()
      .from(sponsorships)
      .where(or(eq(sponsorships.studentId, userId), eq(sponsorships.sponsorId, userId))),
  ]);

  const sponsorshipIds = userSponsorships.map((s) => s.id);
  const allDisbursements =
    sponsorshipIds.length > 0
      ? await db
          .select()
          .from(disbursements)
          .where(inArray(disbursements.sponsorshipId, sponsorshipIds))
      : [];

  return {
    exportedAt: new Date().toISOString(),
    user: user ? { id: user.id, email: user.email, createdAt: user.createdAt } : null,
    profile: profile
      ? {
          role: profile.role,
          onboardingComplete: profile.onboardingComplete,
          createdAt: profile.createdAt,
        }
      : null,
    studentProfile: studentProfile
      ? { schoolId: studentProfile.schoolId, programId: studentProfile.programId }
      : null,
    documents: docs.map((d) => ({
      type: d.type,
      status: d.status,
      createdAt: d.createdAt,
      reviewedAt: d.reviewedAt,
    })),
    kycVerifications: kyc.map((k) => ({ tier: k.tier, verifiedAt: k.verifiedAt })),
    bankAccounts: bank.map((b) => ({
      bankName: b.bankName,
      accountNumberMasked: b.accountNumber ? `****${b.accountNumber.slice(-4)}` : null,
      linkedAt: b.linkedAt,
    })),
    sponsorships: userSponsorships.map((s) => ({
      id: s.id,
      role: (s.studentId === userId ? 'student' : 'sponsor') as 'student' | 'sponsor',
      status: s.status,
      amountKobo: s.amountKobo,
      currency: s.currency,
      createdAt: s.createdAt,
    })),
    disbursements: allDisbursements.map((d) => ({
      id: d.id,
      sponsorshipId: d.sponsorshipId,
      amountKobo: d.amountKobo,
      scheduledAt: d.scheduledAt,
      disbursedAt: d.disbursedAt,
      status: d.status,
      createdAt: d.createdAt,
    })),
    consents: userConsents.map((c) => ({
      type: c.type,
      version: c.version,
      acceptedAt: c.acceptedAt,
    })),
  };
}
