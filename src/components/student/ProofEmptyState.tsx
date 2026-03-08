import { CheckSquare, ShieldWarning } from '@/components/icons';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { studentCopy } from '@/config/copy/student';
import { routes } from '@/config/routes';

export function ProofEmptyState() {
  return (
    <Card className="border-border bg-card/80 shadow-md backdrop-blur-sm dark:bg-card/90">
      <CardHeader className="items-center text-center">
        <div
          role="img"
          aria-label={studentCopy.proof.empty.illustrationLabel}
          className="relative flex size-20 items-center justify-center rounded-2xl border border-border bg-background/80 dark:bg-background/90"
        >
          <ShieldWarning className="size-6 text-primary" weight="duotone" aria-hidden="true" />
          <CheckSquare
            className="absolute -bottom-2 -right-2 size-5 rounded-full border border-border bg-card p-0.5 text-muted-foreground"
            weight="duotone"
            aria-hidden="true"
          />
        </div>

        <CardTitle className="text-xl text-card-foreground md:text-2xl">
          {studentCopy.proof.empty.title}
        </CardTitle>
        <CardDescription className="max-w-xl text-sm text-muted-foreground md:text-base">
          {studentCopy.proof.empty.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex justify-center">
        <Button asChild className="min-h-11 w-full sm:w-auto">
          <Link href={routes.dashboard.student.verification}>{studentCopy.proof.empty.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
