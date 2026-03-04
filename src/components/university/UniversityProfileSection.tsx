'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SurfacePanel } from '@/components/ui/surface-panel';
import { universityCopy } from '@/config/copy/university';
import { trpc } from '@/trpc/client';

const profileSchema = z.object({
  institutionName: z.string().min(1, 'Institution name is required').max(200),
  accreditationBody: z.string().max(200).optional(),
  contactEmail: z
    .string()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  contactPhone: z.string().max(30).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UniversityProfileSectionProps {
  defaultValues: {
    institutionName: string;
    accreditationBody: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
}

export function UniversityProfileSection({ defaultValues }: UniversityProfileSectionProps) {
  const copy = universityCopy.settings.profile;
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      institutionName: defaultValues.institutionName,
      accreditationBody: defaultValues.accreditationBody ?? '',
      contactEmail: defaultValues.contactEmail ?? '',
      contactPhone: defaultValues.contactPhone ?? '',
    },
  });

  const mutation = trpc.university.updateProfile.useMutation({
    onSuccess: () => {
      setSaved(true);
    },
  });

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [saved]);

  function onSubmit(values: ProfileFormValues) {
    mutation.mutate(values);
  }

  return (
    <SurfacePanel variant="default" density="comfortable" className="space-y-5">
      {/* Section header */}
      <div className="space-y-1 border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">{copy.sectionTitle}</h2>
        <p className="text-sm text-muted-foreground">{copy.sectionSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Institution name */}
        <div className="space-y-1.5">
          <Label htmlFor="institutionName">{copy.institutionName.label}</Label>
          <Input
            id="institutionName"
            placeholder={copy.institutionName.placeholder}
            aria-invalid={!!errors.institutionName}
            aria-describedby={errors.institutionName ? 'institutionName-error' : undefined}
            {...register('institutionName')}
          />
          {errors.institutionName ? (
            <p id="institutionName-error" className="text-xs text-destructive" role="alert">
              {errors.institutionName.message}
            </p>
          ) : null}
        </div>

        {/* Accreditation body */}
        <div className="space-y-1.5">
          <Label htmlFor="accreditationBody">{copy.accreditationBody.label}</Label>
          <Input
            id="accreditationBody"
            placeholder={copy.accreditationBody.placeholder}
            aria-invalid={!!errors.accreditationBody}
            {...register('accreditationBody')}
          />
        </div>

        {/* Contact email + phone — side by side on md+ */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">{copy.contactEmail.label}</Label>
            <Input
              id="contactEmail"
              type="email"
              inputMode="email"
              placeholder={copy.contactEmail.placeholder}
              aria-invalid={!!errors.contactEmail}
              aria-describedby={errors.contactEmail ? 'contactEmail-error' : undefined}
              {...register('contactEmail')}
            />
            {errors.contactEmail ? (
              <p id="contactEmail-error" className="text-xs text-destructive" role="alert">
                {errors.contactEmail.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">{copy.contactPhone.label}</Label>
            <Input
              id="contactPhone"
              type="tel"
              inputMode="tel"
              placeholder={copy.contactPhone.placeholder}
              {...register('contactPhone')}
            />
          </div>
        </div>

        {/* Server error */}
        {mutation.error ? (
          <p className="text-xs text-destructive" role="alert">
            {universityCopy.settings.errors.profileSave}
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
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="min-h-[44px]"
          >
            {mutation.isPending ? copy.saving : copy.saveButton}
          </Button>
        </div>
      </form>
    </SurfacePanel>
  );
}
