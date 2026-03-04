import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { disbursements, sponsorships, users } from '@/db/schema';

type DisbursementRow = {
  id: string;
  sponsorshipId: string;
  amountKobo: number;
  status: (typeof disbursements.$inferSelect)['status'];
  paystackReference: string | null;
  scheduledAt: Date;
  disbursedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  studentId: string;
  studentEmail: string;
};

export type SponsorDisbursementStatus = 'pending' | 'processing' | 'completed' | 'failed';

const activeSponsorshipStatuses: Array<(typeof sponsorships.$inferSelect)['status']> = [
  'pending',
  'active',
];

const openDisbursementStatuses: Array<(typeof disbursements.$inferSelect)['status']> = [
  'scheduled',
  'processing',
];

function toDisplayName(email: string) {
  const localPart = email.split('@')[0] ?? '';
  const spaced = localPart.replace(/[._-]+/g, ' ').trim();
  if (!spaced) {
    return email;
  }

  return spaced
    .split(' ')
    .filter(Boolean)
    .map((piece) => piece[0]!.toUpperCase() + piece.slice(1))
    .join(' ');
}

export function mapDbDisbursementStatus(
  status: (typeof disbursements.$inferSelect)['status'],
): SponsorDisbursementStatus {
  if (status === 'scheduled') return 'pending';
  if (status === 'disbursed') return 'completed';
  return status;
}

export async function listSponsorDisbursements(db: DrizzleDB, sponsorId: string) {
  const rows = await db
    .select({
      id: disbursements.id,
      sponsorshipId: disbursements.sponsorshipId,
      amountKobo: disbursements.amountKobo,
      status: disbursements.status,
      paystackReference: disbursements.paystackReference,
      scheduledAt: disbursements.scheduledAt,
      disbursedAt: disbursements.disbursedAt,
      createdAt: disbursements.createdAt,
      updatedAt: disbursements.updatedAt,
      studentId: sponsorships.studentId,
      studentEmail: users.email,
    })
    .from(disbursements)
    .innerJoin(sponsorships, eq(disbursements.sponsorshipId, sponsorships.id))
    .innerJoin(users, eq(sponsorships.studentId, users.id))
    .where(eq(sponsorships.sponsorId, sponsorId))
    .orderBy(desc(disbursements.createdAt));

  return rows.map((row) => ({
    ...row,
    status: mapDbDisbursementStatus(row.status),
    studentDisplayName: toDisplayName(row.studentEmail),
  }));
}

export async function listSponsorStudentsForDisbursements(db: DrizzleDB, sponsorId: string) {
  const rows = await db
    .select({
      sponsorshipId: sponsorships.id,
      studentId: sponsorships.studentId,
      studentEmail: users.email,
    })
    .from(sponsorships)
    .innerJoin(users, eq(sponsorships.studentId, users.id))
    .where(
      and(
        eq(sponsorships.sponsorId, sponsorId),
        inArray(sponsorships.status, activeSponsorshipStatuses),
      ),
    )
    .orderBy(asc(users.email));

  return rows.map((row) => ({
    ...row,
    studentDisplayName: toDisplayName(row.studentEmail),
  }));
}

export async function getSponsorSponsorshipForDisbursement(
  db: DrizzleDB,
  sponsorId: string,
  sponsorshipId: string,
) {
  const [record] = await db
    .select({
      sponsorshipId: sponsorships.id,
      studentId: sponsorships.studentId,
      studentEmail: users.email,
    })
    .from(sponsorships)
    .innerJoin(users, eq(sponsorships.studentId, users.id))
    .where(and(eq(sponsorships.id, sponsorshipId), eq(sponsorships.sponsorId, sponsorId)))
    .limit(1);

  if (!record) {
    return null;
  }

  return {
    ...record,
    studentDisplayName: toDisplayName(record.studentEmail),
  };
}

export async function createSponsorDisbursementRecord(
  db: DrizzleDB,
  input: {
    sponsorshipId: string;
    amountKobo: number;
    scheduledAt: Date;
    paystackReference: string;
  },
) {
  const [created] = await db
    .insert(disbursements)
    .values({
      sponsorshipId: input.sponsorshipId,
      amountKobo: input.amountKobo,
      scheduledAt: input.scheduledAt,
      paystackReference: input.paystackReference,
      status: 'scheduled',
    })
    .returning({
      id: disbursements.id,
      sponsorshipId: disbursements.sponsorshipId,
      amountKobo: disbursements.amountKobo,
      status: disbursements.status,
      paystackReference: disbursements.paystackReference,
      scheduledAt: disbursements.scheduledAt,
      disbursedAt: disbursements.disbursedAt,
      createdAt: disbursements.createdAt,
      updatedAt: disbursements.updatedAt,
    });

  return created;
}

async function getDisbursementByIdForSponsor(
  db: DrizzleDB,
  sponsorId: string,
  disbursementId: string,
): Promise<DisbursementRow | null> {
  const [record] = await db
    .select({
      id: disbursements.id,
      sponsorshipId: disbursements.sponsorshipId,
      amountKobo: disbursements.amountKobo,
      status: disbursements.status,
      paystackReference: disbursements.paystackReference,
      scheduledAt: disbursements.scheduledAt,
      disbursedAt: disbursements.disbursedAt,
      createdAt: disbursements.createdAt,
      updatedAt: disbursements.updatedAt,
      studentId: sponsorships.studentId,
      studentEmail: users.email,
    })
    .from(disbursements)
    .innerJoin(sponsorships, eq(disbursements.sponsorshipId, sponsorships.id))
    .innerJoin(users, eq(sponsorships.studentId, users.id))
    .where(and(eq(disbursements.id, disbursementId), eq(sponsorships.sponsorId, sponsorId)))
    .limit(1);

  return record ?? null;
}

export async function cancelSponsorDisbursementRecord(
  db: DrizzleDB,
  sponsorId: string,
  disbursementId: string,
) {
  const existing = await getDisbursementByIdForSponsor(db, sponsorId, disbursementId);
  if (!existing) {
    return null;
  }

  const canCancel = existing.status === 'scheduled' || existing.status === 'processing';
  if (canCancel) {
    await db
      .update(disbursements)
      .set({
        status: 'failed',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(disbursements.id, disbursementId),
          inArray(disbursements.status, openDisbursementStatuses),
        ),
      );
  }

  const updated = await getDisbursementByIdForSponsor(db, sponsorId, disbursementId);
  if (!updated) {
    return null;
  }

  return {
    ...updated,
    status: mapDbDisbursementStatus(updated.status),
    studentDisplayName: toDisplayName(updated.studentEmail),
  };
}
