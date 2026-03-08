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
    <Card className="border-success/30 bg-success/5 dark:border-success/40 dark:bg-success/10">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <CheckCircle
          weight="duotone"
          className="size-5 text-success"
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
          <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs dark:border-warning/40 dark:bg-warning/15">
            <PauseCircle size={14} weight="duotone" className="shrink-0 text-warning" aria-hidden="true" />
            <span className="text-warning">{sponsorCardCopy.paused.note}</span>
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
