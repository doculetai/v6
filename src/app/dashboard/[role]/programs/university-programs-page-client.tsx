'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Buildings, Warning } from '@/components/icons';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/layout/empty-state';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import type { universityCopy } from '@/config/copy/university';

type Program = {
  id: string;
  name: string;
  tuitionAmount: number;
  currency: string;
  durationMonths: number;
  status: 'active' | 'inactive';
  studentCount: number;
  createdAt: Date;
};

type Props = {
  initialPrograms: Program[];
  copy: typeof universityCopy.programs;
};

const createProgramSchema = z.object({
  name: z.string().min(2, 'Program name must be at least 2 characters.'),
  tuitionAmount: z
    .number({ message: 'Enter a valid amount greater than zero.' })
    .int()
    .positive('Enter a valid amount greater than zero.'),
  durationMonths: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
});

type CreateProgramForm = z.infer<typeof createProgramSchema>;

function formatNGN(amount: number): string {
  return '\u20a6\u00a0' + amount.toLocaleString('en-NG');
}

const statusBadgeClass: Record<Program['status'], string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
};

export function UniversityProgramsPageClient({ initialPrograms, copy }: Props) {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [showCreate, setShowCreate] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Program | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  function showSuccess(name: string) {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setSuccessName(name);
    dismissTimer.current = setTimeout(() => setSuccessName(null), 5000);
  }

  const utils = trpc.useUtils();

  const createMutation = trpc.university.createUniversityProgram.useMutation({
    onSuccess(created) {
      setPrograms((prev) => [created, ...prev]);
      setShowCreate(false);
      reset();
      showSuccess(created.name);
    },
  });

  const deactivateMutation = trpc.university.deactivateProgram.useMutation({
    onSuccess() {
      if (deactivateTarget) {
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === deactivateTarget.id ? { ...p, status: 'inactive' as const } : p,
          ),
        );
      }
      setDeactivateTarget(null);
      void utils.university.listUniversityPrograms.invalidate();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProgramForm>({
    resolver: zodResolver(createProgramSchema),
  });

  function onSubmit(data: CreateProgramForm) {
    createMutation.mutate(data);
  }

  function handleDeactivate() {
    if (!deactivateTarget) return;
    deactivateMutation.mutate({ programId: deactivateTarget.id });
  }

  return (
    <>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <Button
            onClick={() => setShowCreate(true)}
            className="min-h-11"
            aria-label={copy.addProgram}
          >
            <Plus size={20} weight="duotone" aria-hidden="true" />
            {copy.addProgram}
          </Button>
        }
      />

      {successName !== null && (
        <Callout variant="success">{copy.success}</Callout>
      )}

      {programs.length === 0 ? (
        <EmptyState
          title={copy.empty.title}
          description={copy.empty.description}
          icon={<Buildings size={32} weight="duotone" />}
          action={
            <Button onClick={() => setShowCreate(true)} variant="outline" size="sm">
              {copy.addProgram}
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.name}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.tuition}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.duration}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.students}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.status}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    {copy.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {programs.map((program) => (
                  <tr
                    key={program.id}
                    className="bg-card transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{program.name}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-foreground">
                      {formatNGN(program.tuitionAmount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {program.durationMonths} {copy.durationUnit}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {program.studentCount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          statusBadgeClass[program.status],
                        )}
                      >
                        {copy.statusLabels[program.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {program.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeactivateTarget(program)}
                          className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          {copy.deactivate.cta}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {programs.map((program) => (
              <div
                key={program.id}
                className="rounded-lg border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{program.name}</p>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      statusBadgeClass[program.status],
                    )}
                  >
                    {copy.statusLabels[program.status]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-mono tabular-nums text-foreground">
                    {formatNGN(program.tuitionAmount)}
                  </span>
                  <span>
                    {program.durationMonths} {copy.durationUnit}
                  </span>
                  <span>
                    {program.studentCount} {copy.table.students.toLowerCase()}
                  </span>
                </div>
                {program.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeactivateTarget(program)}
                    className="min-h-11 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {copy.deactivate.cta}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create program dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreate(false);
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.addProgram}</DialogTitle>
            <DialogDescription>{copy.addProgramDescription}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="prog-name">{copy.form.nameLabel}</Label>
              <Input
                id="prog-name"
                placeholder={copy.form.namePlaceholder}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.name.message ?? copy.form.nameError}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-tuition">{copy.form.tuitionLabel}</Label>
              <Input
                id="prog-tuition"
                type="number"
                min={1}
                placeholder={copy.form.tuitionPlaceholder}
                aria-invalid={!!errors.tuitionAmount}
                {...register('tuitionAmount', { valueAsNumber: true })}
              />
              {errors.tuitionAmount && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.tuitionAmount.message ?? copy.form.tuitionError}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-duration">{copy.form.durationLabel}</Label>
              <Input
                id="prog-duration"
                type="number"
                min={1}
                placeholder={copy.form.durationPlaceholder}
                {...register('durationMonths', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-desc">{copy.form.descriptionLabel}</Label>
              <Textarea
                id="prog-desc"
                placeholder={copy.form.descriptionPlaceholder}
                rows={3}
                {...register('description')}
              />
            </div>
            {createMutation.isError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3">
                <Warning size={16} weight="duotone" className="shrink-0 text-destructive" aria-hidden="true" />
                <p className="text-sm text-destructive">{copy.error}</p>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  reset();
                }}
                className="min-h-11"
              >
                {copy.cancel}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="min-h-11"
              >
                {createMutation.isPending ? copy.form.submittingLabel : copy.form.submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation dialog */}
      <Dialog
        open={!!deactivateTarget}
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{copy.deactivate.confirmTitle}</DialogTitle>
            <DialogDescription>
              {deactivateTarget
                ? copy.deactivate.confirmDescription(deactivateTarget.name)
                : ''}
            </DialogDescription>
          </DialogHeader>
          {deactivateMutation.isError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <Warning size={16} weight="duotone" className="shrink-0 text-destructive" aria-hidden="true" />
              <p className="text-sm text-destructive">{copy.deactivate.error}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeactivateTarget(null)}
              className="min-h-11"
            >
              {copy.deactivate.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={handleDeactivate}
              className="min-h-11"
            >
              {deactivateMutation.isPending
                ? copy.form.submittingLabel
                : copy.deactivate.confirmCta}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
