'use client';

import { useState, type FormEvent } from 'react';
import { ShieldCheck, Warning } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TrustSignal } from '@/components/ui/trust-signal';
import { uiPrimitives } from '@/config/copy/primitives';
import { studentCopy } from '@/config/copy/student';
import { trpc } from '@/trpc/client';

type KycIdentitySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  failedAttempts: number;
};

type IdentityType = 'bvn' | 'nin' | 'passport';

export function KycIdentitySheet({
  open,
  onOpenChange,
  onSuccess,
  failedAttempts,
}: KycIdentitySheetProps) {
  const copy = studentCopy.kycSheet;

  const [identityType, setIdentityType] = useState<IdentityType>('bvn');
  const [identityNumber, setIdentityNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const utils = trpc.useUtils();

  const dojahMutation = trpc.student.startDojahIdentityCheck.useMutation({
    onSuccess: async () => {
      setError(null);
      setSuccess(true);
      setIdentityNumber('');
      await utils.student.getVerificationStatus.invalidate();
      onSuccess();
    },
    onError: () => {
      setError(copy.errorGeneric);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    dojahMutation.mutate({ identityType, identityNumber });
  };

  const showManualFallback = failedAttempts >= 2;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[85svh] w-full max-w-lg overflow-y-auto rounded-t-2xl sm:rounded-t-2xl"
      >
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" weight="duotone" aria-hidden="true" />
            <SheetTitle>{copy.title}</SheetTitle>
          </div>
          <SheetDescription>{copy.description}</SheetDescription>
          <TrustSignal message={uiPrimitives.trustSignals.kyc} />
        </SheetHeader>

        <div className="pb-4">
          {failedAttempts > 0 && !success ? (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-muted p-3">
              <Warning className="mt-0.5 size-4 shrink-0 text-muted-foreground" weight="duotone" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">{copy.failureGuidance}</p>
            </div>
          ) : null}

          {success ? (
            <div className="rounded-lg border border-border bg-muted p-4 text-center">
              <p className="text-sm font-medium text-foreground">{copy.successMessage}</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="kyc-identity-type">{copy.identityTypeLabel}</Label>
                <Select
                  value={identityType}
                  onValueChange={(v) => setIdentityType(v as IdentityType)}
                >
                  <SelectTrigger id="kyc-identity-type" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bvn">{copy.identityTypes.bvn}</SelectItem>
                    <SelectItem value="nin">{copy.identityTypes.nin}</SelectItem>
                    <SelectItem value="passport">{copy.identityTypes.passport}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kyc-identity-number">{copy.identityNumberLabel}</Label>
                <Input
                  id="kyc-identity-number"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  minLength={6}
                  maxLength={32}
                  required
                  autoFocus
                />
              </div>

              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}

              <Button type="submit" className="min-h-11 w-full" disabled={dojahMutation.isPending}>
                {dojahMutation.isPending ? copy.submittingCta : copy.submitCta}
              </Button>

              {showManualFallback ? (
                <Button asChild variant="outline" size="sm" className="min-h-11 w-full">
                  <Link href={copy.manualFallbackHref}>
                    {copy.manualFallbackCta}
                  </Link>
                </Button>
              ) : null}
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
