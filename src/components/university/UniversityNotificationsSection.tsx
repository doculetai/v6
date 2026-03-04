'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { universityCopy } from '@/config/copy/university';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

const notificationsSchema = z.object({
  notifyOnSubmission: z.boolean(),
  notifyOnApproval: z.boolean(),
  notifyOnRejection: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsSchema>;

interface UniversityNotificationsSectionProps {
  defaultValues: {
    notifyOnSubmission: boolean;
    notifyOnApproval: boolean;
    notifyOnRejection: boolean;
  };
}

interface CheckboxRowProps {
  id: string;
  label: string;
  description: string;
  registerProps: UseFormRegisterReturn;
}

function CheckboxRow({ id, label, description, registerProps }: CheckboxRowProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        {...registerProps}
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border',
          'accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      />
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function UniversityNotificationsSection({
  defaultValues,
}: UniversityNotificationsSectionProps) {
  const copy = universityCopy.settings.notifications;
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit } = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues,
  });

  const mutation = trpc.university.updateNotifications.useMutation({
    onSuccess: () => {
      setSaved(true);
    },
  });

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [saved]);

  function onSubmit(data: NotificationsFormValues) {
    mutation.mutate(data);
  }

  return (
    <SurfacePanel variant="default" density="comfortable" className="space-y-5">
      {/* Section header */}
      <div className="space-y-1 border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">{copy.sectionTitle}</h2>
        <p className="text-sm text-muted-foreground">{copy.sectionSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <CheckboxRow
          id="notifyOnSubmission"
          label={copy.onSubmission.label}
          description={copy.onSubmission.description}
          registerProps={register('notifyOnSubmission')}
        />
        <CheckboxRow
          id="notifyOnApproval"
          label={copy.onApproval.label}
          description={copy.onApproval.description}
          registerProps={register('notifyOnApproval')}
        />
        <CheckboxRow
          id="notifyOnRejection"
          label={copy.onRejection.label}
          description={copy.onRejection.description}
          registerProps={register('notifyOnRejection')}
        />

        {/* Server error */}
        {mutation.error ? (
          <p className="text-xs text-destructive" role="alert">
            {universityCopy.settings.errors.notificationsSave}
          </p>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
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
      </form>
    </SurfacePanel>
  );
}
