'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { partnerCopy } from '@/config/copy/partner';
import { trpc } from '@/trpc/client';

type Props = {
  used: number;
  limit: number;
};

const copy = partnerCopy;

export function PartnerHighUsageCallout({ used, limit }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const requestIncrease = trpc.partner.requestLimitIncrease.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setReason('');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 10) return;
    requestIncrease.mutate({ reason: reason.trim() });
  }

  return (
    <>
      <div
        role="alert"
        className="flex flex-col gap-2 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-warning-foreground">
          {copy.highUsage.note(used, limit)}
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setSheetOpen(true);
          }}
          className="shrink-0 text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copy.highUsage.requestIncrease}
        </button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{copy.limitRequest.title}</SheetTitle>
          </SheetHeader>

          {submitted ? (
            <p className="mt-4 text-sm text-success">{copy.limitRequest.success}</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="limit-reason">{copy.limitRequest.reasonLabel}</Label>
                <textarea
                  id="limit-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={copy.limitRequest.reasonPlaceholder}
                  rows={4}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"
                  required
                  minLength={10}
                />
              </div>
              <Button
                type="submit"
                className="w-full min-h-11"
                disabled={reason.trim().length < 10 || requestIncrease.isPending}
              >
                {requestIncrease.isPending
                  ? copy.limitRequest.submitting
                  : copy.limitRequest.submit}
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
