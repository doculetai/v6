import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { studentCopy } from '@/config/copy/student';

export default function DashboardProofLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-foreground dark:text-foreground md:text-5xl">
          {studentCopy.proof.states.loadingTitle}
        </h1>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
          {studentCopy.proof.states.loadingDescription}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr]">
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
      </div>
    </section>
  );
}
