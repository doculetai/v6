'use client';

type BankAccountCardProps = {
  bankName: string;
  accountNumberMasked: string;
  linkedAt: Date | null;
};

/** Stub — Sprint B will show connected bank details with re-link option. */
export function BankAccountCard({ bankName, accountNumberMasked }: BankAccountCardProps) {
  return (
    <div className="rounded-lg border border-border bg-muted p-3 text-sm">
      <p className="font-medium text-foreground">{bankName}</p>
      <p className="text-muted-foreground">{accountNumberMasked}</p>
    </div>
  );
}
