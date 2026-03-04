import { and, desc, eq, isNull } from 'drizzle-orm';

import { sponsorshipInvites, users } from '@/db/schema';

import type { db as database } from '@/db';

type DatabaseClient = typeof database;
type InvitationStatus = (typeof sponsorshipInvites.$inferSelect)['status'];
type ResponseStatus = Extract<InvitationStatus, 'accepted' | 'declined'>;

type InviteStudentArgs = {
  studentId: string;
  inviteeEmail: string;
  message?: string;
};

type CancelInviteArgs = {
  inviteId: string;
  studentId: string;
};

type RespondInviteArgs = {
  inviteId: string;
  inviteeEmail: string;
  responderUserId: string;
  status: ResponseStatus;
};

type PgErrorLike = {
  code?: string;
  constraint_name?: string;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isPendingInviteConflictError(error: unknown) {
  const pgError = error as PgErrorLike | null;

  return (
    pgError?.code === '23505' &&
    pgError?.constraint_name === 'sponsorship_invites_pending_unique_idx'
  );
}

export function canTransitionInvitationStatus(
  currentStatus: InvitationStatus,
  nextStatus: InvitationStatus,
) {
  if (currentStatus === 'pending') {
    return nextStatus === 'accepted' || nextStatus === 'declined' || nextStatus === 'cancelled';
  }

  return false;
}

export async function getUserByEmail(db: DatabaseClient, email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, normalizeEmail(email)),
    columns: {
      id: true,
      email: true,
    },
  });
}

export async function findPendingInvitationByStudentAndEmail(
  db: DatabaseClient,
  studentId: string,
  inviteeEmail: string,
) {
  return db.query.sponsorshipInvites.findFirst({
    where: and(
      eq(sponsorshipInvites.studentId, studentId),
      eq(sponsorshipInvites.inviteeEmailNormalized, normalizeEmail(inviteeEmail)),
      eq(sponsorshipInvites.status, 'pending'),
    ),
  });
}

export async function createSponsorInvitation(db: DatabaseClient, args: InviteStudentArgs) {
  const now = new Date();
  const inviteeEmailNormalized = normalizeEmail(args.inviteeEmail);

  const [invitation] = await db
    .insert(sponsorshipInvites)
    .values({
      studentId: args.studentId,
      inviteeEmail: args.inviteeEmail.trim(),
      inviteeEmailNormalized,
      status: 'pending',
      message: args.message?.trim() || null,
      lastEmailSentAt: now,
      updatedAt: now,
    })
    .returning();

  return invitation;
}

export async function deleteInvitationById(db: DatabaseClient, inviteId: string) {
  await db.delete(sponsorshipInvites).where(eq(sponsorshipInvites.id, inviteId));
}

export async function listInvitationsForStudent(db: DatabaseClient, studentId: string) {
  return db.query.sponsorshipInvites.findMany({
    where: eq(sponsorshipInvites.studentId, studentId),
    orderBy: [desc(sponsorshipInvites.createdAt)],
  });
}

export async function cancelPendingInvitation(db: DatabaseClient, args: CancelInviteArgs) {
  const now = new Date();
  const [invitation] = await db
    .update(sponsorshipInvites)
    .set({
      status: 'cancelled',
      cancelledAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(sponsorshipInvites.id, args.inviteId),
        eq(sponsorshipInvites.studentId, args.studentId),
        eq(sponsorshipInvites.status, 'pending'),
      ),
    )
    .returning();

  return invitation ?? null;
}

export async function listPendingInvitationsForInvitee(db: DatabaseClient, inviteeEmail: string) {
  return db.query.sponsorshipInvites.findMany({
    where: and(
      eq(sponsorshipInvites.inviteeEmailNormalized, normalizeEmail(inviteeEmail)),
      eq(sponsorshipInvites.status, 'pending'),
      isNull(sponsorshipInvites.cancelledAt),
    ),
    orderBy: [desc(sponsorshipInvites.createdAt)],
    with: {
      student: {
        columns: {
          id: true,
          email: true,
        },
      },
    },
  });
}

export async function respondToPendingInvitation(db: DatabaseClient, args: RespondInviteArgs) {
  const now = new Date();
  const [invitation] = await db
    .update(sponsorshipInvites)
    .set({
      status: args.status,
      respondedByUserId: args.responderUserId,
      respondedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(sponsorshipInvites.id, args.inviteId),
        eq(sponsorshipInvites.inviteeEmailNormalized, normalizeEmail(args.inviteeEmail)),
        eq(sponsorshipInvites.status, 'pending'),
      ),
    )
    .returning();

  return invitation ?? null;
}
