'use client';

import { useState, type FormEvent } from 'react';
import { DeviceMobile } from '@/components/icons';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { studentCopy } from '@/config/copy/student';
import { trpc } from '@/trpc/client';

type PhoneVerificationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
};

type Stage = 'phone' | 'otp';

export function PhoneVerificationSheet({
  open,
  onOpenChange,
  onVerified,
}: PhoneVerificationSheetProps) {
  const copy = studentCopy.phoneSheet;

  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendOtp = trpc.student.sendContactOtp.useMutation({
    onSuccess: () => {
      setError(null);
      setStage('otp');
    },
    onError: () => {
      setError(copy.errorSend);
    },
  });

  const verifyOtp = trpc.student.verifyContactOtp.useMutation({
    onSuccess: () => {
      setError(null);
      setPhone('');
      setToken('');
      setStage('phone');
      onVerified();
    },
    onError: () => {
      setError(copy.errorVerify);
    },
  });

  const isBusy = sendOtp.isPending || verifyOtp.isPending;

  const handleSendCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    sendOtp.mutate({ channel: 'phone', value: phone.replace(/\s/g, '') });
  };

  const handleVerifyCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    verifyOtp.mutate({ channel: 'phone', value: phone.replace(/\s/g, ''), token });
  };

  const stepIndex = stage === 'phone' ? 1 : 2;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[85svh] w-full max-w-lg overflow-y-auto rounded-t-2xl sm:rounded-t-2xl"
      >
        <SheetHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DeviceMobile className="size-5 text-primary" weight="duotone" aria-hidden="true" />
              <SheetTitle>{copy.title}</SheetTitle>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {stepIndex} / 2
            </span>
          </div>
          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>

        {/* Step indicator */}
        <div className="mb-5 flex gap-1.5" aria-hidden="true">
          <div className="h-1 flex-1 rounded-full bg-primary" />
          <div className={`h-1 flex-1 rounded-full transition-colors ${stage === 'otp' ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {stage === 'phone' ? (
          <form className="space-y-4" onSubmit={handleSendCode}>
            <div className="space-y-2">
              <Label htmlFor="phone-input">{copy.phoneLabel}</Label>
              <Input
                id="phone-input"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={copy.phonePlaceholder}
                required
                autoFocus
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

            <Button type="submit" className="min-h-11 w-full" disabled={isBusy}>
              {sendOtp.isPending ? copy.sendingCta : copy.sendCodeCta}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleVerifyCode}>
            <div className="space-y-2">
              <Label htmlFor="otp-input">{copy.otpLabel}</Label>
              <Input
                id="otp-input"
                inputMode="numeric"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={copy.otpPlaceholder}
                maxLength={6}
                required
                autoFocus
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

            <Button type="submit" className="min-h-11 w-full" disabled={isBusy}>
              {verifyOtp.isPending ? copy.confirmingCta : copy.confirmCta}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11 w-full"
              onClick={() => {
                setStage('phone');
                setToken('');
                setError(null);
              }}
              disabled={isBusy}
            >
              {copy.sendCodeCta}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
