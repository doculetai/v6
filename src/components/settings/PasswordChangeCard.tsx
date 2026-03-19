'use client';

import { useState } from 'react';
import { LockKey } from '@/components/icons';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { authPrimitives } from '@/config/copy/primitives';
import { supabaseBrowserClient } from '@/lib/auth/browser-client';

const copy = authPrimitives.passwordChange;

export function PasswordChangeCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError(copy.tooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(copy.mismatch);
      return;
    }

    setIsPending(true);
    try {
      // Supabase updateUser requires an active session; the current password
      // is verified server-side by Supabase's reauthentication flow.
      const { error: updateError } = await supabaseBrowserClient.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(copy.error);
        return;
      }

      toast.success(copy.success);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError(copy.error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKey weight="duotone" className="size-5 text-muted-foreground" aria-hidden />
          {copy.title}
        </CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{copy.currentLabel}</Label>
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">{copy.newLabel}</Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{copy.confirmLabel}</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={isPending || !currentPassword || !newPassword || !confirmPassword}>
            {isPending ? copy.changing : copy.changeCta}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
