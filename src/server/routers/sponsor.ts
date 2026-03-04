import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  listPendingInvitationsForInvitee,
  respondToPendingInvitation,
} from '@/db/queries/sponsor-invitations';

import { createTRPCRouter, roleProcedure } from '../trpc';

const invitationStatusSchema = z.enum(['pending', 'accepted', 'declined', 'cancelled']);
const responseStatusSchema = z.enum(['accepted', 'declined']);

const invitationOutputSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  studentEmail: z.string().email(),
  inviteeEmail: z.string().email(),
  status: invitationStatusSchema,
  message: z.string().nullable(),
  respondedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const respondToInviteInputSchema = z.object({
  inviteId: z.string().uuid(),
  status: responseStatusSchema,
});

type SponsorInviteRow = {
  id: string;
  studentId: string;
  studentEmail: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toSponsorInviteOutput(invitation: SponsorInviteRow) {
  return {
    id: invitation.id,
    studentId: invitation.studentId,
    studentEmail: invitation.studentEmail,
    inviteeEmail: invitation.inviteeEmail,
    status: invitation.status,
    message: invitation.message,
    respondedAt: invitation.respondedAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
  };
}

export const sponsorRouter = createTRPCRouter({
  listPendingInvites: roleProcedure('sponsor')
    .output(z.array(invitationOutputSchema))
    .query(async ({ ctx }) => {
      const sponsorEmail = ctx.user.email?.trim().toLowerCase();

      if (!sponsorEmail) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Sponsor account email is required before listing invitations.',
        });
      }

      const invitations = await listPendingInvitationsForInvitee(ctx.db, sponsorEmail);

      return invitations
        .filter((invite) => Boolean(invite.student?.email))
        .map((invite) => {
          const studentEmail = invite.student?.email ?? '';

          return toSponsorInviteOutput({
            id: invite.id,
            studentId: invite.studentId,
            studentEmail,
            inviteeEmail: invite.inviteeEmail,
            status: invite.status,
            message: invite.message,
            respondedAt: invite.respondedAt,
            createdAt: invite.createdAt,
            updatedAt: invite.updatedAt,
          });
        });
    }),

  respondToInvite: roleProcedure('sponsor')
    .input(respondToInviteInputSchema)
    .output(invitationOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const sponsorEmail = ctx.user.email?.trim().toLowerCase();

      if (!sponsorEmail) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Sponsor account email is required before responding to invitations.',
        });
      }

      const invitation = await respondToPendingInvitation(ctx.db, {
        inviteId: input.inviteId,
        inviteeEmail: sponsorEmail,
        responderUserId: ctx.user.id,
        status: input.status,
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pending invitation not found for this sponsor account.',
        });
      }

      const student = await ctx.db.query.users.findFirst({
        where: (usersTable, { eq }) => eq(usersTable.id, invitation.studentId),
        columns: {
          email: true,
        },
      });

      if (!student?.email) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Unable to resolve student email for this invitation.',
        });
      }

      return toSponsorInviteOutput({
        id: invitation.id,
        studentId: invitation.studentId,
        studentEmail: student.email,
        inviteeEmail: invitation.inviteeEmail,
        status: invitation.status,
        message: invitation.message,
        respondedAt: invitation.respondedAt,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      });
    }),
});
