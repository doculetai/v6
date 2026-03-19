'use client';

import { useState } from 'react';
import { Plus, GraduationCap, Clock, PencilSimple, Prohibit } from '@/components/icons';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { PageShell, Section, Stack, Grid } from '@/components/layout/content-primitives';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { trpc } from '@/trpc/client';
import { routes } from '@/config/routes';
import type { RouterOutputs } from '@/trpc/client';
import { primitivesCopy } from '@/config/copy/primitives';
import { universityCopy } from '@/config/copy/university';

const programFormCopy = universityCopy.programs.programForm;

type ProgramItem = RouterOutputs['universityManagement']['listUniversityPrograms'][number];

type EditDialogCopy = {
  title: string;
  description: string;
  saveCta: string;
  saving: string;
  success: string;
};

type DeactivateCopy = {
  cta: string;
  confirmTitle: string;
  confirmDescription: (name: string) => string;
  confirmCta: string;
  cancelCta: string;
  success: string;
};

type ProgramsCopy = {
  title: string;
  subtitle: string;
  table: {
    name: string;
    tuition: string;
    duration: string;
    students: string;
    status: string;
    actions: string;
  };
  statusLabels: {
    active: string;
    inactive: string;
  };
  addProgram: string;
  addProgramDescription: string;
  form: {
    nameLabel: string;
    namePlaceholder: string;
    tuitionLabel: string;
    tuitionPlaceholder: string;
    currencyLabel: string;
    durationLabel: string;
    durationPlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
  };
  durationUnit: string;
  success: string;
  error: string;
  empty: { title: string; description: string; viewStudents: string };
  editDialog: EditDialogCopy;
  deactivate: DeactivateCopy;
};

