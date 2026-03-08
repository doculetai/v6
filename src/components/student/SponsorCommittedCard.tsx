import { CheckCircle, PauseCircle, XCircle } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentCopy } from '@/config/copy/student';
import { formatCurrency } from '@/lib/utils';

type Props = {
  sponsorName: string;
  amountKobo: number;
  currency: string;
  fundingTypeLabel: string;
  /** Optional lifecycle status — 'active' is default, 'paused' and 'withdrawn' show callouts */
  status?: 'active' | 'paused' | 'withdrawn';
};

export function SponsorCommittedCard({
  sponsorName,
  amountKobo,
  currency,
  fundingTypeLabel,
  status = 'active',
}: Props) {
  const copy = studentCopy.sponsorCommitted;
  const sponsorCardCopy = studentCopy.sponsorCard;

  return (
    <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <CheckCircle
          weight="duotone"
          className="size-5 text-green-600 dark:text-green-400"
          aria-hidden="true"
        />
        <CardTitle className="text-base">{sponsorName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="space-y-1">
          <p>
            <span className="font-mono font-medium text-foreground">
              {formatCurrency(amountKobo / 100, currency)}
            </span>{' '}
            {copy.amountLabel.toLowerCase()}
          </p>
          <p>{fundingTypeLabel}</p>
        </div>

        {status === 'paused' && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-800 dark:bg-amber-950/30">
            <PauseCircle size={14} weight="duotone" className="shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span className="text-amber-700 dark:text-amber-300">{sponsorCardCopy.paused.note}</span>
          </div>
        )}
        {status === 'withdrawn' && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs">
            <XCircle size={14} weight="duotone" className="shrink-0 text-destructive" aria-hidden="true" />
            <span className="text-destructive">{sponsorCardCopy.withdrawn.note}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
