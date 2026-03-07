import { CheckCircle } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentCopy } from '@/config/copy/student';
import { formatCurrency } from '@/lib/utils';

type Props = {
  sponsorName: string;
  amountKobo: number;
  currency: string;
  fundingTypeLabel: string;
};

export function SponsorCommittedCard({
  sponsorName,
  amountKobo,
  currency,
  fundingTypeLabel,
}: Props) {
  const copy = studentCopy.sponsorCommitted;
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
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>
          <span className="font-mono font-medium text-foreground">
            {formatCurrency(amountKobo / 100, currency)}
          </span>{' '}
          {copy.amountLabel.toLowerCase()}
        </p>
        <p>{fundingTypeLabel}</p>
      </CardContent>
    </Card>
  );
}
