'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Container, PageHeader, Stack } from '@/components/layout/content-primitives';
import { useDashboardBreadcrumbs } from '@/lib/hooks/useDashboardBreadcrumbs';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/trpc/client';
import { primitivesCopy } from '@/config/copy/primitives';
import { commonUi } from '@/config/copy/shared';
import { adminCopy } from '@/config/copy/admin';

type PlatformFeeConfig = {
  id: string;
  feeType: 'percentage' | 'fixed';
  valueKobo: number;
  currency: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Copy = typeof adminCopy.platformFees;

type Props = {
  initialConfigs: PlatformFeeConfig[];
  copy: Copy;
};

function formatValue(config: PlatformFeeConfig): string {
  if (config.feeType === 'percentage') {
    return `${(config.valueKobo / 100).toFixed(2)}%`;
  }
  return `${config.valueKobo.toLocaleString()} kobo`;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function PlatformFeesPageClient({ initialConfigs, copy }: Props) {
  const breadcrumbs = useDashboardBreadcrumbs(copy.title);
  const [configs, setConfigs] = useState<PlatformFeeConfig[]>(initialConfigs);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [endConfirmId, setEndConfirmId] = useState<string | null>(null);
  const [formFeeType, setFormFeeType] = useState<'percentage' | 'fixed'>('percentage');
  const [formValueKobo, setFormValueKobo] = useState('');
  const [formCurrency, setFormCurrency] = useState('NGN');

  const utils = trpc.useUtils();

  const createMutation = trpc.admin.createPlatformFeeConfig.useMutation({
    onSuccess(row) {
      setConfigs((prev) => [row, ...prev]);
      setAddOpen(false);
      resetForm();
      void utils.admin.listPlatformFeeConfig.invalidate();
    },
  });

  const updateMutation = trpc.admin.updatePlatformFeeConfig.useMutation({
    onSuccess(row) {
      if (row) {
        setConfigs((prev) =>
          prev.map((c) => (c.id === row.id ? row : c)),
        );
      }
      setEditId(null);
      void utils.admin.listPlatformFeeConfig.invalidate();
    },
  });

  const endMutation = trpc.admin.endPlatformFeeConfig.useMutation({
    onSuccess(row) {
      if (row) {
        setConfigs((prev) =>
          prev.map((c) => (c.id === row.id ? row : c)),
        );
      }
      setEndConfirmId(null);
      void utils.admin.listPlatformFeeConfig.invalidate();
    },
  });

  function resetForm() {
    setFormFeeType('percentage');
    setFormValueKobo('');
    setFormCurrency('NGN');
  }

  function openAdd() {
    resetForm();
    setAddOpen(true);
  }

  function openEdit(config: PlatformFeeConfig) {
    setFormFeeType(config.feeType);
    setFormValueKobo(String(config.valueKobo));
    setFormCurrency(config.currency);
    setEditId(config.id);
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseInt(formValueKobo, 10);
    if (Number.isNaN(value) || value < 0) return;
    createMutation.mutate({
      feeType: formFeeType,
      valueKobo: value,
      currency: formCurrency,
    });
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    const value = parseInt(formValueKobo, 10);
    if (Number.isNaN(value) || value < 0) return;
    updateMutation.mutate({ id: editId, valueKobo: value });
  }

  const editingConfig = editId ? configs.find((c) => c.id === editId) : null;

  return (
    <Container width="md">
      <Stack gap="md">
        <PageHeader title={copy.title} subtitle={copy.subtitle} breadcrumbs={breadcrumbs} />
        <div className="flex justify-end">
          <Button onClick={openAdd}>{copy.add}</Button>
        </div>

        {configs.length === 0 ? (
          <EmptyState
            heading={copy.empty.title}
            body={copy.empty.description}
            action={{
              label: copy.add,
              onClick: openAdd,
            }}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-140 text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.currency}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.feeType}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    {copy.table.value}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.effectiveFrom}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {copy.table.effectiveTo}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    {copy.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {configs.map((c) => (
                  <tr
                    key={c.id}
                    className="bg-card transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {c.currency}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {copy.feeTypes[c.feeType]}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {formatValue(c)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(c.effectiveFrom)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.effectiveTo
                        ? formatDate(c.effectiveTo)
                        : <span className="text-muted-foreground/60">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!c.effectiveTo && (
                        <>
                          <Button
                            variant="outline"
                            size="xs"
                            className="mr-2"
                            onClick={() => openEdit(c)}
                          >
                            {copy.edit}
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setEndConfirmId(c.id)}
                          >
                            {copy.end}
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Stack>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>{copy.add}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-currency">{copy.form.currency}</Label>
                <Input
                  id="add-currency"
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value.toUpperCase())}
                  placeholder={primitivesCopy.currency.NGN}
                  maxLength={10}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-feeType">{copy.form.feeType}</Label>
                <Select
                  value={formFeeType}
                  onValueChange={(v) =>
                    setFormFeeType(v as 'percentage' | 'fixed')
                  }
                >
                  <SelectTrigger id="add-feeType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      {copy.feeTypes.percentage}
                    </SelectItem>
                    <SelectItem value="fixed">{copy.feeTypes.fixed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-valueKobo">{copy.form.valueKobo}</Label>
                <Input
                  id="add-valueKobo"
                  type="number"
                  min={0}
                  value={formValueKobo}
                  onChange={(e) => setFormValueKobo(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
              >
                {copy.form.cancel}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !formValueKobo}
              >
                {copy.form.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>{copy.edit}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {editingConfig && (
                <p className="text-sm text-muted-foreground">
                  {editingConfig.currency} — {copy.feeTypes[editingConfig.feeType]}
                </p>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-valueKobo">{copy.form.valueKobo}</Label>
                <Input
                  id="edit-valueKobo"
                  type="number"
                  min={0}
                  value={formValueKobo}
                  onChange={(e) => setFormValueKobo(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditId(null)}
              >
                {copy.form.cancel}
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || !formValueKobo}
              >
                {copy.form.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* End confirm dialog */}
      <Dialog
        open={!!endConfirmId}
        onOpenChange={(o) => !o && setEndConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.end}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {copy.endConfirmBody}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndConfirmId(null)}>
              {commonUi.close}
            </Button>
            <Button
              variant="destructive"
              disabled={endMutation.isPending}
              onClick={() => {
                if (endConfirmId) {
                  endMutation.mutate({ id: endConfirmId });
                }
              }}
            >
              {copy.end}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