type Props = {
  copy: ProgramsCopy;
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// ── Add Program Dialog ───────────────────────────────────────────────────────

type AddProgramDialogProps = {
  copy: ProgramsCopy;
  onSuccess: () => void;
};

// ── Line-item state helpers ───────────────────────────────────────────────────

type LineItems = {
  tuition: string;
  accommodation: string;
  livingExpenses: string;
  visaAdminFees: string;
  other: string;
};

const emptyLineItems: LineItems = {
  tuition: '',
  accommodation: '',
  livingExpenses: '',
  visaAdminFees: '',
  other: '',
};

function sumLineItems(items: LineItems): number {
  return Object.values(items).reduce((sum, v) => {
    const n = parseInt(v, 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
}

// ── Add Program Dialog ────────────────────────────────────────────────────────

function AddProgramDialog({ copy, onSuccess }: AddProgramDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [lineItems, setLineItems] = useState<LineItems>(emptyLineItems);
  const [currency, setCurrency] = useState('NGN');
  const [duration, setDuration] = useState('');

  const total = sumLineItems(lineItems);

  const resetForm = () => {
    setName('');
    setLineItems(emptyLineItems);
    setCurrency('NGN');
    setDuration('');
  };

  const createProgram = trpc.universityManagement.createUniversityProgram.useMutation({
    onSuccess: () => {
      onSuccess();
      toast.success(copy.success);
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(copy.error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationNum = parseInt(duration, 10);
    if (!name || total <= 0 || isNaN(durationNum)) return;
    createProgram.mutate({ name, tuitionAmount: total, currency, durationMonths: durationNum });
  };

  const lineItemFields: { key: keyof LineItems; label: string }[] = [
    { key: 'tuition', label: programFormCopy.lineItems.tuition },
    { key: 'accommodation', label: programFormCopy.lineItems.accommodation },
    { key: 'livingExpenses', label: programFormCopy.lineItems.livingExpenses },
    { key: 'visaAdminFees', label: programFormCopy.lineItems.visaAdminFees },
    { key: 'other', label: programFormCopy.lineItems.other },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="min-h-11 gap-1.5">
          <Plus className="size-4" weight="duotone" aria-hidden="true" />
          {copy.addProgram}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy.addProgram}</DialogTitle>
          <DialogDescription>{copy.addProgramDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-program-name">{copy.form.nameLabel}</Label>
            <Input
              id="add-program-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.form.namePlaceholder}
              required
            />
          </div>

          {/* Line-item breakdown */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{copy.form.tuitionLabel}</p>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 space-y-2">
              {lineItemFields.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-sm text-muted-foreground">{label}</span>
                  <Input
                    type="number"
                    value={lineItems[key]}
                    onChange={(e) => setLineItems((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder="0"
                    min={0}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
              <span className="text-sm font-medium text-foreground">{programFormCopy.totalLabel}</span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {currency} {total.toLocaleString('en-NG')}
              </span>
            </div>
          </div>

          <Grid cols={2}>
            <div className="space-y-2">
              <Label htmlFor="add-program-currency">{copy.form.currencyLabel}</Label>
              <Input
                id="add-program-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder={primitivesCopy.currency.NGN}
                maxLength={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-program-duration">{copy.form.durationLabel}</Label>
              <Input
                id="add-program-duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={copy.form.durationPlaceholder}
                min={1}
                max={120}
                required
              />
            </div>
          </Grid>

          <DialogFooter>
            <Button type="submit" className="min-h-11" disabled={createProgram.isPending || total <= 0}>
              {createProgram.isPending ? copy.form.submittingLabel : copy.form.submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Program Dialog ──────────────────────────────────────────────────────

type EditProgramDialogProps = {
  program: ProgramItem;
  copy: ProgramsCopy;
  onSuccess: () => void;
};

function EditProgramDialog({ program, copy, onSuccess }: EditProgramDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(program.name);
  const [tuition, setTuition] = useState(String(program.tuitionAmount));
  const [currency, setCurrency] = useState(program.currency);
  const [duration, setDuration] = useState(String(program.durationMonths));

  const updateProgram = trpc.universityManagement.updateProgram.useMutation({
    onSuccess: () => {
      onSuccess();
      toast.success(copy.editDialog.success);
      setOpen(false);
    },
    onError: () => {
      toast.error(copy.error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tuitionNum = parseInt(tuition, 10);
    const durationNum = parseInt(duration, 10);
    if (!name || isNaN(tuitionNum) || isNaN(durationNum)) return;
    updateProgram.mutate({
      programId: program.id,
      name,
      tuitionAmount: tuitionNum,
      currency,
      durationMonths: durationNum,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="min-h-[44px] min-w-[44px] p-0"
          aria-label={`${copy.editDialog.title} — ${program.name}`}
        >
          <PencilSimple className="size-4" weight="duotone" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.editDialog.title}</DialogTitle>
          <DialogDescription>{copy.editDialog.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-name-${program.id}`}>{copy.form.nameLabel}</Label>
            <Input
              id={`edit-name-${program.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.form.namePlaceholder}
              required
            />
          </div>
          <Grid cols={2}>
            <div className="space-y-2">
              <Label htmlFor={`edit-tuition-${program.id}`}>{copy.form.tuitionLabel}</Label>
              <Input
                id={`edit-tuition-${program.id}`}
                type="number"
                value={tuition}
                onChange={(e) => setTuition(e.target.value)}
                placeholder={copy.form.tuitionPlaceholder}
                min={0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-currency-${program.id}`}>{copy.form.currencyLabel}</Label>
              <Input
                id={`edit-currency-${program.id}`}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder={primitivesCopy.currency.NGN}
                maxLength={3}
                required
              />
            </div>
          </Grid>
          <div className="space-y-2">
            <Label htmlFor={`edit-duration-${program.id}`}>{copy.form.durationLabel}</Label>
            <Input
              id={`edit-duration-${program.id}`}
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={copy.form.durationPlaceholder}
              min={1}
              max={120}
              required
            />
          </div>
          {parseInt(tuition, 10) > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {programFormCopy.costPreview.heading}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{programFormCopy.costPreview.tuitionLabel}</span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {currency} {parseInt(tuition, 10).toLocaleString('en-NG')}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" className="min-h-11" disabled={updateProgram.isPending}>
              {updateProgram.isPending ? copy.editDialog.saving : copy.editDialog.saveCta}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Deactivate Confirm Dialog ────────────────────────────────────────────────

type DeactivateDialogProps = {
  program: ProgramItem;
  copy: ProgramsCopy;
  onSuccess: () => void;
};

function DeactivateDialog({ program, copy, onSuccess }: DeactivateDialogProps) {
  const [open, setOpen] = useState(false);

  const deactivate = trpc.universityManagement.deactivateProgram.useMutation({
    onSuccess: () => {
      onSuccess();
      toast.success(copy.deactivate.success);
      setOpen(false);
    },
    onError: () => {
      toast.error(copy.error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="min-h-[44px] min-w-[44px] p-0 text-destructive hover:text-destructive"
          aria-label={`${copy.deactivate.cta} — ${program.name}`}
        >
          <Prohibit className="size-4" weight="duotone" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{copy.deactivate.confirmTitle}</DialogTitle>
          <DialogDescription>{copy.deactivate.confirmDescription(program.name)}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="min-h-11" onClick={() => setOpen(false)}>
            {copy.deactivate.cancelCta}
          </Button>
          <Button
            variant="destructive"
            className="min-h-11"
            disabled={deactivate.isPending}
            onClick={() => deactivate.mutate({ programId: program.id })}
          >
            {deactivate.isPending ? (
              <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              copy.deactivate.confirmCta
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function ProgramsPageClient({ copy }: Props) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const utils = trpc.useUtils();

  const { data: programs, isLoading } =
    trpc.universityManagement.listUniversityPrograms.useQuery();

  const invalidate = () => {
    void utils.universityManagement.listUniversityPrograms.invalidate();
  };

  if (isLoading) {
    return (
      <PageShell width="wide">
        <Section>
          <PageHeader title={copy.title} subtitle={copy.subtitle} />
          <div className="flex items-center justify-center py-12">
            <Clock
              className="size-6 animate-pulse text-muted-foreground"
              weight="duotone"
              aria-hidden="true"
            />
          </div>
        </Section>
      </PageShell>
    );
  }

  const addButton = <AddProgramDialog copy={copy} onSuccess={invalidate} />;

  return (
    <PageShell width="wide">
      <Section>
        <Stack gap="md">
          <PageHeader
            title={copy.title}
            subtitle={copy.subtitle}
            breadcrumbs={breadcrumbs}
            actions={addButton}
          />

          {!programs || programs.length === 0 ? (
            <EmptyState
              heading={copy.empty.title}
              body={copy.empty.description}
              action={{ label: copy.empty.viewStudents, href: routes.dashboard.university.students }}
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
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
                      <td className="px-4 py-3 text-foreground">
                        <div className="flex items-center gap-2">
                          <GraduationCap
                            className="size-4 text-muted-foreground"
                            weight="duotone"
                            aria-hidden="true"
                          />
                          <span className={program.status === 'inactive' ? 'text-muted-foreground line-through' : undefined}>
                            {program.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">
                        {formatCurrency(program.tuitionAmount, program.currency)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {program.durationMonths} {copy.durationUnit}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {program.studentCount}
                      </td>
                      <td className="px-4 py-3">
                        {program.status === 'active' ? (
                          <Badge variant="default" className="text-xs">{copy.statusLabels.active}</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">{copy.statusLabels.inactive}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <EditProgramDialog
                            program={program}
                            copy={copy}
                            onSuccess={invalidate}
                          />
                          {program.status === 'active' ? (
                            <DeactivateDialog
                              program={program}
                              copy={copy}
                              onSuccess={invalidate}
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Stack>
      </Section>
    </PageShell>
  );
}
