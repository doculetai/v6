'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { MaskedValue } from '@/components/ui/masked-value';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { partnerCopy } from '@/config/copy/partner';
import { cn } from '@/lib/utils';

const copy = partnerCopy.apiKeys;

const SCOPE_OPTIONS = [
  { value: 'verifications:read', label: copy.createKey.scopes.verificationsRead },
  { value: 'certificates:read', label: copy.createKey.scopes.certificatesRead },
  { value: 'webhooks:write', label: copy.createKey.scopes.webhooksWrite },
  { value: 'students:read', label: copy.createKey.scopes.studentsRead },
] as const;

const createKeySchema = z.object({
  name: z
    .string()
    .min(1, copy.validation.nameRequired)
    .max(100, copy.validation.nameTooLong),
  environment: z.enum(['production', 'sandbox']),
  scopes: z
    .array(z.enum(['verifications:read', 'certificates:read', 'webhooks:write', 'students:read']))
    .min(1, copy.validation.scopesRequired),
});

type CreateKeyFormValues = z.infer<typeof createKeySchema>;

interface ApiKeyResult {
  id: string;
  name: string;
  environment: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

interface NewKeyData {
  plaintext: string;
  name: string;
}

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (key: ApiKeyResult) => void;
  onSubmit: (values: CreateKeyFormValues) => Promise<{ key: ApiKeyResult; plaintext: string }>;
}

export function CreateKeyDialog({ open, onOpenChange, onCreated, onSubmit }: CreateKeyDialogProps) {
  const [newKey, setNewKey] = useState<NewKeyData | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateKeyFormValues>({
    resolver: zodResolver(createKeySchema),
    defaultValues: { name: '', environment: 'production', scopes: [] },
  });

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setNewKey(null);
      setCopied(false);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  }

  const onFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const result = await onSubmit(values);
      setNewKey({ plaintext: result.plaintext, name: values.name });
      onCreated(result.key);
    } catch {
      setSubmitError(partnerCopy.errors.generic);
    }
  });

  async function handleCopy() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey.plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {newKey ? (
          <>
            <DialogHeader>
              <DialogTitle>{copy.newKeyCreated.title}</DialogTitle>
              <DialogDescription>{copy.newKeyCreated.description}</DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {copy.newKeyCreated.copyLabel}
              </p>
              <div className="flex items-center justify-between gap-2">
                <MaskedValue value={newKey.plaintext} className="min-w-0 flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="size-4 text-primary" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">{copy.newKeyCreated.copyCta}</span>
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>{copy.newKeyCreated.doneCta}</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{copy.createKey.title}</DialogTitle>
              <DialogDescription>{copy.subtitle}</DialogDescription>
            </DialogHeader>
            <form id="create-key-form" onSubmit={onFormSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="key-name">{copy.createKey.nameLabel}</Label>
                <Input
                  id="key-name"
                  placeholder={copy.createKey.namePlaceholder}
                  aria-invalid={Boolean(errors.name)}
                  {...register('name')}
                />
                {errors.name?.message ? (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="key-environment">{copy.createKey.environmentLabel}</Label>
                <Controller
                  control={control}
                  name="environment"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="key-environment" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">
                          {copy.createKey.environments.production}
                        </SelectItem>
                        <SelectItem value="sandbox">
                          {copy.createKey.environments.sandbox}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>{copy.createKey.scopesLabel}</Label>
                <Controller
                  control={control}
                  name="scopes"
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      {SCOPE_OPTIONS.map((scope) => {
                        const isSelected = field.value.includes(scope.value);
                        return (
                          <button
                            key={scope.value}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                field.onChange(field.value.filter((v) => v !== scope.value));
                              } else {
                                field.onChange([...field.value, scope.value]);
                              }
                            }}
                            className={cn(
                              'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              isSelected
                                ? 'border-primary/60 bg-primary/10 text-foreground dark:bg-primary/15'
                                : 'border-border bg-card text-foreground hover:bg-accent',
                            )}
                            aria-pressed={isSelected}
                          >
                            <span
                              className={cn(
                                'flex size-4 shrink-0 items-center justify-center rounded border',
                                isSelected ? 'border-primary bg-primary' : 'border-border',
                              )}
                              aria-hidden="true"
                            >
                              {isSelected && <Check className="size-3 text-primary-foreground" />}
                            </span>
                            {scope.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.scopes?.message ? (
                  <p className="text-sm text-destructive">{errors.scopes.message}</p>
                ) : null}
              </div>
            </form>
            {submitError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:border-destructive/40 dark:bg-destructive/15">
                {submitError}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                {copy.createKey.cancel}
              </Button>
              <Button type="submit" form="create-key-form" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {copy.createKey.confirmCta}
                  </span>
                ) : (
                  copy.createKey.confirmCta
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
