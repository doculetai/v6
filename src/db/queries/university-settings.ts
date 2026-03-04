import { eq } from 'drizzle-orm';

import type { DrizzleDB } from '@/db';
import { universityProfiles } from '@/db/schema';

export type UniversityProfileRow = typeof universityProfiles.$inferSelect;

// ── Read ─────────────────────────────────────────────────────────────────────

export async function getUniversityProfile(db: DrizzleDB, userId: string) {
  return db.query.universityProfiles.findFirst({
    where: eq(universityProfiles.userId, userId),
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────

type ProfileUpdateData = Partial<
  Pick<
    UniversityProfileRow,
    | 'institutionName'
    | 'accreditationBody'
    | 'contactEmail'
    | 'contactPhone'
    | 'webhookUrl'
    | 'notifyOnSubmission'
    | 'notifyOnApproval'
    | 'notifyOnRejection'
  >
>;

export async function upsertUniversityProfile(
  db: DrizzleDB,
  userId: string,
  data: ProfileUpdateData,
) {
  const [row] = await db
    .insert(universityProfiles)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: universityProfiles.userId,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();
  return row;
}
