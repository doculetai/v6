import Link from 'next/link';

import { Warning } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { studentCopy } from '@/config/copy/student';

type Props = {
  sponsorName: string;
  setupHref: string;
};

export function SponsorWithdrawnCard({ sponsorName, setupHref }: Props) {
  const copy = studentCopy.sponsorWithdrawn;
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Warning
          weight="duotone"
          className="size-5 text-destructive"
          aria-hidden="true"
        />
        <CardTitle className="text-base text-destructive">{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {sponsorName} {copy.desc}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={setupHref}>{copy.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
