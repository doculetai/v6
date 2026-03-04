import { eq } from 'drizzle-orm';

import { sponsorCopy } from '@/config/copy/sponsor';
import type { DrizzleDB } from '@/db';
import { sponsorProfiles, users } from '@/db/schema';
import {
  getActiveSessions,
  type SessionRecord,
} from '@/lib/services/session-tracker';
import type {
  SponsorNotificationSettings,
  SponsorProfile,
  SponsorProfileInput,
} from '@/server/routers/sponsor.schemas';

function toWatLabel(timestamp: string) {
  const formatted = new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(new Date(timestamp));

  return `${formatted} WAT`;
}

function inferDeviceType(session: SessionRecord): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  const deviceName = session.device_name?.toLowerCase() ?? '';

  if (deviceName.includes('ipad') || deviceName.includes('tablet')) {
    return 'tablet';
  }

  if (
    deviceName.includes('iphone') ||
    deviceName.includes('android') ||
    deviceName.includes('mobile')
  ) {
    return 'mobile';
  }

  if (session.browser || session.os) {
    return 'desktop';
  }

  return 'unknown';
}

function normalizeNullable(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapSessions(sessions: SessionRecord[]): SponsorProfile['sessions'] {
  const fallbackLocation = sponsorCopy.settings.sessions.noLastLoginFallback;

  if (sessions.length === 0) {
    return [
      {
        id: 'current-session',
        browser: 'Unknown',
        deviceType: 'unknown',
        location: fallbackLocation,
        lastActive: toWatLabel(new Date().toISOString()),
        isCurrent: true,
        ipAddress: null,
      },
    ];
  }

  return sessions.map((session) => ({
    id: session.id,
    browser: session.browser ?? 'Unknown',
    deviceType: inferDeviceType(session),
    location: session.location ?? fallbackLocation,
    lastActive: toWatLabel(session.last_active_at),
    isCurrent: session.is_current,
    ipAddress: session.ip_address,
  }));
}

export async function getSponsorProfileByUserId(
  db: DrizzleDB,
  userId: string,
): Promise<SponsorProfile> {
  const [user, profile, sessions] = await Promise.all([
    db.query.users.findFirst({
      where: (table, operators) => operators.eq(table.id, userId),
    }),
    db.query.sponsorProfiles.findFirst({
      where: (table, operators) => operators.eq(table.userId, userId),
    }),
    getActiveSessions(userId),
  ]);

  const mappedSessions = mapSessions(sessions);

  return {
    fullName: profile?.fullName ?? '',
    email: user?.email ?? '',
    phoneNumber: profile?.phoneNumber ?? '+234',
    relationshipToStudent: profile?.relationshipToStudent ?? 'parent',
    sponsorType: profile?.sponsorType === 'corporate' ? 'corporate' : 'individual',
    companyName: profile?.companyName ?? null,
    cacNumber: profile?.cacNumber ?? null,
    directorBvn: profile?.directorBvn ?? null,
    lastLoginLocation: mappedSessions.find((session) => session.isCurrent)?.location ?? null,
    hasSuspiciousLogin: mappedSessions.some(
      (session) =>
        !session.isCurrent &&
        session.location === sponsorCopy.settings.sessions.noLastLoginFallback,
    ),
    sessions: mappedSessions,
  };
}

export async function updateSponsorProfileByUserId(
  db: DrizzleDB,
  userId: string,
  input: SponsorProfileInput,
): Promise<SponsorProfile> {
  const isCorporate = input.sponsorType === 'corporate';

  await db.transaction(async (tx) => {
    await tx.update(users).set({ email: input.email }).where(eq(users.id, userId));

    await tx
      .insert(sponsorProfiles)
      .values({
        userId,
        sponsorType: input.sponsorType,
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        relationshipToStudent: input.relationshipToStudent,
        companyName: isCorporate ? normalizeNullable(input.companyName) : null,
        cacNumber: isCorporate ? normalizeNullable(input.cacNumber) : null,
        directorBvn: isCorporate ? normalizeNullable(input.directorBvn) : null,
      })
      .onConflictDoUpdate({
        target: sponsorProfiles.userId,
        set: {
          sponsorType: input.sponsorType,
          fullName: input.fullName,
          phoneNumber: input.phoneNumber,
          relationshipToStudent: input.relationshipToStudent,
          companyName: isCorporate ? normalizeNullable(input.companyName) : null,
          cacNumber: isCorporate ? normalizeNullable(input.cacNumber) : null,
          directorBvn: isCorporate ? normalizeNullable(input.directorBvn) : null,
          updatedAt: new Date(),
        },
      });
  });

  return getSponsorProfileByUserId(db, userId);
}

export async function getSponsorNotificationSettingsByUserId(
  db: DrizzleDB,
  userId: string,
): Promise<SponsorNotificationSettings> {
  const profile = await db.query.sponsorProfiles.findFirst({
    where: (table, operators) => operators.eq(table.userId, userId),
  });

  return {
    emailFundingUpdates: profile?.notifyFundingUpdates ?? true,
    emailVerificationUpdates: profile?.notifyVerificationUpdates ?? true,
    emailSecurityAlerts: profile?.notifySecurityAlerts ?? true,
  };
}

export async function updateSponsorNotificationSettingsByUserId(
  db: DrizzleDB,
  userId: string,
  input: SponsorNotificationSettings,
): Promise<SponsorNotificationSettings> {
  await db
    .insert(sponsorProfiles)
    .values({
      userId,
      sponsorType: 'individual',
      notifyFundingUpdates: input.emailFundingUpdates,
      notifyVerificationUpdates: input.emailVerificationUpdates,
      notifySecurityAlerts: input.emailSecurityAlerts,
    })
    .onConflictDoUpdate({
      target: sponsorProfiles.userId,
      set: {
        notifyFundingUpdates: input.emailFundingUpdates,
        notifyVerificationUpdates: input.emailVerificationUpdates,
        notifySecurityAlerts: input.emailSecurityAlerts,
        updatedAt: new Date(),
      },
    });

  return getSponsorNotificationSettingsByUserId(db, userId);
}
