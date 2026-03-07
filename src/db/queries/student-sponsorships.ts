import { and, eq } from 'drizzle-orm';

import { profiles, sponsorships } from '@/db/schema';

import type { db as database } from '@/db';

type DatabaseClient = typeof database;

export type CommittedSponsor = {
  id: string;
  sponsorName: string;
  amountKobo: number;
  currency: string;
  fundingTypeLabel: string;
};

export type WithdrawnSponsor = {
  id: string;
  sponsorName: string;
};

export async function getCommittedSponsors(
  db: DatabaseClient,
  studentId: string,
): Promise<CommittedSponsor[]> {
  const rows = await db
    .select({
      id: sponsorships.id,
      amountKobo: sponsorships.amountKobo,
      currency: sponsorships.currency,
      relationship: sponsorships.relationship,
      sponsorFullName: profiles.fullName,
    })
    .from(sponsorships)
    .leftJoin(profiles, eq(profiles.userId, sponsorships.sponsorId))
    .where(
      and(
        eq(sponsorships.studentId, studentId),
        eq(sponsorships.status, 'active'),
      ),
    );

  return rows.map((row) => ({
    id: row.id,
    sponsorName: row.sponsorFullName ?? 'Sponsor',
    amountKobo: row.amountKobo,
    currency: row.currency,
    fundingTypeLabel: row.relationship ?? 'Sponsor',
  }));
}

export async function getWithdrawnSponsors(
  db: DatabaseClient,
  studentId: string,
): Promise<WithdrawnSponsor[]> {
  const rows = await db
    .select({
      id: sponsorships.id,
      sponsorFullName: profiles.fullName,
    })
    .from(sponsorships)
    .leftJoin(profiles, eq(profiles.userId, sponsorships.sponsorId))
    .where(
      and(
        eq(sponsorships.studentId, studentId),
        eq(sponsorships.status, 'withdrawn'),
      ),
    );

  return rows.map((row) => ({
    id: row.id,
    sponsorName: row.sponsorFullName ?? 'Sponsor',
  }));
}
