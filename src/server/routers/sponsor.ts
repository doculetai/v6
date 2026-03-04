import { TRPCError } from '@trpc/server';
import { Resend } from 'resend';
import { z } from 'zod';

import {
  getSponsorStudents,
  linkSponsorStudent,
  removeSponsorStudentLink,
} from '@/db/queries/sponsor-students';

import { createTRPCRouter, roleProcedure } from '../trpc';

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const inviteSender = process.env.RESEND_FROM_EMAIL ?? 'Doculet.ai <notifications@doculet.ai>';

async function sendStudentInvitationEmail({
  sponsorEmail,
  studentEmail,
}: {
  sponsorEmail: string;
  studentEmail: string;
}) {
  if (!resendClient) {
    return false;
  }

  try {
    await resendClient.emails.send({
      from: inviteSender,
      to: studentEmail,
      subject: 'A sponsor has invited you on Doculet.ai',
      text: `${sponsorEmail} invited you to link sponsorship on Doculet.ai. Sign in to your dashboard to review and accept the sponsor link.`,
    });

    return true;
  } catch {
    return false;
  }
}

const sponsorStudentSchema = z.object({
  sponsorshipId: z.string().uuid(),
  studentId: z.string().uuid(),
  studentEmail: z.string().email(),
  studentName: z.string(),
  studentInitials: z.string(),
  universityName: z.string(),
  programName: z.string(),
  fundingAmountKobo: z.number().int().nonnegative(),
  currency: z.string(),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  status: z.enum(['pending', 'active', 'completed']),
  updatedAt: z.date(),
});

const getStudentsOutputSchema = z.object({
  students: z.array(sponsorStudentSchema),
});

const linkStudentInputSchema = z.object({
  studentEmail: z.string().email(),
  amountKobo: z.number().int().positive(),
  currency: z.literal('NGN').default('NGN'),
});

const linkStudentOutputSchema = z.object({
  student: sponsorStudentSchema,
  invitationSent: z.boolean(),
});

const removeStudentInputSchema = z.object({
  sponsorshipId: z.string().uuid(),
});

const removeStudentOutputSchema = z.object({
  removed: z.boolean(),
});

export const sponsorRouter = createTRPCRouter({
  getStudents: roleProcedure('sponsor')
    .output(getStudentsOutputSchema)
    .query(async ({ ctx }) => {
      const students = await getSponsorStudents({
        db: ctx.db,
        sponsorId: ctx.user.id,
      });

      return {
        students,
      };
    }),

  linkStudent: roleProcedure('sponsor')
    .input(linkStudentInputSchema)
    .output(linkStudentOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const linkedStudent = await linkSponsorStudent({
        db: ctx.db,
        sponsorId: ctx.user.id,
        studentEmail: input.studentEmail,
        amountKobo: input.amountKobo,
        currency: input.currency,
      });

      if (!linkedStudent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student account was not found for this email address.',
        });
      }

      const invitationSent = await sendStudentInvitationEmail({
        sponsorEmail: ctx.user.email ?? 'A Doculet sponsor',
        studentEmail: linkedStudent.studentEmail,
      });

      return {
        student: linkedStudent,
        invitationSent,
      };
    }),

  removeStudent: roleProcedure('sponsor')
    .input(removeStudentInputSchema)
    .output(removeStudentOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const removed = await removeSponsorStudentLink({
        db: ctx.db,
        sponsorId: ctx.user.id,
        sponsorshipId: input.sponsorshipId,
      });

      if (!removed) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student link was not found or has already been removed.',
        });
      }

      return {
        removed,
      };
    }),
});
