import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid, PageShell, Stack } from '@/components/layout/content-primitives';
import { studentCopy } from '@/config/copy/student';

export default function DashboardProofLoading() {
  return (
    <PageShell width="default">
      <Stack gap="md">
        <header className="space-y-3">
          <Skeleton className="h-8 w-56 bg-muted dark:bg-muted" />
          <Skeleton className="h-5 w-80 bg-muted dark:bg-muted" />
        </header>

        <Grid cols={{ md: 2 }} gap="md">
          <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
            <CardHeader className="space-y-3">
              <Skeleton className="h-11 w-52 rounded-full bg-muted dark:bg-muted" />
              <Skeleton className="h-10 w-48 bg-muted dark:bg-muted" />
              <Skeleton className="h-5 w-full bg-muted dark:bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-2 w-full bg-muted dark:bg-muted" />
              <Skeleton className="h-14 w-full rounded-lg bg-muted dark:bg-muted" />
              <Skeleton className="h-14 w-full rounded-lg bg-muted dark:bg-muted" />
              <Skeleton className="h-14 w-full rounded-lg bg-muted dark:bg-muted" />
              <Skeleton className="h-14 w-full rounded-lg bg-muted dark:bg-muted" />
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
            <CardHeader className="space-y-3">
              <Skeleton className="h-11 w-56 rounded-full bg-muted dark:bg-muted" />
              <CardTitle className="sr-only">{studentCopy.proof.states.loadingTitle}</CardTitle>
              <Skeleton className="h-5 w-full bg-muted dark:bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl bg-muted dark:bg-muted" />
              <Skeleton className="h-28 w-full rounded-xl bg-muted dark:bg-muted" />
              <Skeleton className="h-36 w-full rounded-xl bg-muted dark:bg-muted" />
            </CardContent>
          </Card>
        </Grid>
      </Stack>
    </PageShell>
  );
}
