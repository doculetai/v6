'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Headset,
  PaperPlaneRight,
  CircleNotch,
  WarningCircle,
} from '@/components/icons';

import {
  EmptyState,
  PageShell,
  Section,
  Stack,
} from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { studentCopy } from '@/config/copy/student';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

// ── Types ─────────────────────────────────────────────────────────────────────

type Copy = (typeof studentCopy)['support'];
type Props = { copy: Copy };
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

const formSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(120),
  message: z.string().trim().min(1, 'Message is required').max(2000),
});

type FormValues = z.infer<typeof formSchema>;

// ── Status badge ──────────────────────────────────────────────────────────────

const statusBadgeClass: Record<TicketStatus, string> = {
  open: 'bg-primary/10 text-primary',
  in_progress: 'bg-warning/10 text-warning',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

// ── Ticket card ───────────────────────────────────────────────────────────────

function TicketCard({
  ticket,
  copy,
}: {
  ticket: {
    id: string;
    subject: string;
    message: string;
    status: TicketStatus;
    createdAt: Date;
  };
  copy: Copy;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
            statusBadgeClass[ticket.status],
          )}
        >
          {copy.ticket.statusLabels[ticket.status]}
        </span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
      <p className="text-xs text-muted-foreground">
        {copy.ticket.createdAt}: {formatDate(ticket.createdAt)}
      </p>
    </div>
  );
}

// ── Create ticket form ────────────────────────────────────────────────────────

function CreateTicketForm({
  copy,
  onSuccess,
}: {
  copy: Copy;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { subject: '', message: '' },
  });

  const createMutation = trpc.student.createSupportRequest.useMutation({
    onSuccess: () => {
      toast.success(copy.feedback.success);
      reset();
      onSuccess();
    },
    onError: () => {
      toast.error(copy.feedback.error);
    },
  });

  function onSubmit(values: FormValues) {
    createMutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-foreground">{copy.createCta}</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-subject">{copy.form.subjectLabel}</Label>
            <Input
              id="support-subject"
              placeholder={copy.form.subjectPlaceholder}
              disabled={createMutation.isPending}
              {...register('subject')}
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p className="text-xs text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-message">{copy.form.messageLabel}</Label>
            <Textarea
              id="support-message"
              rows={4}
              placeholder={copy.form.messagePlaceholder}
              disabled={createMutation.isPending}
              {...register('message')}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <CircleNotch
                  className="mr-2 size-4 animate-spin"
                  weight="duotone"
                  aria-hidden="true"
                />
                {copy.form.submittingCta}
              </>
            ) : (
              <>
                <PaperPlaneRight
                  className="mr-2 size-4"
                  weight="duotone"
                  aria-hidden="true"
                />
                {copy.form.submitCta}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SupportPageClient({ copy }: Props) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();

  const {
    data: tickets,
    isPending,
    isError,
  } = trpc.student.listMySupportRequests.useQuery();

  function handleTicketCreated() {
    setShowForm(false);
    void utils.student.listMySupportRequests.invalidate();
  }

  return (
    <PageShell width="default">
      <Section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="shrink-0 self-start"
            >
              <Headset className="mr-2 size-4" weight="duotone" aria-hidden="true" />
              {copy.createCta}
            </Button>
          )}
        </div>

        {showForm && (
          <CreateTicketForm copy={copy} onSuccess={handleTicketCreated} />
        )}

        {isPending && (
          <Stack gap="sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-border bg-muted/40"
              />
            ))}
          </Stack>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12 text-center">
            <WarningCircle
              className="size-8 text-destructive/60"
              weight="duotone"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground">{copy.feedback.error}</p>
          </div>
        )}

        {!isPending && !isError && tickets && tickets.length === 0 && !showForm && (
          <EmptyState
            title={copy.empty.title}
            description={copy.empty.description}
            action={
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                Submit a request
              </Button>
            }
          />
        )}

        {!isPending && !isError && tickets && tickets.length > 0 && (
          <Stack gap="sm">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} copy={copy} />
            ))}
          </Stack>
        )}
      </Section>
    </PageShell>
  );
}
