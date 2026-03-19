'use client';

import { useEffect, useState } from 'react';
import { User } from '@/components/icons';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authPrimitives, feedbackPrimitives } from '@/config/copy/primitives';
import { trpc } from '@/trpc/client';

const copy = authPrimitives.profileEdit;

export function ProfileEditCard() {
  const { data: profile, isLoading } = trpc.student.getProfile.useQuery();
  const utils = trpc.useUtils();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profile && !initialized) {
      setFullName(profile.fullName ?? '');
      setPhone(profile.phone ?? '');
      setWhatsapp(profile.whatsappNumber ?? '');
      setInitialized(true);
    }
  }, [profile, initialized]);

  const mutation = trpc.student.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(copy.success);
      void utils.student.getProfile.invalidate();
    },
    onError: () => {
      toast.error(copy.error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      fullName: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
      whatsappNumber: whatsapp.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{feedbackPrimitives.loading.default}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User weight="duotone" className="size-5 text-muted-foreground" aria-hidden />
          {copy.title}
        </CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-full-name">{copy.fullNameLabel}</Label>
            <Input
              id="profile-full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">{copy.phoneLabel}</Label>
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-whatsapp">{copy.whatsappLabel}</Label>
            <Input
              id="profile-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{copy.emailLabel}</Label>
            <p className="text-sm text-foreground">{profile?.email ?? '\u2014'}</p>
            <p className="text-xs text-muted-foreground">{copy.emailHint}</p>
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? copy.saving : copy.saveCta}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
