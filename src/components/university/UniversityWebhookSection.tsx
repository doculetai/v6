'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Info, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { universityCopy } from '@/config/copy/university';
import { trpc } from '@/trpc/client';

const webhookSchema = z.object({
  webhookUrl: z
    .string()
    .url('Enter a valid URL starting with https://')
    .refine((u) => u.startsWith('https://'), 'Webhook URL must use HTTPS')
    .optional()
    .or(z.literal('')),
});

type WebhookFormValues = z.infer<typeof webhookSchema>;

interface UniversityWebhookSectionProps {
  defaultValues: {
    webhookUrl: string | null;
  };
}

export function UniversityWebhookSection({ defaultValues }: UniversityWebhookSectionProps) {
  const copy = universityCopy.settings.webhook;
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      webhookUrl: defaultValues.webhookUrl ?? '',
    },
  });

  const mutation = trpc.university.updateWebhook.useMutation({
    onSuccess: () => {
      setSaved(true);
    },
  });

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [saved]);

  function onSubmit(values: WebhookFormValues) {
    mutation.mutate({ webhookUrl: values.webhookUrl });
  }

  function handleClear() {
    setValue('webhookUrl', '');
    mutation.mutate({ webhookUrl: '' });
  }

  return (
    <SurfacePanel variant="default" density="comfortable" className="space-y-5">
      {/* Section header */}
      <div className="space-y-1 border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">{copy.sectionTitle}</h2>
        <p className="text-sm text-muted-foreground">{copy.sectionSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Webhook URL input */}
        <div className="space-y-1.5">
          <Label htmlFor="webhookUrl">{copy.webhookUrl.label}</Label>
          <Input
            id="webhookUrl"
            type="url"
            inputMode="url"
            placeholder={copy.webhookUrl.placeholder}
            aria-invalid={!!errors.webhookUrl}
            aria-describedby={
              errors.webhookUrl ? 'webhookUrl-error' : 'webhookUrl-help'
            }
            {...register('webhookUrl')}
          />
          {errors.webhookUrl ? (
            <p id="webhookUrl-error" className="text-xs text-destructive" role="alert">
              {errors.webhookUrl.message}
            </p>
          ) : (
            <p
              id="webhookUrl-help"
              className="flex items-start gap-1.5 text-xs text-muted-foreground"
            >
              <Info size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
              {copy.helpText}
            </p>
          )}
        </div>

        {/* Server error */}
        {mutation.error ? (
          <p className="text-xs text-destructive" role="alert">
            {universityCopy.settings.errors.webhookSave}
          </p>
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Clear button — only when a webhook is set */}
          {defaultValues.webhookUrl ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={mutation.isPending}
              className="min-h-[44px] gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={16} aria-hidden="true" />
              {copy.clearButton}
            </Button>
          ) : (
            <div aria-hidden="true" />
          )}

          <div className="flex items-center gap-3">
            {saved ? (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                <Check size={16} aria-hidden="true" />
                {copy.saved}
              </span>
            ) : null}
            <Button type="submit" disabled={mutation.isPending} className="min-h-[44px]">
              {mutation.isPending ? copy.saving : copy.saveButton}
            </Button>
          </div>
        </div>
      </form>
    </SurfacePanel>
  );
}
