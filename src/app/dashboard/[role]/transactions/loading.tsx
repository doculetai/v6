import { TableSkeleton } from '@/components/skeletons';
import { Card, CardContent } from '@/components/ui/card';
import { sponsorCopy } from '@/config/copy/sponsor';

export default function TransactionsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground dark:text-foreground">
          {sponsorCopy.transactions.loading.title}
        </h1>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          {sponsorCopy.transactions.loading.description}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="border-border bg-card dark:border-border dark:bg-card">
            <CardContent className="space-y-3 px-5 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
              <div className="h-8 w-36 animate-pulse rounded bg-muted/60" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-3 dark:border-border dark:bg-card">
        <div className="h-10 w-full animate-pulse rounded bg-muted/60 md:max-w-sm" />
      </div>

      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
