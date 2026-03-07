'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, DeviceMobile } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PhoneVerificationSheet } from '@/components/student/PhoneVerificationSheet';
import { studentCopy } from '@/config/copy/student';

export function PhoneVerificationPromptCard() {
  const copy = studentCopy.phoneVerificationPrompt;
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleVerified = useCallback(() => {
    setOpen(false);
    router.refresh();
  }, [router]);

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/[0.04] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <DeviceMobile
              className="size-5 text-primary"
              weight="duotone"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              {copy.eyebrow}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {copy.heading}
            </p>
            <p className="mt-0.5 max-w-prose text-sm text-muted-foreground">
              {copy.description}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="mt-1 min-h-11 shrink-0 sm:mt-0"
          onClick={() => setOpen(true)}
        >
          <span className="inline-flex items-center gap-1.5">
            {copy.cta}
            <ArrowRight className="size-3.5" weight="duotone" aria-hidden="true" />
          </span>
        </Button>
      </div>

      <PhoneVerificationSheet
        open={open}
        onOpenChange={setOpen}
        onVerified={handleVerified}
      />
    </>
  );
}
