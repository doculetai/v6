'use client';

import { useState } from 'react';
import { CircleNotch } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { studentCopy } from '@/config/copy/student';
import { cn } from '@/lib/utils';

export type MonoData = {
  accountHolderName: string;
  bankName: string;
  accountNumberMasked: string;
  balanceNgn: number;
  statementPeriod: string;
};

type MonoReviewCardProps = {
  monoData: MonoData;
  proofTargetNgn: number | null;
  onSubmit: () => void;
  isPending?: boolean;
};

function formatNgn(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MonoReviewCard({
  monoData,
  proofTargetNgn,
  onSubmit,
  isPending = false,
}: MonoReviewCardProps) {
  const [confirmed, setConfirmed] = useState(false);
  const copy = studentCopy.monoReviewCard;

  const belowTarget =
    proofTargetNgn !== null && monoData.balanceNgn < proofTargetNgn;

  const fields: { label: string; value: string }[] = [
    { label: copy.accountHolder, value: monoData.accountHolderName },
    { label: copy.bank, value: monoData.bankName },
    { label: copy.accountNumber, value: monoData.accountNumberMasked },
    { label: copy.balance, value: formatNgn(monoData.balanceNgn) },
    { label: copy.statementPeriod, value: monoData.statementPeriod },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <h3 className="text-sm font-semibold text-foreground">{copy.heading}</h3>

      <dl className="divide-y divide-border rounded-lg border border-border overflow-hidden">
        {fields.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3"
          >
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd
              className={cn(
                'text-sm font-medium text-foreground text-right',
                label === copy.balance && 'font-mono tabular-nums',
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {belowTarget ? (
        <Callout variant="warning">{copy.balanceWarning}</Callout>
      ) : null}

      <div className="flex items-start gap-3">
        <Checkbox
          id="mono-confirm"
          checked={confirmed}
          onCheckedChange={(checked) => setConfirmed(Boolean(checked))}
          className="mt-0.5"
        />
        <Label
          htmlFor="mono-confirm"
          className="text-sm text-foreground leading-snug cursor-pointer"
        >
          {copy.confirmCheckbox}
        </Label>
      </div>

      <Button
        type="button"
        className="min-h-11 w-full"
        disabled={!confirmed || isPending}
        onClick={onSubmit}
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <CircleNotch className="size-4 animate-spin" weight="duotone" aria-hidden="true" />
            {copy.submitting}
          </span>
        ) : (
          copy.submit
        )}
      </Button>
    </div>
  );
}
