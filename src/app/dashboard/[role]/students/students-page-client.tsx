'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { TRPCClientError } from '@trpc/client';
import { Loader2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SponsorStudentEmptyState } from '@/components/sponsor/SponsorStudentEmptyState';
import {
  SponsorStudentList,
} from '@/components/sponsor/SponsorStudentList';
import type { SponsorStudentCardItem } from '@/components/sponsor/SponsorStudentCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { sponsorCopy } from '@/config/copy/sponsor';
import { browserTrpcClient } from '@/trpc/client';

const inviteStudentSchema = z.object({
  studentEmail: z.string().email(sponsorCopy.students.inviteFlow.validation.invalidEmail),
  amountNaira: z
    .string()
    .trim()
    .min(1, sponsorCopy.students.inviteFlow.validation.invalidAmount)
    .refine((value) => Number(value) > 0, sponsorCopy.students.inviteFlow.validation.invalidAmount),
});

type InviteStudentFormValues = z.infer<typeof inviteStudentSchema>;

type SponsorStudentsPageClientProps = {
  initialStudents: SponsorStudentCardItem[];
};

export default function StudentsPageClient({ initialStudents }: SponsorStudentsPageClientProps) {
  const [students, setStudents] = useState<SponsorStudentCardItem[]>(initialStudents);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [isInviteSuccess, setIsInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removingSponsorshipId, setRemovingSponsorshipId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteStudentFormValues>({
    resolver: zodResolver(inviteStudentSchema),
    defaultValues: {
      studentEmail: '',
      amountNaira: '',
    },
  });

  const hasStudents = students.length > 0;

  const submitInvite = handleSubmit(async (values) => {
    setIsSubmittingInvite(true);
    setInviteError(null);
    setIsInviteSuccess(false);

    try {
      const result = await browserTrpcClient.sponsor.linkStudent.mutate({
        studentEmail: values.studentEmail,
        amountKobo: Math.round(Number(values.amountNaira) * 100),
        currency: 'NGN',
      });

      setStudents((previousStudents) => {
        const existingStudentIndex = previousStudents.findIndex(
          (student) => student.sponsorshipId === result.student.sponsorshipId,
        );

        if (existingStudentIndex >= 0) {
          const nextStudents = [...previousStudents];
          nextStudents[existingStudentIndex] = result.student;
          return nextStudents;
        }

        return [result.student, ...previousStudents];
      });

      if (result.invitationSent) {
        setIsInviteSuccess(true);
      } else {
        setInviteError(sponsorCopy.students.inviteFlow.errors.delivery);
      }

      reset();
    } catch (error) {
      if (error instanceof TRPCClientError && error.data?.code === 'NOT_FOUND') {
        setInviteError(sponsorCopy.students.inviteFlow.errors.notFound);
      } else {
        setInviteError(sponsorCopy.students.inviteFlow.errors.generic);
      }
    } finally {
      setIsSubmittingInvite(false);
    }
  });

  async function handleRemoveStudent(sponsorshipId: string) {
    setRemoveError(null);
    setRemovingSponsorshipId(sponsorshipId);

    try {
      await browserTrpcClient.sponsor.removeStudent.mutate({ sponsorshipId });
      setStudents((previousStudents) =>
        previousStudents.filter((student) => student.sponsorshipId !== sponsorshipId),
      );
    } catch {
      setRemoveError(sponsorCopy.students.error.description);
    } finally {
      setRemovingSponsorshipId(null);
    }
  }

  function handleOpenInvite() {
    setInviteError(null);
    setIsInviteSuccess(false);
    setIsInviteOpen(true);
  }

  function handleCloseInvite() {
    setIsInviteOpen(false);
    setInviteError(null);
    setIsInviteSuccess(false);
    reset();
  }

  const headerMeta = useMemo(
    () => sponsorCopy.students.countLabel(students.length),
    [students.length],
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm dark:border-border/70 dark:bg-card/80 md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 dark:from-primary/10 dark:to-accent/10" />
        <div className="relative space-y-5">
          <PageHeader
            title={sponsorCopy.students.title}
            subtitle={sponsorCopy.students.subtitle}
            meta={headerMeta}
            actions={
              <Button type="button" className="min-h-11" onClick={handleOpenInvite}>
                <Plus className="size-5" aria-hidden="true" />
                {sponsorCopy.students.addStudentCta}
              </Button>
            }
            className="border-b-0 pb-0"
          />

          {removeError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15">
              {removeError}
            </p>
          ) : null}

          {hasStudents ? (
            <SponsorStudentList
              students={students}
              removingSponsorshipId={removingSponsorshipId}
              onRemove={handleRemoveStudent}
            />
          ) : (
            <SponsorStudentEmptyState onInvite={handleOpenInvite} />
          )}
        </div>
      </section>

      <Dialog open={isInviteOpen} onOpenChange={(open) => (open ? setIsInviteOpen(true) : handleCloseInvite())}>
        <DialogContent className="border-border bg-card text-card-foreground dark:border-border dark:bg-card">
          <DialogHeader>
            <DialogTitle>{sponsorCopy.students.inviteFlow.title}</DialogTitle>
            <DialogDescription>{sponsorCopy.students.inviteFlow.description}</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submitInvite} noValidate>
            <div className="space-y-2">
              <Label htmlFor="sponsor-invite-email">{sponsorCopy.students.inviteFlow.emailLabel}</Label>
              <Input
                id="sponsor-invite-email"
                type="email"
                placeholder={sponsorCopy.students.inviteFlow.emailPlaceholder}
                className="min-h-11"
                aria-invalid={Boolean(errors.studentEmail)}
                {...register('studentEmail')}
              />
              {errors.studentEmail?.message ? (
                <p className="text-sm text-destructive">{errors.studentEmail.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsor-invite-amount">{sponsorCopy.students.inviteFlow.amountLabel}</Label>
              <Input
                id="sponsor-invite-amount"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                placeholder={sponsorCopy.students.inviteFlow.amountPlaceholder}
                className="min-h-11"
                aria-invalid={Boolean(errors.amountNaira)}
                {...register('amountNaira')}
              />
              {errors.amountNaira?.message ? (
                <p className="text-sm text-destructive">{errors.amountNaira.message}</p>
              ) : null}
            </div>

            {inviteError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15">
                {inviteError}
              </p>
            ) : null}

            {isInviteSuccess ? (
              <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success dark:border-success/40 dark:bg-success/15">
                {sponsorCopy.students.inviteFlow.successLabel}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={handleCloseInvite}
                disabled={isSubmittingInvite}
              >
                {sponsorCopy.students.inviteFlow.cancelCta}
              </Button>
              <Button type="submit" className="min-h-11" disabled={isSubmittingInvite}>
                {isSubmittingInvite ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                    {sponsorCopy.students.inviteFlow.submitCta}
                  </span>
                ) : (
                  sponsorCopy.students.inviteFlow.submitCta
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
