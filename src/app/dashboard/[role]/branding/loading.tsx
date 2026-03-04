import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { partnerCopy } from '@/config/copy/partner';

export default function DashboardBrandingLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-foreground dark:text-foreground md:text-5xl">
          {partnerCopy.branding.states.loadingTitle}
        </h1>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground md:text-base">
          {partnerCopy.branding.states.loadingDescription}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-20 bg-muted dark:bg-muted" />
              <Skeleton className="h-4 w-72 bg-muted dark:bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg bg-muted dark:bg-muted" />
              <Skeleton className="h-4 w-56 bg-muted dark:bg-muted" />
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-32 bg-muted dark:bg-muted" />
              <Skeleton className="h-4 w-64 bg-muted dark:bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-md bg-muted dark:bg-muted" />
                <Skeleton className="h-10 w-28 rounded-lg bg-muted dark:bg-muted" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-28 bg-muted dark:bg-muted" />
              <Skeleton className="h-4 w-60 bg-muted dark:bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg bg-muted dark:bg-muted" />
              <Skeleton className="h-4 w-48 bg-muted dark:bg-muted" />
            </CardContent>
          </Card>

          <Skeleton className="h-11 w-36 rounded-lg bg-muted dark:bg-muted" />
        </div>

        <Card className="border-border bg-card/80 dark:border-border dark:bg-card/80">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-16 bg-muted dark:bg-muted" />
            <Skeleton className="h-4 w-52 bg-muted dark:bg-muted" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full rounded-xl bg-muted dark:bg-muted" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
