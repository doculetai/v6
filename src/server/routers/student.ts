import { TRPCError } from '@trpc/server';
import { captureException } from '@sentry/nextjs';
import { z } from 'zod';

import {
  cancelPendingInvitation,
  createSponsorInvitation,
  deleteInvitationById,
  findPendingInvitationByStudentAndEmail,
  isPendingInviteConflictError,
  listInvitationsForStudent,
  normalizeEmail,
} from '@/db/queries/sponsor-invitations';
import { sendSponsorInvitationEmail } from '@/lib/email/send-sponsor-invitation-email';

import { createTRPCRouter, roleProcedure } from '../trpc';

const inviteSponsorInputSchema = z.object({
  email: z.string().trim().email(),
  note: z.string().trim().max(500).optional(),
});

const invitationStatusSchema = z.enum(['pending', 'accepted', 'declined', 'cancelled']);

const invitationOutputSchema = z.object({
  id: z.string().uuid(),
  inviteeEmail: z.string().email(),
  status: invitationStatusSchema,
  message: z.string().nullable(),
  respondedAt: z.date().nullable(),
  cancelledAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const cancelInviteInputSchema = z.object({
  inviteId: z.string().uuid(),
});

function toInvitationOutput(invitation: {
  id: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string | null;
  respondedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: invitation.id,
    inviteeEmail: invitation.inviteeEmail,
    status: invitation.status,
    message: invitation.message,
    respondedAt: invitation.respondedAt,
    cancelledAt: invitation.cancelledAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
  };
}

export const studentRouter = createTRPCRouter({
  listSponsorInvites: roleProcedure('student')
    .output(z.array(invitationOutputSchema))
    .query(async ({ ctx }) => {
      const invitations = await listInvitationsForStudent(ctx.db, ctx.user.id);
      return invitations.map(toInvitationOutput);
    }),

  inviteSponsorByEmail: roleProcedure('student')
    .input(inviteSponsorInputSchema)
    .output(invitationOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const inviteeEmail = normalizeEmail(input.email);
      const studentEmail = normalizeEmail(ctx.user.email ?? '');

      if (!studentEmail) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Student account email is required before sending invitations.',
        });
      }

      if (inviteeEmail === studentEmail) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot invite your own email address.',
        });
      }

      const existingPendingInvite = await findPendingInvitationByStudentAndEmail(
        ctx.db,
        ctx.user.id,
        inviteeEmail,
      );

      if (existingPendingInvite) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A pending invitation already exists for this email.',
        });
      }

      let invitationId: string | null = null;

      try {
        const invitation = await createSponsorInvitation(ctx.db, {
          studentId: ctx.user.id,
          inviteeEmail,
          message: input.note,
        });
        invitationId = invitation.id;

        await sendSponsorInvitationEmail({
          toEmail: inviteeEmail,
          studentEmail,
          note: input.note,
        });

        return toInvitationOutput(invitation);
      } catch (error) {
        if (invitationId) {
          await deleteInvitationById(ctx.db, invitationId);
        }

        if (isPendingInviteConflictError(error)) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A pending invitation already exists for this email.',
          });
        }

        if (error instanceof TRPCError) {
          throw error;
        }

        captureException(error, {
          tags: {
            domain: 'sponsor-invitations',
            operation: 'invite-sponsor-by-email',
          },
          extra: {
            studentId: ctx.user.id,
            inviteeEmail,
          },
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to send sponsor invitation right now.',
        });
      }
    }),

  cancelSponsorInvite: roleProcedure('student')
    .input(cancelInviteInputSchema)
    .output(invitationOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const invitation = await cancelPendingInvitation(ctx.db, {
        inviteId: input.inviteId,
        studentId: ctx.user.id,
      });

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pending invitation not found.',
        });
      }

      return toInvitationOutput(invitation);
    }),
});
